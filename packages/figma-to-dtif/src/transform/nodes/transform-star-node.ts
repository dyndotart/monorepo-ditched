import { convert2DMatrixTo3DMatrix } from '@/helpers';
import { TTransformNodeOptions } from '@/types';
import { TEffect, TStarNode, TVectorPath } from '@dyn/types/dtif';

export async function transformStarNode(
  node: StarNode,
  options: TTransformNodeOptions
): Promise<TStarNode> {
  const { geometry = true } = options;

  return {
    type: 'STAR',
    pointCount: node.pointCount,
    innerRadiusRation: node.innerRadius,
    // Base node mixin
    name: node.name,
    // Scene node mixin
    isLocked: node.locked,
    isVisible: node.visible,
    // Layout mixin
    height: node.height,
    width: node.width,
    relativeTransform: convert2DMatrixTo3DMatrix(node.relativeTransform),
    // Constraints mixin
    constraints: node.constraints,
    // Geometry mixin
    geometry: geometry
      ? {
          fill: node.fillGeometry as TVectorPath[],
          stroke: node.strokeGeometry as TVectorPath[],
        }
      : undefined,
    // Blend mixin
    blendMode: node.blendMode,
    opacity: node.opacity,
    isMask: node.isMask,
    effects: node.effects as TEffect[],
    // Fill mixin
    fill: { paintIds: [] }, // Will be set by Composition class
  };
}
