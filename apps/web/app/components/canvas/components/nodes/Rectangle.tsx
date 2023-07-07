import { transformToCSS } from '@/components/canvas/utils';
import { TRectangleNode } from '@pda/types/dtif';
import React from 'react';
import { Fills } from '../other';

const Rectangle: React.FC<TProps> = (props) => {
  const { node } = props;

  return (
    <g
      id={`rectangle-${node.id}`}
      style={{
        display: node.isVisible ? 'block' : 'none',
        borderRadius: `${node.topLeftRadius}px ${node.topRightRadius}px ${node.bottomRightRadius}px ${node.bottomLeftRadius}px`,
        opacity: node.opacity,
        overflow: 'hidden', // Fill is always clipped (clipsContent)
        pointerEvents: node.isLocked ? 'none' : 'auto',
        ...transformToCSS(node.relativeTransform),
      }}
    >
      <Fills node={node} />
    </g>
  );
};

export default Rectangle;

type TProps = {
  node: TRectangleNode;
};
