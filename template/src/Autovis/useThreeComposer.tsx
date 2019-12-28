import * as THREE from 'three';
import { EffectComposer } from 'three/examples/jsm/postprocessing/EffectComposer';
import { AnyScenePartSpec, StemInstantAnalysisMap } from './types';
import React, { useEffect, useMemo, useCallback, HTMLProps, useRef } from 'react';
import { Pass } from 'three/examples/jsm/postprocessing/Pass';
import { RenderPass } from 'three/examples/jsm/postprocessing/RenderPass';
import { ShaderPass } from 'three/examples/jsm/postprocessing/ShaderPass';
import { FXAAShader } from 'three/examples/jsm/shaders/FXAAShader';
import { CopyShader } from 'three/examples/jsm/shaders/CopyShader';

const initComposer = (width: number, height: number, parts: AnyScenePartSpec[]): EffectComposer => {
  const renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(width, height);
  const composer = new EffectComposer(renderer);
  const scene = new THREE.Scene();
  const sceneComponents = parts.map(([component]) => component);
  const objects = sceneComponents.filter((component) => component instanceof THREE.Object3D);
  const passes = sceneComponents.filter((component) => component instanceof Pass);
  const camera = objects.find((object) => object instanceof THREE.Camera) as THREE.Camera;

  objects.forEach((object) => !(object instanceof Pass) && scene.add(object));

  composer.addPass(new RenderPass(scene, camera));
  composer.addPass(new ShaderPass(FXAAShader));
  passes.forEach((pass) => composer.addPass(pass));
  const copyPass = new ShaderPass(CopyShader);
  copyPass.renderToScreen = true;
  composer.addPass(copyPass);

  return composer;
}

export default (width: number, height: number, parts: AnyScenePartSpec[]) => {
  const composer = useMemo(() => initComposer(width, height, parts), [width, height, parts]);
  const lastTimeRef = useRef<number>(-Infinity);
  const onResize = useCallback(() => {
    if (composer) {
      if (width > window.innerWidth || height > window.innerHeight) {
        const screenAspectRatio = window.innerWidth / window.innerHeight;
        const videoAspectRatio = width / height;
        const factor = (videoAspectRatio > screenAspectRatio) ? window.innerWidth / width : window.innerHeight / height;
        const leftPadding = (videoAspectRatio > screenAspectRatio) ? 0 : (window.innerWidth - (width * factor)) / 2;
        composer.renderer.domElement.setAttribute('style', `transform: scale(${factor}); margin-left: ${leftPadding}px`);
      } else if (height < (window.innerHeight - 40)) {
        composer.renderer.domElement.setAttribute('style', `margin-top: 40px`);
      }
    }
  }, [width, height, composer]);

  useEffect(
    () => {
      const resizeCallback = onResize;
      window.addEventListener('resize', resizeCallback);
      onResize();
      return () => {
        window.removeEventListener('resize', resizeCallback);
      }
    },
    [onResize]
  );

  const updatableParts = useMemo(() => parts.filter(([component, updater]) => Boolean(updater)), [parts]);

  const render = useCallback(
    (analysis: StemInstantAnalysisMap, time: number) => {
      if (time !== lastTimeRef.current) {
        updatableParts.forEach(([component, updater]) => updater!(component, analysis, time));
        composer.render();
      } else {
        console.warn('attempt to re-render the same frame');
      }
      lastTimeRef.current = time;
    },
    [composer, updatableParts]
  );

  const capture = useCallback(
    (capturer) => {
      capturer.capture(composer.renderer.domElement);
    },
    [composer]
  );

  const wrapperRef = useCallback(
    (element: HTMLDivElement | null) => {
      if (element) {
        element.innerHTML = '';
        element.append(composer.renderer.domElement);
      }
    },
    [composer]
  );

  const ThreeComposerComponent = (props: HTMLProps<HTMLDivElement>) => (
    <div ref={wrapperRef} {...props} />
  );

  return [ThreeComposerComponent, render, capture] as [typeof ThreeComposerComponent, typeof render, typeof capture];
};
