import { TPaintMixin } from '@pda/types/dtif';
import { figmaRGBToCss } from '../figma-rgb-to-css';

export function handleSolidFill(fill: TPaintMixin): React.CSSProperties {
  return {
    backgroundColor: figmaRGBToCss(fill.color),
  };
}