import { TTextNode } from '@pda/types/dtif';
import { SVGAttributes } from 'react';
import reduceCSSCalc from 'reduce-css-calc';

export function mapTextAlignment(props: {
  textAlignHorizontal: TTextNode['textAlignHorizontal'];
  textAlignVertical: TTextNode['textAlignVertical'];
  width: number;
  height: number;
  lineHeight: SVGAttributes<SVGTSpanElement>['dy'];
  linesCount: number;
}): {
  textAnchor: string;
  translate: string;
  dominantBaseline: string;
} {
  const {
    textAlignHorizontal,
    textAlignVertical,
    width,
    height,
    linesCount,
    lineHeight,
  } = props;
  const totalTextHeight = `(${lineHeight} * ${linesCount})`;

  let textAnchor = '';
  let dominantBaseline = '';

  let translateX = '0px';
  let translateY = '0px';

  // Handle horizontal text alignment
  switch (textAlignHorizontal) {
    case 'CENTER':
      textAnchor = 'middle';
      translateX = reduceCSSCalc(`calc(${width}px / 2)`);
      break;
    case 'RIGHT':
      textAnchor = 'end';
      translateX = `${width}px`;
      break;
    case 'JUSTIFIED':
      textAnchor = 'middle'; // SVG doesn't support justified text, so default to center
      translateX = reduceCSSCalc(`calc(${width}px / 2)`);
      break;
    case 'LEFT':
      textAnchor = 'start';
      translateX = '0px';
    default:
      textAnchor = 'start';
      translateX = '0px';
      break;
  }

  // Handle vertical text alignment
  switch (textAlignVertical) {
    case 'CENTER':
      dominantBaseline = 'text-after-edge';
      translateY = reduceCSSCalc(
        `calc(${height}px / 2 - ${totalTextHeight} / 2)`
      );
      break;
    case 'BOTTOM':
      dominantBaseline = 'text-after-edge';
      translateY = reduceCSSCalc(
        `calc(${height}px - (${linesCount} * ${lineHeight}))`
      );
      break;
    case 'TOP':
      dominantBaseline = 'text-before-edge';
      translateY = reduceCSSCalc(`calc(-${lineHeight})`);
      break;
    default:
      dominantBaseline = 'text-before-edge';
      translateY = '0px';
      break;
  }

  return {
    textAnchor,
    dominantBaseline,
    translate: `translate(${translateX}, ${translateY})`,
  };
}