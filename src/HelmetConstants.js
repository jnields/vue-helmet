// @flow
import type { ValidTagsType } from './types';

export const ATTRIBUTE_NAMES = {
  BODY: 'bodyAttributes',
  HTML: 'htmlAttributes',
  TITLE: 'titleAttributes',
};

export const VALID_TAG_NAMES : Array<ValidTagsType> = [
  'base',
  'body',
  'html',
  'link',
  'meta',
  'noscript',
  'script',
  'style',
  'title',
];

export const HELMET_PROPS = {
  DEFAULT_TITLE: 'defaultTitle',
  HANDLE_CHANGE_CLIENT_STATE: 'handleClientStateChange',
  TITLE_TEMPLATE: 'titleTemplate',
};

export const SELF_CLOSING_TAGS = [
  'noscript',
  'script',
  'style',
];

export const HELMET_ATTRIBUTE = 'data-vue-helmet';
