import React from 'react';
import ReactDOM from 'react-dom';
import StudioTemplate from './StudioTemplate';
import LiveTemplate from './LiveTemplate';

ReactDOM.render(
  window.location.href.includes('live=true')
    ? <LiveTemplate />
    : <StudioTemplate />,
  document.getElementById('root')
);
