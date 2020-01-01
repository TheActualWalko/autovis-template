import React from 'react';
import './index.css';
import LiveRendererInterface from './LiveRendererInterface';
import { AnyAsyncScenePartSpec } from './types';
import useAsyncParts from './useAsyncParts';

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
  const parts = useAsyncParts(sceneParts);

  return (
    <LiveRendererInterface
      width={width}
      height={height}
      parts={parts}
      analysisFrequencies={analysisFrequencies}
    />
  );
};
