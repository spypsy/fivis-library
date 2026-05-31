import axios from 'axios';
import { configure } from 'axios-hooks';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

axios.defaults.withCredentials = true;
configure({ axios });

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
