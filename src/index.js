// @flow
import withSideEffect, { Context } from './VueSideEffect';
import type {
  HelmetPropsType,
  ClientStateType,
  ServerStateType,
  MapType,
  VNodeType,
  ValidTagsType,
  HelmetPropsArrayTypes,
  HelmetPropsObjectTypes,
} from './types';
import {
  convertVNodeDataToMap,
  handleClientStateChange,
  mapStateOnServer,
  reducePropsToState,
  warn,
} from './HelmetUtils';
import { VALID_TAG_NAMES } from './HelmetConstants';

export { ContextProvider as HelmetProvider } from './VueSideEffect';

export class HelmetContext extends Context<HelmetPropsType, ClientStateType, ServerStateType> {
  constructor() {
    super(
      reducePropsToState,
      handleClientStateChange,
      mapStateOnServer,
    );
  }

  // $FlowFixMe
  static get canUseDOM() {
    return Context.canUseDOM;
  }

  // $FlowFixMe
  static set canUseDOM(value) {
    Context.canUseDOM = value;
  }

  rewind(): ServerStateType {
    return (super.rewind() || mapStateOnServer({
      baseTag: [],
      bodyAttributes: {},
      htmlAttributes: {},
      linkTags: [],
      metaTags: [],
      noscriptTags: [],
      handleClientStateChange: () => {},
      scriptTags: [],
      styleTags: [],
      title: '',
      titleAttributes: {},
    }));
  }
}

type ArrayPropsMap = {| [HelmetPropsArrayTypes]: Array<MapType> |};

function mapNestedChildrenToProps(tag: ValidTagsType, nestedChildren: ?Array<VNodeType>): ?MapType {
  if (!nestedChildren || !nestedChildren.length) {
    return null;
  }
  if (nestedChildren.length !== 1) {
    throw new Error(`expected <${tag} /> element to have a single string as the default slot. Refer to our API for more information.`);
  }
  const [textNode] = nestedChildren;
  const { text } = textNode;
  switch (tag) {
    case 'script':
    case 'noscript':
      return {
        innerHTML: text,
      };
    case 'style':
      return {
        cssText: text,
      };
    default:
      throw new Error(`<${tag} /> elements are self-closing and can not contain children. Refer to our API for more information.`);
  }
}

function flattenArrayTypeChildren({
  tag,
  arrayTypeChildren,
  newChildData,
  nestedChildren,
}: {
  tag: HelmetPropsArrayTypes,
  arrayTypeChildren: ArrayPropsMap,
  newChildData: ?MapType,
  nestedChildren: ?Array<VNodeType>,
}): ArrayPropsMap {
  const result: ArrayPropsMap = ({ ...arrayTypeChildren }: any);
  const { innerHTML, ...rest } = newChildData || {};
  const nextData = tag === 'style' && innerHTML !== undefined
    ? { cssText: innerHTML, ...rest }
    : newChildData;
  result[tag] = [
    ...(arrayTypeChildren[tag] || []),
    {
      ...mapNestedChildrenToProps(tag, nestedChildren),
      ...nextData,
    },
  ];
  return result;
}

function extractTitle(titleChildren: ?Array<VNodeType>): string | void {
  return titleChildren && titleChildren.length
    ? titleChildren.map(child => child.text).filter(text => text != null).join('')
    : undefined;
}

function mapObjectTypeChildren({
  tag,
  newProps,
  newChildData,
  nestedChildren,
}: {
  tag: HelmetPropsObjectTypes,
  newProps: HelmetPropsType,
  newChildData: ?MapType,
  nestedChildren: ?Array<VNodeType>,
}): HelmetPropsType {
  const result: HelmetPropsType = ({ ...newProps }: any);
  switch (tag) {
    case 'title':
      result.title = extractTitle(nestedChildren);
      result.titleAttributes = { ...newChildData };
      break;
    case 'body':
      result.bodyAttributes = { ...newChildData };
      break;
    case 'html':
      result.htmlAttributes = { ...newChildData };
      break;
    default:
      result[tag] = { ...newChildData };
      break;
  }
  return result;
}

function mapArrayTypeChildrenToProps(
  arrayTypeChildren: ArrayPropsMap,
  newProps: HelmetPropsType,
): HelmetPropsType {
  const newFlattenedProps: HelmetPropsType = ({ ...newProps }: any);
  Object.keys(arrayTypeChildren).forEach((arrayChildName) => {
    const key: HelmetPropsArrayTypes = (arrayChildName: any);
    newFlattenedProps[key === 'style' ? 'styleTags' : key] = arrayTypeChildren[key];
  });

  return newFlattenedProps;
}

function warnOnInvalidChildren(
  child: VNodeType,
  nestedChildren: ?Array<VNodeType>,
): void {
  if (process.env.NODE_ENV === 'production') return;

  const tagName = child.tag || 'undefined';
  if (!VALID_TAG_NAMES.some(name => tagName === name)) {
    if (typeof child.type === 'function') {
      warn('You may be attempting to nest <Helmet> components within each other, which is not allowed. Refer to our API for more information.');
      return;
    }
    warn(`Only elements types ${VALID_TAG_NAMES.join(', ')} are allowed. Helmet does not support rendering <${child.tag || 'undefined'}> elements. Refer to our API for more information.`);
    return;
  }

  if (
    nestedChildren
      && nestedChildren.length
      && (
        nestedChildren.length !== 1
        || nestedChildren[0].tag !== undefined
      )
  ) {
    throw new Error(`Helmet expects a string as the default slot of <${tagName}>. Did you forget to wrap the slot in braces? ( <${tagName}>{\`\`}</${tagName}> ) Refer to our API for more information.`);
  }
}

function mapChildrenToProps(
  children: Array<VNodeType>,
  newProps: HelmetPropsType,
): HelmetPropsType {
  let arrayTypeChildren: ArrayPropsMap = ({}: any);
  let result: HelmetPropsType = newProps;
  children.forEach((child) => {
    const { children: nestedChildren, data: childData } = child;
    if (!nestedChildren && !childData) {
      return;
    }
    const newChildData = childData ? convertVNodeDataToMap(childData) : null;

    warnOnInvalidChildren(child, nestedChildren);
    const { tag } = child;
    switch (tag) {
      case 'link':
      case 'meta':
      case 'noscript':
      case 'script':
      case 'style':
        arrayTypeChildren = flattenArrayTypeChildren({
          tag,
          arrayTypeChildren,
          newChildData,
          nestedChildren,
        });
        break;
      case 'base':
      case 'body':
      case 'html':
      case 'title':
        result = mapObjectTypeChildren({
          tag,
          newProps: result,
          newChildData,
          nestedChildren,
        });
        break;
      default: break;
    }
  });

  result = mapArrayTypeChildrenToProps(
    arrayTypeChildren,
    result,
  );
  return result;
}

const NullComponent = {
  props: {
    base: {},
    bodyAttributes: {},
    defaultTitle: String,
    htmlAttributes: {},
    link: Array,
    meta: Array,
    noscript: Array,
    handleClientStateChange: Function,
    script: Array,
    styleTags: Array,
    title: String,
    titleAttributes: {},
    titleTemplate: String,
  },
  name: 'null-component',
  render: () => null,
};

const createHelmet = (contextKey?: string) => {
  const SideEffect = withSideEffect(NullComponent, contextKey);
  return {
    name: 'vue-helmet',
    props: {
      defaultTitle: String,
      titleTemplate: String,
      handleClientStateChange: Function,
    },
    render(h: *) {
      const children: ?Array<VNodeType> = this.$slots.default;
      let newProps: HelmetPropsType = this.$props;
      if (children) {
        newProps = mapChildrenToProps(children, newProps);
      }
      return h(SideEffect, { props: newProps }, this.$slots.default);
    },
  };
};

export const Helmet = createHelmet();
