import React from "react";
import "./controls.css";
import pad from './pad';


const printTime = (currentTime) => {
  const minutes = Math.floor(currentTime / 60);
  const seconds = Math.floor(currentTime % 60);
  return `${pad(minutes, 2)}:${pad(seconds, 2)}`;
}

const convertPositionToSeconds = (e, totalSeconds) => {
  const rect = e.currentTarget.getBoundingClientRect();
  const mouseXRel = e.clientX - rect.x;
  const seekRatio = Math.min(Math.max(0, mouseXRel / rect.width), 1);
  const seconds = seekRatio * totalSeconds;
  return seconds;
};

const convertcurrentTimeToSliderWidth = (currentSeconds, totalSeconds) => {
  return `${(100 * currentSeconds) / totalSeconds}%`;
};

export default ({ onPlay, onPause, paused, onSeek, currentTime, duration }) => (
  <div className="controls">
    <button
      className="play"
      onClick={() => {
        console.log(paused);
        paused ? onPlay() : onPause();
      }}
    >
      {paused ? "Play" : "Pause"}
    </button>
    <div
      className="timeline"
      onClick={event => {
        onSeek(convertPositionToSeconds(event, duration));
      }}
    >
      <div className="progressLine">
        <div
          className="progressSliderWrapper"
          style={{
            width: convertcurrentTimeToSliderWidth(currentTime, duration)
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
