import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ToastContainer, toast } from 'react-toastify';

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
(window as any).global = window;

root.render(
  <React.StrictMode>
	<ToastContainer />
    <App />
  </React.StrictMode>
);
