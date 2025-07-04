import React from 'react';
import ReactDOM from 'react-dom/client'; // ⬅️ սա նորն է
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import { sendToVercelAnalytics } from './vitals';

// Ստեղծում ենք root
const container = document.getElementById('root');
const root = ReactDOM.createRoot(container); // ⬅️ React 18 մեթոդ

root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

reportWebVitals(sendToVercelAnalytics);
