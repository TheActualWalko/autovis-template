import React, { useRef, useCallback, useState } from 'react';

interface AudioContainerOutputProps {
  currentTime: number;
  duration: number;
  paused: boolean;
  play: () => void;
  pause: () => void;
  seek: (time: number) => void;
}

interface AudioContainerProps extends React.HTMLProps<HTMLAudioElement> {
  onTimeChange?: (currentTime: number) => void;
  onPlay?: () => void;
  onPause?: () => void;
  children: (props: AudioContainerOutputProps) => React.ReactElement | null;
}

export default ({ children, onPlay, onPause, onTimeChange, ...otherProps }: AudioContainerProps) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const lastTimeRef = useRef<number>(-Infinity);
  const [currentTime, setCurrentTime] = useState(0);
  const [paused, setPaused] = useState(true);
  const [duration, setDuration] = useState(Infinity);
  const updateTime = useCallback(
    (currentTime) => {
      if (lastTimeRef.current !== currentTime) {
        onTimeChange && onTimeChange(currentTime);
        setCurrentTime(currentTime);
        lastTimeRef.current = currentTime;
      }
    },
    [setCurrentTime, onTimeChange]
  );

  const receiveAudioRef = useCallback(
    (audioElement: HTMLAudioElement) => {
      if (audioRef.current) {
        audioRef.current.onloadedmetadata = null;
        audioRef.current.ontimeupdate = null;
        audioRef.current.onplaying = null;
        audioRef.current.onpause = null;
      }
      if (audioElement) {
        audioRef.current = audioElement;
        updateTime(audioElement.currentTime);
        audioElement.onloadedmetadata = () => {
          setDuration(audioElement.duration);
        }
        audioElement.ontimeupdate = () => {
          updateTime(audioElement.currentTime);
        }
        audioElement.onplaying = () => {
          updateTime(audioElement.currentTime);
          setPaused(false);
          onPlay && onPlay();
        }
        audioElement.onpause = () => {
          updateTime(audioElement.currentTime);
          setPaused(true);
          onPause && onPause();
        }
      }
    },
    [onPlay, onPause, updateTime]
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

  return (
    <>
      <audio {...otherProps} ref={receiveAudioRef} />
      {currentTime !== null && children({ currentTime, duration, play, pause, seek, paused })}
    </>
  );
}
