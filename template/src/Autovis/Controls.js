import React from "react";
import "./controls.css";

const convertSecToTime = secs => {
  var h = Math.floor(secs / 3600);
  var m = Math.floor((secs % 3600) / 60);
  var s = Math.floor((secs % 3600) % 60);
  return `${h < 10 ? "0" : ""}${h}:${m < 10 ? "0" : ""}${m}:${
    s < 10 ? "0" : ""
  }${s}`;
};

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
  <div className="player">
    <div className="controls">
      <button className="play" onClick={() => (paused ? onPlay() : onPause())}>
        {paused ? "Pause" : "Play"}
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
        {`${convertSecToTime(currentTime)} / ${convertSecToTime(duration)}`}
      </h4>
    </div>
  </div>
);
