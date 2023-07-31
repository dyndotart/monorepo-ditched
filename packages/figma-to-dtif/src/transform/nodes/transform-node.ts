import { Composition } from '@/Composition';
import {
  IncompatibleSVGNodeException,
  InvisibleNodeException,
  UnsupportedFigmaNodeException,
} from '@/exceptions';
import { isSVGCompatibleNode } from '@/helpers';
import { TTransformNodeOptions } from '@/types';
import { TNode, TSVGNode } from '@pda/types/dtif';
import { transformFrameNode } from './transform-frame-node';
import { transformToSVGNode } from './transform-to-svg-node';

export async function transformNode(
  node: SceneNode,
  options: TTransformNodeOptions
) {
  const {
    svg: { frameToSVG = true, identifierRegex: svgIdentifierRegex = null } = {},
    ignoreInvisible = true,
  } = options;
  let transformedNode: TNode;

  // Check whether Figma node is supported by DTIF
  if (!Composition.isSupportedNodeType(node.type)) {
    throw new UnsupportedFigmaNodeException(
      `The Figma node '${node.name}' of the type '${node.type}' is not supported yet!`,
      node
    );
  }

  // Check whether node is visible
  const isVisible = node.visible;
  if (!isVisible && ignoreInvisible) {
    throw new InvisibleNodeException(
      `Node '${node.name}' couldn't be exported because it is invisible.`,
      node
    );
  }
  // If invisible node to be transformed,
  // make it visible during transform to avoid potential errors (e.g. SVG export)
  else if (!isVisible) {
    node.visible = true;
  }

  // Transform figma node to DTIF
  try {
    if (
      shouldTransformNodeToSVG(node, {
        svgIdentifierRegex,
        frameToSVG,
      })
    ) {
      transformedNode = await transformFigmaNodeToSVG(node, options);
    } else {
      transformedNode = await transformFigmaNode(node, options);
    }
  } catch (error) {
    node.visible = isVisible; // Reset visibility
    throw error;
  }

  node.visible = isVisible; // Reset visibility
  return transformedNode;
}

async function transformFigmaNode(
  node: SceneNode,
  options: TTransformNodeOptions
): Promise<TNode> {
  switch (node.type) {
    case 'FRAME':
    case 'COMPONENT':
    case 'INSTANCE':
      return transformFrameNode(node);
    case 'GROUP':
    case 'TEXT':
    case 'RECTANGLE':
    case 'ELLIPSE':
    case 'POLYGON':
    case 'STAR':
    case 'LINE':
    case 'VECTOR':
    case 'BOOLEAN_OPERATION':
    default:
      throw new UnsupportedFigmaNodeException(
        `The Figma node '${node.type}' is not yet supported!`,
        node
      );
  }
}

async function transformFigmaNodeToSVG(
  node: SceneNode,
  options: TTransformNodeOptions
): Promise<TSVGNode> {
  if (!isSVGCompatibleNode(node)) {
    throw new IncompatibleSVGNodeException(
      `Node '${node.name}' can not be transformed to SVG!`,
      node
    );
  }
  const { svg, ...rest } = options;
  return transformToSVGNode(node, {
    ...rest,
    svg: {
      ...svg,
      exportOptions: {
        ...svg?.exportOptions,
        inline: svg?.inline ?? true,
        format: 'SVG',
      },
    },
  });
}

function shouldTransformNodeToSVG(
  node: SceneNode,
  config: {
    svgIdentifierRegex: string | null;
    frameToSVG: boolean;
  }
): boolean {
  const { svgIdentifierRegex, frameToSVG } = config;
  const isFrameLikeNode =
    ['FRAME', 'COMPONENT', 'INSTANCE'].indexOf(node.type) !== -1;

  // Check if the node name matches SVG export identifier regex
  const matchesSvgExportIdentifier = matchesSVGExportIdentifierRegex(
    svgIdentifierRegex,
    node
  );

  // Check if frame node should be exported as SVG
  const shouldExportFrameAsSVG = isFrameLikeNode && frameToSVG;

  return matchesSvgExportIdentifier || shouldExportFrameAsSVG;
}

function matchesSVGExportIdentifierRegex(
  svgIdentifierRegex: string | null,
  node: SceneNode
): boolean {
  if (svgIdentifierRegex != null) {
    const svgExportIdentifier = new RegExp(svgIdentifierRegex);
    return svgExportIdentifier.test(node.name);
  }
  return false;
}
