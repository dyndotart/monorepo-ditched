import { rgbToCSS } from '@/components/canvas/utils';
import { TNode, TSolidPaint } from '@pda/types/dtif';
import React from 'react';

const SolidPaint: React.FC<TProps> = (props) => {
  const { node, paint, index } = props;
  return (
    <rect
      id={`solid_paint-${index}-${node.id}`}
      width={node.width}
      height={node.height}
      style={{
        fill: rgbToCSS(paint.color),
        opacity: paint.opacity,
      }}
    />
  );
};

export default SolidPaint;

type TProps = {
  node: TNode;
  index: number;
  paint: TSolidPaint;
};