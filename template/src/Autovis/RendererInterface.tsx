import React, { useRef, useEffect, useState, useCallback } from 'react';
import { StemInstantAnalysisMap, StemFullAnalysisMap, AnyScenePartSpec } from './types';
import Controls from './Controls';
import { updateTimeRef, getCurrentTime } from './time';
import getInstantAnalysis from './getInstantAnalysis';
import AudioContainer from './AudioContainer';
import useThreeComposer from './useThreeComposer';

const getFrameNumber = (currentTime: number, frameRate: number) => Math.floor(
  (currentTime * frameRate) +
  1/(10 * frameRate) // this compensates for some floating point inaccuracy induced by the non-realtime render
);

interface RendererInterfaceProps {
  width: number;
  height: number;
  duration: number;
  stemAnalysis: StemFullAnalysisMap;
  frameRate: number;
  parts: AnyScenePartSpec[];
  masterURL: string;
  startTime?: number;
  endTime?: number;
  capturer: any;
}

export default ({
  width,
  height,
  frameRate,
  parts,
  stemAnalysis,
  masterURL,
  duration,
  startTime = 0,
  endTime = duration,
  capturer
}: RendererInterfaceProps) => {
  const animationFrameRef = useRef<number | null>(null);
  const lastFrameRef = useRef<number>(-Infinity);
  const [renderingVideo, setRenderingVideo] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [ThreeComposer, render, capture] = useThreeComposer(width, height, parts);
  const minFrame = Math.ceil(startTime * frameRate);
  const maxFrame = Math.ceil(endTime * frameRate);

  const onPlay = useCallback(
    () => {
      setPlaying(true);
      setRenderingVideo(false);
    },
    [setPlaying, setRenderingVideo]
  );

  const onPause = useCallback(
    () => {
      setPlaying(false);
      setRenderingVideo(false);
    },
    [setPlaying, setRenderingVideo]
  );

  const renderFrame = useCallback(
    (frame) => {
      const instantAnalysis: StemInstantAnalysisMap = getInstantAnalysis(stemAnalysis, frame);
      const frameTime = frame / frameRate;
      render(instantAnalysis, frameTime);
    },
    [frameRate, stemAnalysis, render]
  );

  const renderFrameAtTime = useCallback(
    (time: number) => renderFrame(Math.floor(time * frameRate)),
    [frameRate, renderFrame]
  );

  const onTimeChange = useCallback(
    (time: number) => {
      updateTimeRef(time);
      if (!playing) {
        renderFrameAtTime(time);
      }
    },
    [playing, renderFrameAtTime]
  );

  const onStartRender = useCallback(
    () => {
      capturer.start();
      updateTimeRef(startTime);
      setRenderingVideo(true);
      setPlaying(true);
    },
    [capturer, setRenderingVideo, startTime]
  );

  const startAnimation = useCallback(
    () => {
      animationFrameRef.current && cancelAnimationFrame(animationFrameRef.current);
      let animationFrame: number;
      const animate = () => {
        const currentTime = getCurrentTime();
        const frame = getFrameNumber(currentTime, frameRate);
        if (frame > maxFrame) {
          if (renderingVideo) {
            capturer.stop();
            capturer.save();
          }
          onPause();
          return;
        }
        if (renderingVideo || lastFrameRef.current !== frame) {
          lastFrameRef.current = frame;
          renderFrame(frame);
          if (renderingVideo) {
            capture(capturer);
          }
        }
        animationFrame = requestAnimationFrame(animate);
        animationFrameRef.current = animationFrame;
      }
      animate();
      return () => {
        animationFrame && cancelAnimationFrame(animationFrame);
      }
    },
    [renderingVideo, animationFrameRef, onPause, capturer, frameRate, maxFrame, renderFrame, capture]
  );

  const stopAnimation = useCallback(
    () => animationFrameRef.current && cancelAnimationFrame(animationFrameRef.current),
    []
  );

  useEffect(
    () => {
      playing ? startAnimation() : stopAnimation()
    },
    [playing, startAnimation, stopAnimation]
  );

  return (
    <div style={{textAlign: 'center'}}>
      {renderingVideo ? null : (
        <>
          <AudioContainer onTimeChange={onTimeChange} onPlay={onPlay} onPause={onPause} src={masterURL}>
            {({ currentTime, paused, play, pause, seek }) => (
              <Controls
                startTime={minFrame}
                paused={paused}
                onPlay={play}
                onPause={pause}
                onSeek={seek}
                currentTime={currentTime}
              />
            )}
          </AudioContainer>
          <div style={{ position: 'fixed', top: 0, right: 0, width: 'auto', textAlign: 'right', zIndex: 3 }}>
            <button
              onClick={() => {
                localStorage.clear();
                window.location.reload();
              }}
            >
              Forget Cached Data
            </button>
            <button
              onClick={() => {
                /* eslint-disable */
                if (confirm("Warning: This process is in Beta. It can be very slow, and if your browser is hidden your render may fail. Video will not include sound.")) {
                  onStartRender();
                }
                /* eslint-enable */
              }}
            >
              Save to Video
            </button>
          </div>
        </>
      )}
      <ThreeComposer style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 1 }} />
    </div>
  )
}
