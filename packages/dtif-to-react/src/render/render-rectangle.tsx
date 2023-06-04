import { TRectangleNode } from '@pda/dtif-types';
import { getIdentifier } from '../helper';
import {
  figmaBlendModeToCSS,
  figmaEffectToCSS,
  figmaFillToCSS,
  figmaTransformToCSS,
} from '../to-css';

export async function renderRectangle(
  node: TRectangleNode
): Promise<JSX.Element> {
  return (
    <div
      {...getIdentifier(node)}
      style={{
        position: 'absolute',
        top: 0,
        left: 0,
        width: node.width,
        height: node.height,
        borderRadius: `${node.topLeftRadius}px ${node.topRightRadius}px ${node.bottomRightRadius}px ${node.bottomLeftRadius}px`,
        opacity: node.opacity,
        overflow: 'hidden', // Fill is always clipped (clipsContent)
        ...figmaTransformToCSS(node),
        ...figmaEffectToCSS(node.effects),
        ...figmaBlendModeToCSS(node.blendMode),
      }}
    >
      {node.fills.map((fill, i) => (
        <div
          key={i}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            ...figmaFillToCSS(fill, node),
          }}
        />
      ))}
    </div>
  );
}