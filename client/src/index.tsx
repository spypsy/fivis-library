import axios from 'axios';
import { configure } from 'axios-hooks';
import { readActiveLibrary } from 'hooks/activeLibrary';
import React from 'react';
import ReactDOM from 'react-dom/client';

import App from './App';

axios.defaults.withCredentials = true;
axios.interceptors.request.use(config => {
  const activeLibrary = readActiveLibrary();
  if (activeLibrary?.ownerId) {
    config.headers = config.headers || {};
    config.headers['x-library-owner'] = activeLibrary.ownerId;
  }
  return config;
});
configure({ axios });

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
