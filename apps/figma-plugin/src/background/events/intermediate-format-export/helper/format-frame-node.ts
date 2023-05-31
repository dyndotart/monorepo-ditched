import { TFrameNode } from '@pda/dtif-types';
import { TIntermediateFormatExportEvent } from '../../../../shared';
import { formatNode } from './format-node';
import { handleFills } from './handle-fills';

export async function formatFrameNode(
  node: FrameNode | ComponentNode | InstanceNode,
  config: TIntermediateFormatExportEvent['args']['config']
): Promise<TFrameNode> {
  return {
    type: 'FRAME',
    clipsContent: node.clipsContent,
    // BaseNode mixin
    id: node.id,
    name: node.name,
    // Children mixin
    children: await Promise.all(
      node.children.map((node) => formatNode(node, config, false))
    ),
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
    // RectangleCorner mixin
    bottomLeftRadius: node.bottomLeftRadius,
    bottomRightRadius: node.bottomRightRadius,
    topLeftRadius: node.topLeftRadius,
    topRightRadius: node.topRightRadius,
    // Fills mixin
    fills: await handleFills(node.fills as Paint[]),
  } as TFrameNode;
}
