import React from 'react';
import './index.css';
import LiveRendererInterface from './LiveRendererInterface';
import { AnyScenePartSpec } from './types';

interface AutovisProps {
  width: number;
  height: number;
  sceneParts: AnyScenePartSpec[];
  analysisFrequencies: {[key: string]: number};
}

export default ({
  width,
  height,
  sceneParts,
  analysisFrequencies,
}: AutovisProps) => (
  <LiveRendererInterface
    width={width}
    height={height}
    parts={sceneParts}
    analysisFrequencies={analysisFrequencies}
  />
);
