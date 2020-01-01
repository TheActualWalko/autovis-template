import React, { useEffect, useState } from 'react';
import './index.css';
import StudioRendererInterface from './StudioRendererInterface';
import getAudioDuration from './getAudioDuration';
import { AsyncScenePartSpec, AnyAsyncScenePartSpec, ScenePartUpdater, StemFullAnalysisMap } from './types';
import getStemAnalysis from './getStemAnalysis';
import useAsyncParts from './useAsyncParts';

export function part<T>(object: T | Promise<T>, update?: ScenePartUpdater<T>){
  return [object instanceof Promise ? object : Promise.resolve(object), update] as AsyncScenePartSpec<T>;
}

interface AutovisProps {
  frameRate: number;
  width: number;
  height: number;
  masterURL: string;
  stemURLs: {[key: string]: string};
  sceneParts: AnyAsyncScenePartSpec[];
  startTime?: number;
  endTime?: number;
}

const getAudioAnalysis = async (masterURL: string, stemURLs: {[key: string]: string}, frameRate: number) => {
  try {
    const masterDuration = await getAudioDuration(masterURL);
    const frameCount = Math.ceil(frameRate * masterDuration);
    const stemAnalysis = await getStemAnalysis(stemURLs, frameCount);
    return { masterDuration, stemAnalysis };
  } catch (e) {
    return { error: e };
  }
}

export default ({
  frameRate,
  width,
  height,
  masterURL,
  stemURLs,
  sceneParts,
  startTime,
  endTime,
}: AutovisProps) => {
  const [
    { masterDuration, stemAnalysis, error },
    setAudioAnalysis
  ] = useState<{ masterDuration?: number, stemAnalysis?: StemFullAnalysisMap, error?: Error }>({});

  const parts = useAsyncParts(sceneParts);

  useEffect(() => {
    getAudioAnalysis(masterURL, stemURLs, frameRate).then(setAudioAnalysis);
  }, [masterURL, stemURLs, frameRate, setAudioAnalysis]);

  if (masterDuration && stemAnalysis && parts.length > 0) {
    return (
      <StudioRendererInterface
        width={width}
        height={height}
        duration={masterDuration}
        frameRate={frameRate}
        stemAnalysis={stemAnalysis}
        masterURL={masterURL}
        parts={parts}
        startTime={startTime}
        endTime={endTime}
        capturer={new CCapture({ format: 'webm', framerate: frameRate, quality: 100, display: true })}
      />
    );
  } else if (error) {
    return (
      <div style={{color: 'white', maxWidth: 800, width: '100%', padding: 20, margin: '0 auto' }}>
        <h2>Something went wrong.</h2>
        <h3>{error.message}</h3>
        <pre style={{color: 'white', whiteSpace: 'pre-wrap', textAlign: 'left' }}>{error.stack}</pre>
        <button
          style={{ color: 'black', padding: 20, backgroundColor: 'white', border: 'none', borderRadius: 30, fontSize: 16, marginTop: 20 }}
          onClick={() => {
            localStorage.clear();
            window.location.reload();
          }}
        >
            Forget cached data and reload
        </button>
      </div>
    );
  } else {
    return (
      <div className="fade-in" style={{color: 'white', maxWidth: 800, width: '100%', padding: 20, margin: '0 auto' }}>
        <h2>Preparing {Object.keys(stemURLs).length} audio files for display at {frameRate} FPS</h2>
        <h3 className="fade-in-slow">On your first load, this can take some time. It will take longer at high frame rates, or with lots of large files.</h3>
        <div className="audio-loader" />
      </div>
    );
  }
}
