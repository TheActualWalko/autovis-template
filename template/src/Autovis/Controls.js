import React, { useState, useEffect, useRef } from 'react';
import './controls.css';
import toPercent from './toPercent';
import printTime from './printTime';

const getXPositionRatio = (xPos, element) => {
  const rect = element.getBoundingClientRect();
  const mouseXRel = xPos - rect.x;
  return Math.min(Math.max(0, mouseXRel / rect.width), 1);
};

export const useDragState = (element) => {
  const [draggingObject, setDraggingObject] = useState({ dragging:false, x: 0,y:0 });

  useEffect(() => {
    const setMouseDown = (e) => {
      if (e.target === element.current) {
        setDraggingObject({ ...draggingObject, dragging: true, x: e.clientX, y: e.clientY });
      }
    }

    const setMouseMove = (e) => {
      if (draggingObject.dragging === true) {
        setDraggingObject({...draggingObject, x: e.clientX});
      }
    }

    const setMouseUp = (e) => {
      if (draggingObject.dragging === true) {
        setDraggingObject({ ...draggingObject, dragging: false });
      }
    }

    window.addEventListener('mousedown', setMouseDown);
    window.addEventListener('mouseup', setMouseUp);
    window.addEventListener('mousemove', setMouseMove);

    return () => {
      window.removeEventListener('mousedown', setMouseDown);
      window.removeEventListener('mouseup', setMouseUp);
      window.removeEventListener('mousemove', setMouseMove);
    };
  }, [draggingObject]);
  return draggingObject;
};

export default ({ onPlay, onPause, paused, onSeek, currentTime, duration }) => {
  const sliderElementRef = useRef(null);
  const dragging = useDragState(sliderElementRef);

  
  useEffect(() => {
    if (sliderElementRef.current) {
      onSeek(getXPositionRatio(dragging.x, sliderElementRef.current) * duration)
    }
  }, [dragging]);

  return (
    <div className="controls">
      <button
        className="play"
        style={{ userSelect:'none' }}
        onClick={() => paused ? onPlay() : onPause()}
      >   
        { paused ? 'Play' : 'Pause '}
      </button>
      <button
        className="back"
        style={{ userSelect:'none' }}
        onClick={() => onSeek(0)}
      >   
        {'|<<'}
      </button>
      <div className="timeline" ref={ sliderElementRef }>
        <div className="progressLine">
          <div className="progressSliderWrapper" style={{ width: toPercent(currentTime / duration) }}>
            <div className="progressSlider"></div>
          </div>
        </div>
      </div>
      <h4 className="timeReadout">
        {`${ printTime(currentTime) } / ${ printTime(duration) }`}
      </h4>
    </div>
  )
};
