import { MixedNotSupportedException } from '@/exceptions';
import { convert2DMatrixTo3DMatrix, sha256, uploadStaticData } from '@/helpers';
import { logger } from '@/logger';
import {
  TContentType,
  TTransformNodeOptions,
  TTypeFaceWithoutContent,
} from '@/types';
import { TEffect, TTextNode, TVectorPath } from '@pda/types/dtif';
import { extractErrorData } from '@pda/utils';

export async function transformTextNode(
  node: TextNode,
  options: TTransformNodeOptions
): Promise<TTextNode> {
  const { font: fontOptions, geometry = true } = options;

  const fontName = excludeMixed('fontName', node);
  const fontWeight = excludeMixed('fontWeight', node);
  const fontSize = excludeMixed('fontSize', node);
  const letterSpacing = excludeMixed('letterSpacing', node);
  const lineHeight = excludeMixed('lineHeight', node);

  // Construct type face
  const typeFace: TTypeFaceWithoutContent = {
    family: fontName.family,
    styleName: fontName.style,
    fontWeight,
    style: fontName.style.toLowerCase().includes('italic')
      ? 'italic'
      : 'regular',
  };

  // Try to resolve font content based on type face
  const { hash, content } = await resolveFontContent(
    node,
    typeFace,
    fontOptions
  );

  return {
    type: 'TEXT',
    textAlignHorizontal: node.textAlignHorizontal,
    textAlignVertical: node.textAlignVertical,
    fontSize,
    letterSpacing,
    lineHeight,
    characters: node.characters,
    font: {
      ...typeFace,
      hash: hash ?? undefined,
      content: content ?? undefined,
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
    // Effect mixin
    effects: node.effects as TEffect[],
    // Fill mixin
    fill: { paintIds: [] }, // Will be set by Composition class
  };
}

async function resolveFontContent(
  node: TextNode,
  typeFace: TTypeFaceWithoutContent,
  options: TTransformNodeOptions['font'] = {}
): Promise<{
  hash: string | null;
  content: Uint8Array | string | null;
}> {
  const {
    exportOptions: {
      inline = true,
      uploadStaticData: uploadStaticDataCallback,
    } = {},
    resolveFontContent: resolveFontContentCallback,
  } = options;
  let content: Uint8Array | string | null = null;
  let contentType: TContentType | null = null;
  let hash: string | null = null;

  if (typeof resolveFontContentCallback !== 'function') {
    return { content, hash };
  }

  // Try to resolve font as Uint8Array
  try {
    const font = await resolveFontContentCallback(typeFace);
    content = font.content;
    contentType = font.contentType;
  } catch (error) {
    const errorData = extractErrorData(error);
    logger.error(
      `Failed to resolve font content by error: ${errorData.message}`
    );
  }

  if (content != null) {
    hash = sha256(content);

    // Upload font content if it could be resolved
    // and shouldn't be put inline
    if (uploadStaticDataCallback != null && !inline) {
      const uploadResponse = await uploadStaticData(
        uploadStaticDataCallback,
        content,
        {
          node,
          key: hash,
          contentType: contentType ?? undefined,
        }
      );
      hash = uploadResponse.key;
      content = uploadResponse.url ?? null;
    }
  }

  return { content, hash };
}

function excludeMixed<T extends keyof TextNode>(
  property: T,
  node: TextNode
): TExcludeMixed<TextNode[T]> {
  const value = node[property];
  if (value === figma.mixed) {
    throw new MixedNotSupportedException(property, node);
  }
  return value as TExcludeMixed<TextNode[T]>;
}

type TExcludeMixed<T> = T extends PluginAPI['mixed'] ? never : T;
