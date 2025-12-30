// src/index.js
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

// Lưu ý: KHÔNG import theme hay ThemeProvider ở đây nữa
// Mọi logic giao diện đã được chuyển vào App.js

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);