// @flow
import raf from 'raf';
import toStyle from 'to-style';
import cs from 'classnames';
import escapeHtml from 'escape-html';

import {
  ATTRIBUTE_NAMES,
  HELMET_ATTRIBUTE,
  HELMET_PROPS,
  SELF_CLOSING_TAGS,
} from './HelmetConstants';
import { updateTitle, updateTags, updateAttributes } from './updateDocument';

import type {
  HelmetPropsType,
  MapType,
  ClientStateType,
  ServerStateType,
  VNodeDataType,
  handleClientStateChangeType,
} from './types';

/* eslint-disable no-console */
const warn = (msg: string): void => {
  if (console && typeof console.warn === 'function') console.warn(msg);
};
/* eslint-enable no-console */
const exceptions = [
  'defaultTitle',
  'titleTemplate',
  'handleClientStateChange',
];
function getInnermostProperty(propsList: Array<HelmetPropsType>, property: string): * {
  for (let i = propsList.length - 1; i >= 0; i -= 1) {
    const props = propsList[i];

    const prop = props[property];
    if (exceptions.indexOf(property) !== -1) {
      if (prop !== undefined) return prop;
    } else if ({}.hasOwnProperty.call(props, property)) {
      return props[property];
    }
  }

  return null;
}

function getTitleFromPropsList(propsList: Array<HelmetPropsType>): string | void {
  const innermostTitle = getInnermostProperty(propsList, 'title');
  const innermostTemplate = getInnermostProperty(
    propsList,
    HELMET_PROPS.TITLE_TEMPLATE,
  );

  if (innermostTemplate && innermostTitle) {
    // use function arg to avoid need to escape $ characters
    return innermostTemplate.replace(/%s/g, () => innermostTitle);
  }

  const innermostDefaultTitle = getInnermostProperty(
    propsList,
    HELMET_PROPS.DEFAULT_TITLE,
  );

  return innermostTitle == null
    ? (innermostDefaultTitle || undefined)
    : innermostTitle;
}

const getHandleClientStateChange =
(propsList: Array<HelmetPropsType>): handleClientStateChangeType => (
  getInnermostProperty(propsList, HELMET_PROPS.HANDLE_CHANGE_CLIENT_STATE)
  || (() => {})
);

function getAttributesFromPropsList(tagType: string, propsList: Array<HelmetPropsType>) {
  return propsList
    .filter(props => props[tagType] !== undefined)
    .map(props => props[tagType])
    .reduce((tagAttrs, current) => ({ ...tagAttrs, ...current }), {});
}

function getBaseTagFromPropsList(
  primaryAttributes: Array<string>,
  propsList: Array<HelmetPropsType>,
): Array<MapType> {
  return propsList
    .map(props => props.base)
    .filter(b => b)
    .reverse()
    .reduce((innermostBaseTag, tag) => {
      if (!innermostBaseTag.length && tag) {
        const keys = Object.keys(tag);

        for (let i = 0; i < keys.length; i += 1) {
          const attributeKey = keys[i];
          const lowerCaseAttributeKey = attributeKey.toLowerCase();

          if (
            primaryAttributes.indexOf(lowerCaseAttributeKey) !== -1
            && tag[lowerCaseAttributeKey]
          ) {
            return innermostBaseTag.concat(tag);
          }
        }
      }
      return innermostBaseTag;
    }, []);
}

function getTagsFromPropsList(
  tagName: string,
  primaryAttributes: Array<string>,
  propsList: Array<HelmetPropsType>,
): Array<MapType> {
  // Calculate list of tags, giving priority innermost component (end of the propslist)
  const approvedSeenTags = {};

  return propsList
    .map(props => props[tagName])
    .filter(tag => Array.isArray(tag))
    .reverse()
    .reduce((approvedTags, instanceTags) => {
      const instanceSeenTags = {};
      instanceTags
        .filter((data) => {
          const tag = {
            ...data,
            ...data.attrs,
            ...data.domProps,
          };
          let primaryAttributeKey;
          const keys = Object.keys(tag);
          keys.forEach((attributeKey) => {
            const lowerCaseAttributeKey = attributeKey.toLowerCase();

            // Special rule with link tags, since rel and href are both primary tags
            // rel takes priority
            if (
              primaryAttributes.indexOf(lowerCaseAttributeKey) !== -1
              && !(
                primaryAttributeKey === 'rel'
                && tag[primaryAttributeKey].toLowerCase() === 'canonical'
              ) && !(
                lowerCaseAttributeKey === 'rel'
                && tag[lowerCaseAttributeKey].toLowerCase() === 'stylesheet'
              )
            ) {
              primaryAttributeKey = lowerCaseAttributeKey;
            }
            // Special case for innerHTML which doesn't work lowercased
            if (
              primaryAttributes.indexOf(attributeKey) !== -1
              && (
                attributeKey === 'innerHTML'
                || attributeKey === 'cssText'
                || attributeKey === 'itemProp'
              )
            ) {
              primaryAttributeKey = attributeKey;
            }
          });

          if (!primaryAttributeKey || !tag[primaryAttributeKey]) {
            return false;
          }

          const value = tag[primaryAttributeKey].toLowerCase();

          if (!approvedSeenTags[primaryAttributeKey]) {
            approvedSeenTags[primaryAttributeKey] = {};
          }

          if (!instanceSeenTags[primaryAttributeKey]) {
            instanceSeenTags[primaryAttributeKey] = {};
          }

          if (!approvedSeenTags[primaryAttributeKey][value]) {
            instanceSeenTags[primaryAttributeKey][value] = true;
            return true;
          }

          return false;
        })
        .reverse()
        .forEach(tag => approvedTags.push(tag));

      // Update seen tags with tags from this instance
      const keys = Object.keys(instanceSeenTags);
      keys.forEach((attributeKey) => {
        const tagUnion = {
          ...approvedSeenTags[attributeKey],
          ...instanceSeenTags[attributeKey],
        };
        approvedSeenTags[attributeKey] = tagUnion;
      });
      return approvedTags;
    }, [])
    .reverse();
}

const commitTagChanges = (newState: ClientStateType, cb?: () => void) => {
  const {
    baseTag,
    bodyAttributes,
    htmlAttributes,
    linkTags,
    metaTags,
    noscriptTags,
    handleClientStateChange,
    scriptTags,
    styleTags,
    title,
    titleAttributes,
  } = newState;
  updateAttributes('body', bodyAttributes);
  updateAttributes('html', htmlAttributes);

  updateTitle(title, titleAttributes);

  const tagUpdates = {
    baseTag: updateTags('base', baseTag),
    linkTags: updateTags('link', linkTags),
    metaTags: updateTags('meta', metaTags),
    noscriptTags: updateTags('noscript', noscriptTags),
    scriptTags: updateTags('script', scriptTags),
    styleTags: updateTags('style', styleTags),
  };

  const addedTags = {};
  const removedTags = {};

  Object.keys(tagUpdates).forEach((tagType) => {
    const { newTags, oldTags } = tagUpdates[tagType];

    if (newTags.length) {
      addedTags[tagType] = newTags;
    }
    if (oldTags.length) {
      removedTags[tagType] = tagUpdates[tagType].oldTags;
    }
  });

  if (cb) cb();

  handleClientStateChange(newState, addedTags, removedTags);
};

function generateElementAttributesAsString(attributes: MapType): string {
  return Object
    .keys(attributes)
    .map(key => (
      typeof attributes[key] !== 'undefined'
        ? `${key}="${escapeHtml(attributes[key])}"`
        : `${key}`
    )).join(' ');
}

const generateTitleAsString = (
  title: string,
  attributes: MapType,
) => {
  const attributeString = generateElementAttributesAsString(attributes);
  const attrs = attributeString ? ` ${attributeString}` : '';
  return `<title ${HELMET_ATTRIBUTE}="true"${attrs}>${escapeHtml(title)}</title>`;
};

const generateTagsAsString = (type: string, tags: Array<MapType>): string =>
  tags.map((tag) => {
    let attributeHtml = Object.keys(tag)
      .filter(attribute => attribute !== 'innerHTML' && attribute !== 'cssText')
      .map(attribute => (
        tag[attribute] === undefined
          ? attribute
          : `${attribute}="${escapeHtml(tag[attribute])}"`
      )).join(' ');
    if (attributeHtml) attributeHtml = ` ${attributeHtml}`;
    const isSelfClosing = SELF_CLOSING_TAGS.indexOf(type) === -1;

    return `<${type} ${HELMET_ATTRIBUTE}="true"${attributeHtml}${
      isSelfClosing
        ? '/>'
        : `>${tag.innerHTML || tag.cssText || ''}</${type}>`
    }`;
  }).join('');

function convertVNodeDataToMap(data: VNodeDataType, initAttributes?: VNodeDataType = {}): MapType {
  const {
    style, class: className, attrs, domProps,
  } = data;
  const {
    style: initStyle, class: initClassName, attrs: initAttrs, domProps: initDomProps,
  } = initAttributes;
  const {
    cssText, innerHTML,
  } = { ...initDomProps, ...domProps };
  const result = {};
  if (style || initStyle) result.style = toStyle.string(style || initStyle);
  if (innerHTML) result.innerHTML = innerHTML;
  if (cssText) result.cssText = cssText;
  if (className || initClassName) result.class = cs(className || initClassName);
  return {
    ...result,
    ...initAttrs,
    ...attrs,
  };
}

const handleClientStateChange = (() => {
  let animationFrame = null;
  return (newState: ClientStateType): void => {
    if (animationFrame) {
      raf.cancel(animationFrame);
    }
    animationFrame = raf(() => {
      commitTagChanges(newState, () => {
        animationFrame = null;
      });
    });
  };
})();

const mapStateOnServer = ({
  baseTag,
  bodyAttributes,
  htmlAttributes,
  linkTags,
  metaTags,
  noscriptTags,
  scriptTags,
  styleTags,
  title = '',
  titleAttributes,
}: ClientStateType): ServerStateType => ({
  base: generateTagsAsString('base', baseTag),
  bodyAttributes: generateElementAttributesAsString(bodyAttributes),
  htmlAttributes: generateElementAttributesAsString(htmlAttributes),
  link: generateTagsAsString('link', linkTags),
  meta: generateTagsAsString('meta', metaTags),
  noscript: generateTagsAsString('noscript', noscriptTags),
  script: generateTagsAsString('script', scriptTags),
  style: generateTagsAsString('style', styleTags),
  title: generateTitleAsString(title, titleAttributes),
});
const reducePropsToState = (propsList: Array<HelmetPropsType>): ClientStateType => ({
  baseTag: getBaseTagFromPropsList(['href'], propsList),
  bodyAttributes: getAttributesFromPropsList(ATTRIBUTE_NAMES.BODY, propsList),
  htmlAttributes: getAttributesFromPropsList(ATTRIBUTE_NAMES.HTML, propsList),
  linkTags: getTagsFromPropsList(
    'link',
    ['rel', 'href'],
    propsList,
  ),
  metaTags: getTagsFromPropsList(
    'meta',
    ['name', 'charset', 'http-equiv', 'property', 'itemprop'],
    propsList,
  ),
  noscriptTags: getTagsFromPropsList(
    'noscript',
    ['innerHTML'],
    propsList,
  ),
  handleClientStateChange: getHandleClientStateChange(propsList),
  scriptTags: getTagsFromPropsList(
    'script',
    ['src', 'innerHTML'],
    propsList,
  ),
  styleTags: getTagsFromPropsList(
    'styleTags',
    ['cssText'],
    propsList,
  ),
  title: getTitleFromPropsList(propsList),
  titleAttributes: getAttributesFromPropsList(
    ATTRIBUTE_NAMES.TITLE,
    propsList,
  ),
});


export {
  convertVNodeDataToMap,
  handleClientStateChange,
  mapStateOnServer,
  reducePropsToState,
  warn,
};
