import React, { useEffect, useState } from 'react';
import './index.css';
import LiveRendererInterface from './LiveRendererInterface';
import { AnyAsyncScenePartSpec, AnyScenePartSpec } from './types';

interface AutovisProps {
  width: number;
  height: number;
  sceneParts: AnyAsyncScenePartSpec[];
  analysisFrequencies: {[key: string]: number};
}

export default ({
  width,
  height,
  sceneParts,
  analysisFrequencies,
}: AutovisProps) => {
  const [parts, setParts] = useState<AnyScenePartSpec[]>([]);

  useEffect(
    () => {
      Promise
        .all(sceneParts.map(([objectPromise]) => objectPromise))
        .then((objects) => sceneParts.map(([promise, updater], index) => [objects[index], updater]) as AnyScenePartSpec[])
        .then(setParts);
    },
    [sceneParts, setParts]
  );

  return (
    <LiveRendererInterface
      width={width}
      height={height}
      parts={parts}
      analysisFrequencies={analysisFrequencies}
    />
  );
};
