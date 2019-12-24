import React, { RefObject } from 'react';

interface ControlsProps {
  onPlay: () => void;
  onPause: () => void;
  onRender: () => void;
  readoutRef: RefObject<HTMLDivElement>;
}

export default ({ onPlay, onPause, onRender, readoutRef }: ControlsProps) => (
  <div style={{ position: 'fixed', zIndex: 2, top: 0, left: 0, right: 0 }}>
    <button onClick={onPlay}>Play</button>
    <button onClick={onPause}>Pause</button>
    <button
      style={{marginLeft: 20}}
      onClick={() => {
        /* eslint-disable */
        if (confirm("Warning: This process is in Beta. It can be very slow, and if your browser is hidden your render may fail. Video will not include sound.")) {
          onRender();
        }
        /* eslint-enable */
      }}
    >
        Save to Video
    </button>
    <button
      style={{marginLeft: 20}}
      onClick={() => {
        localStorage.clear();
        window.location.reload();
      }}
    >
        Forget Cached Data
    </button>
    <div style={{ fontFamily: 'courier', color: 'white' }} ref={readoutRef} />
  </div>
)
