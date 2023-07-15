import { TD3Selection } from '@/types';
import { shortId } from '@pda/utils';
import { BaseType } from 'd3-selection';
import { CSSProperties } from 'react';
import { appendAttributes, appendCSS } from '../../helpers/d3';

export class D3Node<GElement extends BaseType = SVGElement> {
  private readonly _id: string;
  private readonly _type: string;
  private readonly _element: TD3Selection<GElement>;
  private readonly _children: Record<string, D3Node> = {};

  constructor(
    type: string,
    element: TD3Selection<GElement>,
    options: TD3NodeOptions = {}
  ) {
    const { id = shortId(), children = {} } = options;
    this._type = type;
    this._element = element;
    this._id = id;
    this._children = children;
  }

  public get id() {
    return this._id;
  }

  public get type() {
    return this._type;
  }

  public get element() {
    return this._element;
  }

  public get children() {
    return this.children;
  }

  public append(type: string, options: TD3NodeAppendOptions = {}) {
    const { id = shortId(), children, styles = {}, attributes = {} } = options;

    // Create element
    const element = this._element.append(type);
    appendAttributes(element, { ...attributes, id });
    appendCSS(element, styles);

    // Create node
    const node = new D3Node<SVGElement>(type, element, { id, children });
    this._children[id] = node;

    return node;
  }

  public getChildNodeByPath(path: string[]) {
    let node: D3Node = this as unknown as D3Node;
    for (const pathItem of path) {
      const nodeAtPathItem = node.getChildNodeById(pathItem);
      if (nodeAtPathItem != null) {
        node = nodeAtPathItem;
      } else {
        return null;
      }
    }
    return node;
  }

  public getChildNodeById(id: string) {
    const findNodeRecursively = (node: D3Node): D3Node | null => {
      if (node.id === id) {
        return node;
      } else {
        for (const childName in node.children) {
          const result = findNodeRecursively(node.children[childName]);
          if (result) {
            return result;
          }
        }
      }
      return null;
    };
    return findNodeRecursively(this as unknown as D3Node);
  }

  public updateAttributes(attributes: Record<string, any>) {
    appendAttributes(this._element, attributes);
  }

  public updateStyles(styles: CSSProperties) {
    appendCSS(this._element, styles);
  }
}

type TD3NodeOptions = {
  id?: string;
  children?: Record<string, D3Node>;
};

type TD3NodeAppendOptions = TD3NodeOptions & {
  attributes?: Record<string, any>;
  styles?: CSSProperties;
};