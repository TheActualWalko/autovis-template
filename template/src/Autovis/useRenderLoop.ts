import { useRef, useEffect } from 'react';


export default (renderFunction: () => void, playing: boolean) => {
  const animationFrameRef = useRef<number | null>(null);

  useEffect(
    () => {
      animationFrameRef.current && cancelAnimationFrame(animationFrameRef.current);
      let animationFrame: number;
      if (playing) {
        const animate = () => {
          if (playing) {
            renderFunction();
            animationFrame = requestAnimationFrame(animate);
            animationFrameRef.current = animationFrame;
          }
        }
        animate();
      }
      return () => {
        animationFrame && cancelAnimationFrame(animationFrame);
      }
    },
    [playing, renderFunction]
  );
}
