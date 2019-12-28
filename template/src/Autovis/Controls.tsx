import React from 'react';
import pad from './pad';

interface ControlsProps {
  onPlay: () => void;
  onPause: () => void;
  onSeek: (time: number) => void;
  paused: boolean;
  currentTime: number;
  startTime: number;
}

const printTime = (currentTime: number) => {
  const minutes = Math.floor(currentTime / 60);
  const seconds = Math.floor(currentTime % 60);
  return `${pad(minutes, 2)}:${pad(seconds, 2)}`;
}

export default ({ onPlay, onPause, paused, onSeek, currentTime, startTime }: ControlsProps) => (
  <div style={{ position: 'fixed', zIndex: 2, top: 0, left: 0, right: 0 }}>
    <button onClick={() => onSeek(startTime)}>|&lt;&lt;</button>
    {paused ? <button onClick={onPlay}>&gt;</button> : <button onClick={onPause}>||</button>}
    <div style={{ fontFamily: 'courier', color: 'white' }}>{printTime(currentTime)}</div>
  </div>
)
