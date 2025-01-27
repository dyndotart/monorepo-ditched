import { apiClient } from '@/api';
import { toArrayBuffer } from '@/helpers';
import { TTypeface } from '@dyn/types/dtif';
import { Font, TFontOptions } from './Font';
import { TextSegmenter } from './TextSegmenter';
import { Typeface } from './Typeface';

export class FontManager {
  private readonly _typefaces: Record<string, Typeface> = {};
  private readonly _fonts: Record<string, Font> = {};
  private readonly _fontNameToIdMap: Map<string, string> = new Map();

  private readonly _defaultTextSegmenter: TextSegmenter;

  constructor(options: TFontManagerOptions = {}) {
    const { textSegmenter = new TextSegmenter() } = options;
    this._defaultTextSegmenter = textSegmenter;
  }

  public setTypeface(typeface: Typeface) {
    this._typefaces[typeface.id] = typeface;
  }

  public getTypefaceById(id: string): Typeface | null {
    return this._typefaces[id] ?? null;
  }

  public setFont(font: Font) {
    this._fonts[font.id] = font;
    this._fontNameToIdMap.set(font.name, font.id);
  }

  public createFont(name: string, options: TFontOptions = {}): Font {
    // Check whether font with the name already exists
    const fontId = this._fontNameToIdMap.get(name);
    if (fontId != null) {
      const font = this._fonts[fontId];
      if (font != null) {
        return font;
      }
    }

    // Create new font
    const { textSegmenter = this._defaultTextSegmenter, ...restOptions } =
      options;
    const font = new Font(name, this, {
      ...restOptions,
      textSegmenter,
    });
    this.setFont(font);
    return font;
  }

  public getFontById(id: string): Font | null {
    return this._fonts[id] ?? null;
  }

  public async loadTypeface(
    typeface: TTypeface & { id?: string }
  ): Promise<Typeface | null> {
    const font = this.createFont(typeface.family);
    let content: ArrayBuffer | null = null;

    // Try to parse content as ArrayBuffer
    if (typeof typeface.content === 'string') {
      const response = await apiClient.get(typeface.content, {
        parseAs: 'arrayBuffer',
      });
      if (!response.isError) {
        content = response.data;
      }
    } else if (Array.isArray(typeface.content)) {
      content = toArrayBuffer(typeface.content);
    }
    if (!(content instanceof ArrayBuffer)) {
      return null;
    }

    return font.createTypeface(
      content,
      {
        style: typeface.style,
        weight: typeface.weight,
      },
      { displayName: typeface.name, id: typeface.id }
    );
  }
}

type TFontManagerOptions = {
  textSegmenter?: TextSegmenter;
};
