import React, {useState,useEffect} from 'react';
import './controls.css';
import toPercent from './toPercent';
import printTime from './printTime';

const getXPositionRatio = (xPos, element) => {
  const rect = element.getBoundingClientRect();
  const mouseXRel = xPos - rect.x;
  const positionRatio = Math.min(Math.max(0, mouseXRel / rect.width), 1);
  return positionRatio;
};

export const useMousePosition = () => {
  const [draggingObject, setDraggingObject] = useState({dragging:false, x: 0,y:0});
  useEffect(() => {
    const setMouseDown = (e) => {
      console.log(e.target.className);
      if (e.target.className === 'progressLine' ||
      e.target.className === 'timeline' ||
      e.target.className === 'progressSlider' ||
      e.target.className === 'progressSliderWrapper') {
        setDraggingObject({...draggingObject, dragging: true, x: e.clientX, y: e.clientY});
      }
    }

    const setMouseMove = (e) => {
      if (draggingObject.dragging === true) {
        setDraggingObject({...draggingObject, x: e.clientX});
      }
    }

    const setMouseUp = (e) => {
        setDraggingObject({...draggingObject, dragging: false});
    }

    window.addEventListener("mousedown", setMouseDown);
    window.addEventListener("mouseup", setMouseUp);
    window.addEventListener("mousemove", setMouseMove);

    return () => {
      window.removeEventListener("mousedown", setMouseDown);
      window.removeEventListener("mouseup", setMouseUp);
      window.removeEventListener("mousemove", setMouseMove);
    };
  }, [draggingObject]);
  return draggingObject;
};

export default ({ onPlay, onPause, paused, onSeek, currentTime, duration }) =>
  {
    const dragging = useMousePosition();
    
    useEffect(() => {
      const sliderElement = document.querySelector('.timeline');
      onSeek(getXPositionRatio(dragging.x,sliderElement) * duration)
    },[dragging]);

    return (
      <div className="controls">
        <button
          className="play"
          style={{userSelect:'none'}}
          onClick={() => paused ? onPlay() : onPause()}
        >   
          {paused ? 'Play' : 'Pause'}
        </button>
        <div className="timeline">
          <div className="progressLine">
            <div className="progressSliderWrapper"
              style={{width: toPercent(currentTime/duration)}}
            >
              <div className="progressSlider"></div>
            </div>
          </div>
        </div>
        <h4 className="timeReadout">
          {`${printTime(currentTime)} / ${printTime(duration)}`}
        </h4>
      </div>
    )
  };

