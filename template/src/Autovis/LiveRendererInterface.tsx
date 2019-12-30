import React, { useCallback, useState } from 'react';
import { StemInstantAnalysisMap, AnyScenePartSpec } from './types';
import useThreeComposer from './useThreeComposer';
import useRenderLoop from './useRenderLoop';
import audioContext from './audioContext';

interface RendererInterfaceProps {
  width: number;
  height: number;
  parts: AnyScenePartSpec[];
  analysisFrequencies: {[key: string]: number};
}

const computeAmplitude = (callback: (amplitude: number) => void) => (e: AudioProcessingEvent) => {
  let amplitude = 0;
  const data = e.inputBuffer.getChannelData(0);
  for (let i = 0; i < e.inputBuffer.length; i ++) {
    const sampleAmplitude = Math.abs(data[i]);
    if (amplitude < sampleAmplitude) {
      amplitude = sampleAmplitude;
    }
  }
  callback(amplitude);
};

const getInitialAmplitudes = (frequencies: {[key: string]: number}): {[key: string]: number} => (
  Object
    .keys(frequencies)
    .reduce((acc, cur) => ({...acc, [cur]: 0}), {})
);

const useAudioInput = (bandpassFrequencies: {[key: string]: number}) => {
  const [analysis, setAnalysis] = useState({ amplitude: 0, ...getInitialAmplitudes(bandpassFrequencies) });
  const [receivingAudio, setReceivingAudio] = useState(false);
  const receiveStream = useCallback(
    (stream) => {
      const source = audioContext.createMediaStreamSource(stream);
      const processor = audioContext.createScriptProcessor(1024, 1, 1);
      const bandAmplitudes = getInitialAmplitudes(bandpassFrequencies);
      Object
        .keys(bandpassFrequencies)
        .forEach((name) => {
          const frequency = bandpassFrequencies[name];
          const filter = audioContext.createBiquadFilter();
          filter.frequency.setValueAtTime(frequency, audioContext.currentTime);
          filter.type = 'bandpass';
          const processor = audioContext.createScriptProcessor(1024, 1, 1);
          processor.onaudioprocess = computeAmplitude((a) => bandAmplitudes[name] = a);
          source.connect(filter);
          filter.connect(processor);
          processor.connect(audioContext.destination);
          return processor;
        });
      source.connect(processor);
      processor.connect(audioContext.destination);

      processor.onaudioprocess = computeAmplitude((a) => {
        setAnalysis({
          amplitude: a,
          ...bandAmplitudes
        });
      });

      audioContext.resume().then(() => {
        setReceivingAudio(true);
      });
    },
    [bandpassFrequencies]
  );

  const startAudioIn = useCallback(
    () => {
      navigator
        .mediaDevices
        .getUserMedia({ audio: true, video: false })
        .then(receiveStream);
    },
    [receiveStream]
  );

  return [analysis, receivingAudio, startAudioIn] as [typeof analysis, typeof receivingAudio, typeof startAudioIn];
}

export default ({
  width,
  height,
  parts,
  analysisFrequencies,
}: RendererInterfaceProps) => {
  const [ThreeComposer, render] = useThreeComposer(width, height, parts);
  const [liveAnalysis, receivingAudio, startAudioIn] = useAudioInput(analysisFrequencies);

  const renderFrame = useCallback(
    () => {
      const instantAnalysis: StemInstantAnalysisMap = { live: liveAnalysis };
      render(instantAnalysis, receivingAudio ? Date.now() / 1000 : 0);
    },
    [render, liveAnalysis, receivingAudio]
  );

  const renderLoop = useCallback(() => {
    renderFrame();
  }, [renderFrame]);

  useRenderLoop(renderLoop, receivingAudio);

  return (
    <div>
      <ThreeComposer style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} />
      {!receivingAudio && <div style={{ position: 'fixed', top: 0, right: 0, width: 'auto', textAlign: 'right', zIndex: 3 }}>
        <button onClick={startAudioIn}>
          Activate Audio Input
        </button>
      </div>}
    </div>
  )
}
