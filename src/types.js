// @flow
/* eslint-disable no-use-before-define */ // needed for recursive types
type ClassType = { [string]: string } | string | void | Array<ClassType>;

export type VNodeType = {
  tag: string | void;
  data: VNodeDataType | void;
  children: ?Array<VNodeType>;
  text: string | void;
  elm: Node | void;
  ns: string | void;
  key: string | number | void;
  parent: VNodeType | void; // component placeholder node};
}

type RecursiveMap = { [key: string]: string | RecursiveMap };
export type VNodeDataType = {
  key?: string | number;
  slot?: string;
  ref?: string;
  tag?: string;
  staticClass?: string;
  class?: ClassType;
  staticStyle?: { [key: string]: any };
  style?: Array<RecursiveMap> | RecursiveMap;
  props?: { [key: string]: any };
  attrs?: { [key: string]: any };
  domProps?: { [key: string]: any };
  hook?: { [key: string]: Function };
  on?: { [key: string]: Function | Function[] };
  nativeOn?: { [key: string]: Function | Function[] };
  show?: boolean;
  inlineTemplate?: {
    render: Function;
    staticRenderFns: Function[];
  };
}

export type VmType = {
  $vnode: VNodeType; // the placeholder node for the component in parent's render tree
}

export type MapType = { [string]: string | void };

export type ValidTagsType =
  | 'base'
  | 'body'
  | 'html'
  | 'link'
  | 'meta'
  | 'noscript'
  | 'script'
  | 'style'
  | 'title';

export type handleClientStateChangeType = (
  newState: ClientStateType,
  addedTags?: {[string]: Array<HTMLElement>},
  removedTags?: {[string]: Array<HTMLElement>},
) => void;

export type ClientStateType = {|
  baseTag: Array<MapType>,
  bodyAttributes: MapType,
  htmlAttributes: MapType,
  linkTags: Array<MapType>,
  metaTags: Array<MapType>,
  noscriptTags: Array<MapType>,
  handleClientStateChange: handleClientStateChangeType,
  scriptTags: Array<MapType>,
  styleTags: Array<MapType>,
  title?: string,
  titleAttributes: MapType,
|};

export type HelmetPropsArrayTypes =
  | 'link'
  | 'meta'
  | 'noscript'
  | 'script'
  | 'style';

export type HelmetPropsObjectTypes =
  | 'base'
  | 'body'
  | 'bodyAttributes'
  | 'html'
  | 'htmlAttributes'
  | 'title'
  | 'titleAttributes';

export type HelmetPropsType = {|
  base?: MapType,
  bodyAttributes?: MapType,
  defaultTitle?: string,
  htmlAttributes?: MapType,
  link?: Array<MapType>,
  meta?: Array<MapType>,
  noscript?: Array<MapType>,
  handleClientStateChange?: handleClientStateChangeType,
  script?: Array<MapType>,
  styleTags?: Array<MapType>,
  title?: string,
  titleAttributes?: MapType,
  titleTemplate?: string,
|};

type ComponentDefinition = {
  render: RenderFunctionType
};
type ChildrenType = Array<VNodeType | string> | string
export type CreateElement = (
  tagname: string | ComponentDefinition,
  options: ?(VNodeDataType | ChildrenType),
  children: ?ChildrenType,
) => VNodeType
export type RenderFunctionType = (CreateElement) => VNodeType | Array<VNodeType>;

export type ServerStateType = {|
  base: string,
  bodyAttributes: string,
  htmlAttributes: string,
  link: string,
  meta: string,
  noscript: string,
  script: string,
  style: string,
  title: string,
|};
