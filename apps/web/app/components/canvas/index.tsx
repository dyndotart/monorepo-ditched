import { TScene } from '@pda/types/dtif';
import React from 'react';
import { Frame } from './components';

const Canvas: React.FC<TProps> = (props) => {
  const { scene } = props;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      id={`scene-${scene.version}-${scene.name}`}
      width={scene.width}
      height={scene.height}
      fill="none"
      viewBox={`0 0 ${scene.width} ${scene.height}`}
      style={{
        backgroundColor: 'red', // TODO: REMOVE
        WebkitPrintColorAdjust: 'exact',
      }}
      version="1.1"
    >
      <desc>{scene.name}</desc>
      <Frame node={scene.root} />
    </svg>
  );
};

export default Canvas;

type TProps = {
  scene: TScene;
};