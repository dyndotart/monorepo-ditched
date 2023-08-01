import { convert2DMatrixTo3DMatrix } from '@/helpers';
import { TEffect, TEllipseNode, TVectorPath } from '@pda/types/dtif';

export async function transformEllipseNode(
  node: EllipseNode
): Promise<TEllipseNode> {
  return {
    type: 'ELLIPSE',
    arcData: {
      endingAngle: node.arcData.endingAngle,
      startingAngle: node.arcData.startingAngle,
      innerRadiusRatio: node.arcData.innerRadius,
    },
    // Base node mixin
    id: node.id,
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
    fillGeometry: node.fillGeometry as TVectorPath[],
    strokeGeometry: node.strokeGeometry as TVectorPath[],
    // Blend mixin
    blendMode: node.blendMode,
    opacity: node.opacity,
    isMask: node.isMask,
    effects: node.effects as TEffect[],
    // Fills mixin
    fills: [] as string[], // Will be set by Composition class
  };
}