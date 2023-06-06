import { renderNode, renderRelativeParent } from '@pda/dtif-to-react';
import { TNode } from '@pda/dtif-types';
import { isFrameNode } from '@pda/figma-to-dtif';
import clsx from 'clsx';
import React from 'react';
import { JSONTree } from 'react-json-tree';
import { Link } from 'react-router-dom';
import { TOnSelectFrameEvent } from '../../../shared';
import { copyToClipboard } from '../../core';
import { TUIHandler, uiHandler } from '../../ui-handler';
import './styles.css';
import threezerotwofourTheme from './threezerotwofour.theme';

const DTIFExport: React.FC = () => {
  const [selectedFrames, setSelectedFrames] = React.useState<
    TOnSelectFrameEvent['args']['selected'] | null
  >(null);

  const [
    isLoadingIntermediateFormatExport,
    setIsLoadingIntermediateFormatExport,
  ] = React.useState(false);

  const [showContent, setShowContent] = React.useState<
    'dtif' | 'figma' | 'preview'
  >('preview');

  const [node, setNode] = React.useState<TNode | null>(null);
  const [renderedNode, setRenderedNode] =
    React.useState<React.ReactNode | null>(null);

  // Register events
  React.useEffect(() => {
    uiHandler.registerEvent({
      type: 'figma.message',
      key: 'on-select-frame-event',
      callback: async (instance: TUIHandler, args) => {
        console.log('onselect', { args });
        if (args.selected != null && args.selected.length > 0) {
          setSelectedFrames(args.selected);
        } else {
          setSelectedFrames(null);
        }
      },
    });

    uiHandler.registerEvent({
      type: 'figma.message',
      key: 'intermediate-format-export-result-event',
      callback: async (instance: TUIHandler, args) => {
        setIsLoadingIntermediateFormatExport(false);
        if (args.type === 'success') {
          setNode(args.content);
          copyToClipboard(JSON.stringify(args.content));
        }
      },
    });
  }, []);

  React.useEffect(() => {
    const renderNodeAsJSX = async () => {
      if (node != null) {
        const renderedNode = await (isFrameNode(node)
          ? renderRelativeParent(node, 0.2)
          : renderNode(node));
        setRenderedNode(renderedNode);
      }
    };
    renderNodeAsJSX();
  }, [node]);

  return (
    <div className="mx-4 mb-4">
      <div className="breadcrumbs text-sm">
        <ul>
          <li>
            <Link to="/">Home</Link>
          </li>
          <li>FIF</li>
        </ul>
      </div>
      <div className="space-y-4">
        <h1 className="text-2xl font-bold">Intermediate Export</h1>

        {/* TODO: proper loading indicator */}
        {isLoadingIntermediateFormatExport ? (
          <div>Loading...</div>
        ) : (
          <button
            className="btn"
            onClick={() => {
              if (selectedFrames != null) {
                setIsLoadingIntermediateFormatExport(true);
                uiHandler.postMessage('intermediate-format-export-event', {
                  selectedElements: selectedFrames,
                  config: {
                    svgExportIdentifierRegex: '_svg$',
                    frameToSVG: false,
                  },
                });
              }
            }}
          >
            Export Frame
            {selectedFrames != null && selectedFrames.length > 0
              ? ` [${selectedFrames[0].name}] (${selectedFrames.length})`
              : ''}
          </button>
        )}

        {/* Export Preview */}
        <div>
          <div className="pb-2  text-sm font-bold">
            <a className="opacity-20 hover:opacity-60">#</a>
            <span className="ml-1">{'Jeff'}</span>
          </div>
          <div className="grid">
            {/* Pagination */}
            <div className="tabs z-10 -mb-px">
              <button
                onClick={() => setShowContent('preview')}
                className={clsx('tab-lifted tab', {
                  'tab-active [--tab-bg:hsl(var(--b2))]':
                    showContent === 'preview',
                  '[--tab-border-color:transparent]': showContent !== 'preview',
                })}
              >
                Preview
              </button>
              <button
                onClick={() => setShowContent('dtif')}
                className={clsx('tab-lifted tab', {
                  'tab-active [--tab-bg:hsl(var(--n))] [--tab-color:hsl(var(--nc))] [--tab-border-color:hsl(var(--n))]':
                    showContent === 'dtif',
                  '[--tab-border-color:transparent]': showContent !== 'dtif',
                })}
              >
                DTIF (JSON)
              </button>
              <button
                onClick={() => setShowContent('figma')}
                className={clsx('tab-lifted tab', {
                  'tab-active [--tab-bg:hsl(var(--n))] [--tab-color:hsl(var(--nc))] [--tab-border-color:hsl(var(--n))]':
                    showContent == 'figma',
                  '[--tab-border-color:transparent]': showContent !== 'figma',
                })}
              >
                Figma (JSON)
              </button>
              <div className="tab-lifted tab mr-6 flex-1 cursor-default [--tab-border-color:transparent]" />
            </div>

            {/* Show Preview */}
            {showContent === 'preview' && (
              <div className="rounded-b-box rounded-tr-box relative overflow-x-auto bg-base-300">
                <div className="preview rounded-b-box rounded-tr-box flex min-h-[8rem] w-full items-center justify-center overflow-x-hidden border border-base-300 p-4">
                  {renderedNode}
                </div>
              </div>
            )}

            {/* Show DTIF */}
            {showContent === 'dtif' && (
              <div className="rounded-box flex min-h-[8rem] w-full overflow-x-hidden border border-base-300 bg-[hsl(var(--n))] p-4">
                {node != null ? (
                  <JSONTree data={node} theme={threezerotwofourTheme} />
                ) : (
                  <div>Jeff</div>
                )}
              </div>
            )}

            {/* Show Figma */}
            {showContent === 'figma' && (
              <div className="rounded-box flex min-h-[8rem] w-full overflow-x-hidden border border-base-300 bg-[hsl(var(--n))] p-4">
                <JSONTree
                  data={{ test: 'jeff' }}
                  theme={threezerotwofourTheme}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DTIFExport;
