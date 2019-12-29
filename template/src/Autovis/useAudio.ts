import { useRef, useState, useCallback, useEffect } from 'react';

export default (src: string) => {
  const audioRef = useRef<HTMLAudioElement>(new Audio(src));

  const lastTimeRef = useRef<number>(-Infinity);
  const [currentTime, setCurrentTime] = useState(0);
  const [paused, setPaused] = useState(true);
  const updateTime = useCallback(
    (currentTime) => {
      if (lastTimeRef.current !== currentTime) {
        setCurrentTime(currentTime);
        lastTimeRef.current = currentTime;
      }
    },
    [setCurrentTime]
  );

  useEffect(
    () => {
      const audioElement = audioRef.current;
      updateTime(audioElement.currentTime);
      audioElement.ontimeupdate = () => {
        updateTime(audioElement.currentTime);
      }
      audioElement.onplaying = () => {
        updateTime(audioElement.currentTime);
        setPaused(false);
      }
      audioElement.onpause = () => {
        updateTime(audioElement.currentTime);
        setPaused(true);
      }
    },
    [updateTime]
  );

  const play = useCallback(
    () => {
      audioRef.current && audioRef.current.play();
    },
    [audioRef]
  );

  const pause = useCallback(
    () => {
      audioRef.current && audioRef.current.pause();
    },
    [audioRef]
  );

  const seek = useCallback(
    (time: number) => {
      if (audioRef.current) {
        audioRef.current.currentTime = time;
      }
    },
    [audioRef]
  );

  return [play, pause, seek, paused, currentTime] as [typeof play, typeof pause, typeof seek, typeof paused, typeof currentTime];
}
