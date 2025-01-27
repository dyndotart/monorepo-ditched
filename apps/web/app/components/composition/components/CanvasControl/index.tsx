import { logger } from '@/core/logger';
import { InteractiveComposition } from '@dyn/dtif-to-svg';
import { TVector } from '@dyn/types/dtif';
import React from 'react';
import { pointerEventToCompositionPoint } from '../../utils';
import { SelectionBox } from './components';
import { ECanvasMode, EHandleSide, TCanvasState, TXYWH } from './types';

export const CanvasControl: React.FC<TProps> = (props) => {
  const { composition: composition } = props;
  const [canvasState, setCanvasState] = React.useState<TCanvasState>({
    mode: ECanvasMode.NONE,
  });

  // ============================================================================
  // Lifecycle
  // ============================================================================

  /**
   * Register onPointerMove event
   */
  React.useEffect(() => {
    composition.onPointerMove((e, composition) => {
      e.preventDefault();
      const current = pointerEventToCompositionPoint(e, composition);

      // logger.info('onPointerMove', { mode: canvasState.mode, e, composition });

      // Start multi selection net
      if (canvasState.mode === ECanvasMode.PRESSING) {
        // TODO: multi selection
      }

      // Selection Net
      else if (canvasState.mode === ECanvasMode.SELECTION_NET) {
        // TODO: selection net
      }

      // Translate
      else if (canvasState.mode === ECanvasMode.TRANSLATING) {
        translateSelectedLayers(current);
      }

      // Resize
      else if (canvasState.mode === ECanvasMode.RESIZING) {
        // TODO resize
      }
    });
  }, [canvasState]);

  /**
   * Register onPointerDown event
   */
  React.useEffect(() => {
    composition.onPointerDown((e, composition) => {
      const current = pointerEventToCompositionPoint(e, composition);
      setCanvasState({ mode: ECanvasMode.PRESSING, origin: current });
    });

    // TODO: think about how to get selected which is called after onPointerDown
    composition.onSelectNode((selected, e) => {
      if (selected.length > 0) {
        const current = pointerEventToCompositionPoint(e, composition);
        setCanvasState({
          mode: ECanvasMode.TRANSLATING,
          current,
          isTranslating: false,
        });
      }
    });
  }, [canvasState]);

  /**
   * Register onPointerUp event
   */
  React.useEffect(() => {
    composition.onPointerUp((e, composition) => {
      setCanvasState({ mode: ECanvasMode.NONE });
    });
  }, [canvasState]);

  /**
   * Register onLeave event
   */
  React.useEffect(() => {
    composition.onPointerLeave((e, composition) => {
      setCanvasState({ mode: ECanvasMode.NONE });
    });
  }, [canvasState]);

  // TODO:
  React.useEffect(() => {
    if (composition != null) {
      composition.onWheel((e, composition) => {
        logger.info('onWheel', { e, composition });
      });
    }
  }, [composition]);

  // ============================================================================
  // Callbacks
  // ============================================================================
  /**
   * Hook used to listen to Undo / Redo and delete selected layers
   */
  React.useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case 'Shift': {
          composition.multiselect = true;
          break;
        }
      }
    }

    function onKeyUp(e: KeyboardEvent) {
      switch (e.key) {
        case 'Shift': {
          composition.multiselect = false;
          break;
        }
      }
    }

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);

    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    };
  }, []);

  /**
   * Move selected layers on the canvas
   */
  const translateSelectedLayers = React.useCallback(
    (current: TVector) => {
      if (canvasState.mode !== ECanvasMode.TRANSLATING) {
        return;
      }

      const offset = {
        x: current.x - canvasState.current.x,
        y: current.y - canvasState.current.y,
      };
      const selectedNodes = composition.selectedNodes;

      for (const selected of selectedNodes) {
        selected.move(offset.x, offset.y);
      }

      // TODO: solve that without re-render
      setCanvasState({
        mode: ECanvasMode.TRANSLATING,
        current,
        isTranslating: true,
      });
    },
    [canvasState]
  );

  /**
   * Start resizing the layer
   */
  const onResizeHandlePointerDown = React.useCallback(
    (corner: EHandleSide, initialBounds: TXYWH) => {
      setCanvasState({
        mode: ECanvasMode.RESIZING,
        initialBounds,
        corner,
      });
    },
    []
  );

  // ============================================================================
  // Render
  // ============================================================================

  return (
    <svg
      id={'canvas-control'}
      className="absolute w-full h-full pointer-events-none"
      overflow={'visible'}
    >
      <SelectionBox
        composition={composition}
        onResizeHandlePointerDown={onResizeHandlePointerDown}
        isTranslating={
          canvasState.mode === ECanvasMode.TRANSLATING &&
          canvasState.isTranslating
        }
      />
    </svg>
  );
};

type TProps = {
  composition: InteractiveComposition;
};
