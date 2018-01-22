// @flow
import { HELMET_ATTRIBUTE } from './HelmetConstants';
import type { MapType } from './types';

export function updateAttributes(
  tagName: string,
  attributes: MapType,
): void {
  const elementTag = document.getElementsByTagName(tagName)[0];

  if (!elementTag) {
    return;
  }

  const helmetAttributeString = elementTag.getAttribute(HELMET_ATTRIBUTE);
  const helmetAttributes = helmetAttributeString
    ? helmetAttributeString.split(',')
    : [];

  const attributesToRemove = new Set(helmetAttributes);

  const keys = Object.keys(attributes);

  keys.forEach((attribute) => {
    const value: string | void = attributes[attribute];

    if (value == null) return;

    if (elementTag.getAttribute(attribute) !== value) {
      elementTag.setAttribute(attribute, value);
    }

    if (helmetAttributes.indexOf(attribute) === -1) {
      helmetAttributes.push(attribute);
    }

    attributesToRemove.delete(attribute);
  });

  attributesToRemove.forEach(attr => elementTag.removeAttribute(attr));

  if (helmetAttributes.length === attributesToRemove.size) {
    elementTag.removeAttribute(HELMET_ATTRIBUTE);
    return;
  }
  const joinedKeys = keys.sort().join(',');
  if (helmetAttributeString !== joinedKeys) {
    elementTag.setAttribute(HELMET_ATTRIBUTE, joinedKeys);
  }
}

export function updateTitle(
  title: string | void,
  attributes: MapType,
): void {
  if (title !== undefined && document.title !== title) {
    document.title = title;
  }
  updateAttributes('title', attributes);
}

type IEElement = { styleSheet?: { cssText: string } };

export function updateTags(
  type: string,
  tags?: Array<MapType>,
): { oldTags: Array<HTMLElement>, newTags: Array<HTMLElement> } {
  const headElement = document.head || document.querySelector('head');
  if (!headElement) throw new Error('document is missing head');
  const tagNodes = headElement.querySelectorAll(`${type}[${HELMET_ATTRIBUTE}]`);
  const oldTags = Array.prototype.slice.call(tagNodes);
  const newTags = [];
  let indexToDelete;

  if (tags) {
    tags.forEach((tag) => {
      const newElement = document.createElement(type);
      Object.entries(tag).forEach(([rawAttr, rawValue]) => {
        const value: string = (rawValue: any);
        const attribute: string = (rawAttr : any);
        if (attribute === 'innerHTML') {
          newElement.innerHTML = ((value: any): string);
        } else if (attribute === 'cssText') {
          const { styleSheet } = (newElement: IEElement);
          if (styleSheet) {
            styleSheet.cssText = value;
          } else {
            newElement.appendChild(document.createTextNode(value));
          }
        } else {
          newElement.setAttribute(attribute, value);
        }
      });
      newElement.setAttribute(HELMET_ATTRIBUTE, 'true');

      // Remove a duplicate tag from domTagstoRemove, so it isn't cleared.
      if (
        oldTags.some((existingTag, index) => {
          indexToDelete = index;
          return newElement.isEqualNode(existingTag);
        })
      ) {
        oldTags.splice(indexToDelete, 1);
      } else {
        newTags.push(newElement);
      }
    });
  }

  oldTags.forEach((tag) => {
    const { parentNode } = tag;
    if (!parentNode) throw new Error('attempted to remove tag without parent node');
    else parentNode.removeChild(tag);
  });
  newTags.forEach(tag => headElement.appendChild(tag));

  return {
    oldTags,
    newTags,
  };
}
