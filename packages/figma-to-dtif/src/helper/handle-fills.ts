import { TGradientPaint, TImagePaint, TPaint } from '@pda/dtif-types';
import { UploadStaticDataException } from '../exceptions';
import { ExportImageException } from '../exceptions/ExportImageException';
import { TFormatNodeConfig } from '../format-node-to-dtif';
import { logger } from '../logger';
import {
  TSVGCompatibleNode,
  convertNodeToSvg,
  getImageType,
  sha256,
} from '../utils';
import { convert2DMatrixTo3DMatrix } from './convert-2d-matrix-to-3d-matrix';
import { isNodeWithFills, isSVGCompatibleNode, isTextNode } from './is-node';

export async function handleFills(
  node: SceneNode,
  inputFills: Paint[],
  config: TFormatNodeConfig
): Promise<TPaint[]> {
  if (!Array.isArray(inputFills)) return [];
  const fills: TPaint[] = [];

  for (const fill of inputFills) {
    if (!fill.visible) continue;
    switch (fill.type) {
      case 'GRADIENT_ANGULAR':
      case 'GRADIENT_DIAMOND':
      case 'GRADIENT_LINEAR':
      case 'GRADIENT_RADIAL':
        fills.push(await handleGradientFill(node, fill, config));
        continue;
      case 'IMAGE':
        fills.push(await handleImageFill(node, fill, config));
        continue;
      case 'SOLID':
        fills.push(fill);
        continue;
      default:
      // do nothing
    }
  }

  return fills;
}

async function handleImageFill(
  node: SceneNode,
  fill: ImagePaint,
  config: TFormatNodeConfig
): Promise<TImagePaint> {
  const imageTransform =
    fill.imageTransform != null
      ? convert2DMatrixTo3DMatrix(fill.imageTransform)
      : undefined;

  // Export image
  const imageHash = fill.imageHash;
  if (imageHash == null)
    return {
      ...fill,
      imageTransform,
    };
  const imageData = await exportImage(node, imageHash);

  // Upload image data
  const key = await config.uploadStaticData(
    imageHash,
    imageData,
    getImageType(imageData) ?? undefined
  );
  if (key == null) {
    throw new UploadStaticDataException(
      `Failed to upload image with the hash ${key} to S3 bucket!`,
      node
    );
  }

  return {
    ...fill,
    imageHash: key,
    imageTransform,
  };
}

async function exportImage(node: SceneNode, imageHash: string) {
  let data: Uint8Array | null;
  try {
    data = (await figma.getImageByHash(imageHash)?.getBytesAsync()) ?? null;
  } catch (error) {
    let errorMessage: string;
    if (error instanceof Error) {
      errorMessage = error.message;
    } else {
      errorMessage = JSON.stringify(error);
    }
    throw new ExportImageException(
      `Failed to export node '${node.name}' as image: ${errorMessage}`,
      node
    );
  }
  if (data == null) {
    throw new ExportImageException(
      `Failed to export node '${node.name}' as image!`,
      node
    );
  }
  return data;
}

async function handleGradientFill(
  node: SceneNode,
  fill: GradientPaint,
  config: TFormatNodeConfig
): Promise<TGradientPaint> {
  let svgHash: string | null = null;

  // Format fill to SVG
  // TODO: Diamond and Angular Gradient doesn't work as SVG -> need to be exported as image
  if (
    config.gradientToSVG &&
    isNodeWithFills(node) &&
    isSVGCompatibleNode(node) &&
    node.fills !== figma.mixed
  ) {
    // Clone node with the relevant fill
    const clone = cloneToFillNode(node, [fill]);

    // Convert the node type to SVG
    const svgData = await convertNodeToSvg(clone as TSVGCompatibleNode);

    // Remove clone as its shown in editor
    clone.remove();

    // Upload SVG data
    svgHash = sha256(svgData);
    const key = await config.uploadStaticData(svgHash, svgData, {
      name: 'svg',
      mimeType: 'image/svg+xml',
      ending: '.svg',
    });
    if (key === null) {
      throw new UploadStaticDataException(`Failed to upload SVG data!`, node);
    }

    logger.success(
      `Formatted '${node.type}' fill of node '${node.name}' to SVG and uploaded content to S3 bucket under the key '${key}'`
    );
  }

  return {
    ...fill,
    gradientTransform: convert2DMatrixTo3DMatrix(fill.gradientTransform),
    svgHash: svgHash ?? undefined,
  };
}

function cloneToFillNode(node: TNodeWithFills, fills: Paint[]): SceneNode {
  const clone = isTextNode(node)
    ? createRectangleNodeFromTextNode(node)
    : node.clone();

  // Apply only relevant fill
  clone.fills = fills;

  // Reset transform
  clone.x = 0;
  clone.y = 0;
  clone.rotation = 0;
  clone.relativeTransform = [
    [1, 0, 0],
    [0, 1, 0],
  ];

  return clone;
}

function createRectangleNodeFromTextNode(node: TextNode): RectangleNode {
  const rect = figma.createRectangle();
  rect.x = node.x;
  rect.y = node.y;
  rect.resize(node.width, node.height);
  rect.rotation = node.rotation;
  rect.relativeTransform = node.relativeTransform;
  return rect;
}

export type TNodeWithFills =
  | RectangleNode
  | FrameNode
  | ComponentNode
  | InstanceNode
  | TextNode;
