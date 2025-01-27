import {
  extractLinearGradientParamsFromTransform,
  getIdentifier,
  rgbToCSS,
} from '@/components/canvas/utils';
import { TLinearGradientPaintInline, TNode } from '@dyn/types/dtif';
import React from 'react';

const LinearGradientPaint: React.FC<TProps> = (props) => {
  const { paint, node, index } = props;
  const gradientDefinitionId = React.useMemo(
    () =>
      getIdentifier({
        id: node.id,
        index,
        type: 'paint',
        category: 'gradient-linear',
        isDefinition: true,
      }),
    [node.id]
  );
  const { start, end } = React.useMemo(
    () =>
      extractLinearGradientParamsFromTransform(
        node.width,
        node.height,
        paint.transform
      ),
    [node.width, node.height, paint.transform]
  );

  return (
    <g
      id={getIdentifier({
        id: node.id,
        index,
        type: 'paint',
        category: 'gradient-linear',
      })}
    >
      <rect
        width={node.width}
        height={node.height}
        fill={`url(#${gradientDefinitionId})`}
      />
      <defs>
        <linearGradient
          id={gradientDefinitionId}
          gradientUnits="userSpaceOnUse"
          x1={start.x}
          y1={start.y}
          x2={end.x}
          y2={end.y}
        >
          {paint.gradientStops.map((stop, i) => (
            <stop
              key={i}
              offset={stop.position !== 0 ? stop.position : undefined}
              stopColor={rgbToCSS(stop.color)}
            />
          ))}
        </linearGradient>
      </defs>
    </g>
  );
};

export default LinearGradientPaint;

type TProps = {
  node: TNode;
  index: number;
  paint: TLinearGradientPaintInline;
};
