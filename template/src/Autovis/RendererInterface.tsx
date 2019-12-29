import React, { useRef, useState, useCallback, useEffect } from "react";
import {
  StemInstantAnalysisMap,
  StemFullAnalysisMap,
  AnyScenePartSpec
} from "./types";
import Controls from "./Controls";
import { updateTimeRef, getCurrentTime } from "./time";
import getInstantAnalysis from "./getInstantAnalysis";
import useThreeComposer from "./useThreeComposer";
import useRenderLoop from "./useRenderLoop";
import useAudio from "./useAudio";

const getFrameNumber = (time: number, frameRate: number) =>
  Math.floor(
    time * frameRate + 1 / (10 * frameRate) // this compensates for some floating point inaccuracy induced by the non-realtime render
  );

let saved = false;

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
  const lastFrameRef = useRef<number>(-Infinity);
  const [renderingVideo, setRenderingVideo] = useState(false);
  const [ThreeComposer, render, capture] = useThreeComposer(
    width,
    height,
    parts
  );
  const [play, pause, seek, paused, currentTime] = useAudio(masterURL);
  const minFrame = Math.floor(startTime * frameRate);
  const maxFrame = Math.ceil(endTime * frameRate);

  const renderFrame = useCallback(
    (frame: number) => {
      const instantAnalysis: StemInstantAnalysisMap = getInstantAnalysis(
        stemAnalysis,
        frame
      );
      const frameTime = frame / frameRate;
      render(instantAnalysis, frameTime);
    },
    [frameRate, stemAnalysis, render]
  );

  const renderFrameAtTime = useCallback(
    (time: number) => renderFrame(getFrameNumber(time, frameRate)),
    [frameRate, renderFrame]
  );

  const onStartRender = useCallback(() => {
    capturer.start();
    updateTimeRef(startTime);
    setRenderingVideo(true);
  }, [capturer, setRenderingVideo, startTime]);

  useEffect(() => {
    setRenderingVideo(false);
  }, [paused]);

  useEffect(() => {
    updateTimeRef(currentTime);
    if (paused) {
      renderFrameAtTime(currentTime);
    }
  }, [paused, renderFrameAtTime, currentTime]);

  const renderLoop = useCallback(() => {
    const currentTime = getCurrentTime();
    const frame = getFrameNumber(currentTime, frameRate);

    if (frame > maxFrame) {
      if (renderingVideo) {
        capturer.stop();
        if (!saved) {
          saved = true;
          capturer.save();
        } else {
          console.warn("would have attempted a repeat save");
        }
      }
      setRenderingVideo(false);
      return;
    }

    if (renderingVideo || lastFrameRef.current !== frame) {
      lastFrameRef.current = frame;
      renderFrame(frame);
      if (renderingVideo) {
        capture(capturer);
      }
    }
  }, [capturer, frameRate, maxFrame, renderingVideo, capture, renderFrame]);

  useRenderLoop(renderLoop, !paused || renderingVideo);

  return (
    <div style={{ textAlign: "center" }}>
      {renderingVideo ? null : (
        <>
          <Controls
            paused={paused}
            onPlay={play}
            onPause={pause}
            onSeek={seek}
            currentTime={currentTime}
            duration={duration}
          />
          <div
            style={{
              position: "fixed",
              top: 40,
              right: 0,
              width: "auto",
              textAlign: "right",
              zIndex: 3
            }}
          >
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
                if (
                  confirm(
                    "Warning: This process is in Beta. It can be very slow, and if your browser is hidden your render may fail. Video will not include sound."
                  )
                ) {
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
      <ThreeComposer
        style={{
          position: "fixed",
          top: 40,
          left: 0,
          right: 0,
          bottom: 0,
          zIndex: 1
        }}
      />
    </div>
  );
};
