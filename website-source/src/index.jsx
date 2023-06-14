import React from 'react';
import ReactDOM from 'react-dom/client';
import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  // NOTE: In DEV these effects get called TWICE on every run instead of once. React is doing this to find issues in the flow and warn you about them. In production you shouldn't see these constant dual fires though.
  // https://stackoverflow.com/a/61897567/4982408
  // You can disable this behavior by commenting out the <React.StrictMode> opening and closing tags,
  // although leaving them in most of the time should help improve your code.
  // TODO: Test it all once through with StrictMode on.
  // <React.StrictMode>
  <App />,
);
