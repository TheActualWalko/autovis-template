import { useRef, useCallback, useEffect } from 'react';

export default (renderFunction: () => void, playing: boolean) => {
  const animationFrameRef = useRef<number | null>(null);

  const startAnimation = useCallback(
    () => {
      animationFrameRef.current && cancelAnimationFrame(animationFrameRef.current);
      let animationFrame: number;
      const animate = () => {
        renderFunction();
        animationFrame = requestAnimationFrame(animate);
        animationFrameRef.current = animationFrame;
      }
      animate();
      return () => {
        animationFrame && cancelAnimationFrame(animationFrame);
      }
    },
    [renderFunction]
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
}
