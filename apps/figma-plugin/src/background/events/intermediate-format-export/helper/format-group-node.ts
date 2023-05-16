import {
  TGroupNode,
  TNode,
} from '../../../../shared/types/intermediate-format';
import { formatNode } from './format-node';

export async function formatGroupNode(node: GroupNode): Promise<TGroupNode> {
  return {
    type: 'GROUP',
    // BaseNode mixin
    id: node.id,
    name: node.name,
    // Children mixin
    children: (await Promise.all(node.children.map(formatNode))).filter(
      (node) => node != null
    ) as TNode[],
    // Layout mixin
    x: node.x,
    y: node.y,
    height: node.height,
    width: node.width,
    rotation: node.rotation,
    transform: node.relativeTransform,
    // Blend mixin
    blendMode: node.blendMode,
    opacity: node.opacity,
    isMask: node.isMask,
    effects: node.effects,
  };
}
