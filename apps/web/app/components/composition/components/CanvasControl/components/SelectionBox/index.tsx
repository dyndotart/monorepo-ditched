import { InteractiveComposition } from '@dyn/dtif-to-svg';
import React from 'react';
import { useWatcher } from '../../../../hooks';
import { EHandleSide, TXYWH } from '../../types';
import { InnerSelectionBox } from './InnerSelectionBox';

export const SelectionBox: React.FC<TProps> = React.memo((props) => {
  const { composition, onResizeHandlePointerDown, isTranslating } = props;
  const { selectedNodes } = useWatcher(composition, ['selectedNodes']);
  if (isTranslating) {
    return null;
  }

  return (
    <>
      {selectedNodes.map((selectedNode) => (
        <InnerSelectionBox
          key={selectedNode.id}
          node={selectedNode}
          showHandles={true}
          onResizeHandlePointerDown={onResizeHandlePointerDown}
        />
      ))}
    </>
  );
});

type TProps = {
  composition: InteractiveComposition;
  onResizeHandlePointerDown: (
    corner: EHandleSide,
    initialBounds: TXYWH
  ) => void;
  isTranslating: boolean;
};
