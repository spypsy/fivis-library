import axios from 'axios';
import { configure } from 'axios-hooks';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { isInstrumentedApiUrl, logApiPerf } from 'utils/apiPerf';

import App from './App';

axios.defaults.withCredentials = true;
axios.interceptors.response.use(response => {
  const url = response.config.url;
  if (isInstrumentedApiUrl(url)) {
    const label = url?.includes('/api/books/mine') ? 'books-mine' : 'author-by-name';
    logApiPerf(label, response);
  }
  return response;
});
configure({ axios });

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
