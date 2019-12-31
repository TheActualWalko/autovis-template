import React from 'react';
import './controls.css';
import toPercent from './toPercent';
import printTime from './printTime';

const getEventXPositionRatio = (e) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const mouseXRel = e.clientX - rect.x;
  const positionRatio = Math.min(Math.max(0, mouseXRel / rect.width), 1);
  return positionRatio;
};

export default ({ onPlay, onPause, paused, onSeek, currentTime, duration }) => (
  <div className="controls">
    <button
      className="play"
      onClick={() => {
        paused ? onPlay() : onPause();
      }}
    >
      {paused ? 'Play' : 'Pause'}
    </button>
    <div
      className="timeline"
      onClick={event => {
        onSeek(getEventXPositionRatio(event) * duration);
      }}
    >
      <div className="progressLine">
        <div
          className="progressSliderWrapper"
          style={{
            width: toPercent(currentTime/duration)
          }}
        >
          <div className="progressSlider"></div>
        </div>
      </div>
    </div>
    <h4 className="timeReadout">
      {`${printTime(currentTime)} / ${printTime(duration)}`}
    </h4>
  </div>
);
