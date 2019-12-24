import React, { useRef, useEffect, useState, useCallback } from 'react';
import * as THREE from 'three';
import { StemInstantAnalysisMap, StemFullAnalysisMap, AnyScenePartSpec } from './types';
import { Camera } from 'three';
import Controls from './Controls';
import { updateTimeRef, getCurrentTime } from './time';
import getInstantAnalysis from './getInstantAnalysis';
import pad from './pad';

const makeRenderer = (width: number, height: number) => {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  return renderer;
}

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
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const cameraRef = useRef<THREE.Camera | null>(null);
  const rendererRef = useRef<THREE.Renderer | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const readoutRef = useRef<HTMLDivElement>(null);
  const [renderingVideo, setRenderingVideo] = useState(false);
  const [playing, setPlaying] = useState(false);
  const minFrame = Math.ceil(startTime * frameRate);
  const maxFrame = Math.ceil(endTime * frameRate);

  const registerAudioElement = useCallback(
    (audioElement: HTMLAudioElement) => {
      audioElement.onplaying = () => {
        console.log('updating time ref');
        updateTimeRef(audioElement.currentTime);
        setPlaying(true);
      }
      audioElement.onpause = () => {
        setPlaying(false);
      }
      audioRef.current = audioElement;
    },
    []
  );

  const onResize = useCallback(() => {
    if (rendererRef.current) {
      if (width > window.innerWidth || height > window.innerHeight) {
        const screenAspectRatio = window.innerWidth / window.innerHeight;
        const videoAspectRatio = width / height;
        const factor = (videoAspectRatio > screenAspectRatio) ? window.innerWidth / width : window.innerHeight / height;
        const leftPadding = (videoAspectRatio > screenAspectRatio) ? 0 : (window.innerWidth - (width * factor)) / 2;
        rendererRef.current.domElement.setAttribute('style', `transform: scale(${factor}); margin-left: ${leftPadding}px`);
      } else if (height < (window.innerHeight - 40)) {
        rendererRef.current.domElement.setAttribute('style', `margin-top: 40px`);
      }
    }
  }, [width, height]);

  const registerCanvasWrapper = useCallback(
    (wrapper: HTMLDivElement) => {
      if (wrapper) {
        const renderer = makeRenderer(width, height);
        const objects = parts.map(([object]) => object);
        rendererRef.current = renderer;
        cameraRef.current = objects.find((object) => object instanceof Camera) as Camera;
        if (sceneRef.current) {
          sceneRef.current.remove();
        }
        const scene = new THREE.Scene();
        objects.forEach((o) => scene.add(o));
        sceneRef.current = scene;
        wrapper.querySelectorAll('*').forEach((node) => node.remove());
        wrapper.appendChild(renderer.domElement);
        window.removeEventListener('resize', onResize);
        window.addEventListener('resize', onResize);
        onResize();
      }
    },
    [width, height, parts]
  );

  const play = useCallback(
    () => {
      if (audioRef.current) {
        audioRef.current.currentTime = startTime;
        audioRef.current.play();
      }
      setRenderingVideo(false);
    },
    [startTime]
  );

  const pause = useCallback(
    () => {
      if (audioRef.current) {
        audioRef.current.pause();
      }
      setRenderingVideo(false);
    },
    []
  );

  const startAnimation = useCallback(
    () => {
      const animate = () => {
        const renderer = rendererRef.current;
        const scene = sceneRef.current;
        const camera = cameraRef.current;
        if (!renderer || !scene || !camera) {
          return;
        }
        const currentTime = getCurrentTime();
        const frame = Math.floor(currentTime * frameRate);
        if (frame > maxFrame) {
          if (renderingVideo) {
            capturer.stop();
            capturer.save();
          }
          pause();
          return;
        }
        const instantAnalysis: StemInstantAnalysisMap = getInstantAnalysis(stemAnalysis, frame);
        parts.forEach(([object, updater]) => updater && updater(object as any, instantAnalysis, currentTime));
        renderer.render(scene, camera);
        if (renderingVideo) {
          capturer.capture(renderer.domElement);
        }
        animationFrameRef.current = requestAnimationFrame(animate);
        if (readoutRef.current) {
          const minutes = Math.floor(currentTime / 60);
          const seconds = Math.floor(currentTime % 60);
          const time = `${pad(minutes, 2)}:${pad(seconds, 2)}.${frame % frameRate}`;
          readoutRef.current.innerHTML = renderingVideo
            ? `Rendering frame ${frame - minFrame}/${maxFrame - minFrame} (${time}) `
            : `${time}`
        }
      }
      animate();
      return () => {
        animationFrameRef.current && cancelAnimationFrame(animationFrameRef.current);
      }
    },
    [renderingVideo, pause, animationFrameRef, capturer, frameRate, maxFrame, minFrame, parts, stemAnalysis]
  );

  const stopAnimation = useCallback(
    () => {
      animationFrameRef.current && cancelAnimationFrame(animationFrameRef.current);
    },
    []
  );

  useEffect(
    () => {
      if (playing) {
        startAnimation();
      } else {
        stopAnimation();
      }
    },
    [startAnimation, stopAnimation, playing, renderingVideo]
  );

  const renderVideo = useCallback(
    () => {
      capturer.start();
      updateTimeRef(startTime);
      setRenderingVideo(true);
      setPlaying(true);
    },
    [capturer, setRenderingVideo, startTime]
  );

  return (
    <div style={{textAlign: 'center'}}>
      <audio ref={registerAudioElement} src={masterURL} />
      <Controls
        onPlay={play}
        onPause={pause}
        onRender={renderVideo}
        readoutRef={readoutRef}
      />
      <div ref={registerCanvasWrapper} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0 }} />
    </div>
  )
}
