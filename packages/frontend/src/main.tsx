import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom'; // Import BrowserRouter
import App from './App.tsx';
import './index.css'; // File CSS cơ bản

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    {/* Bọc App component bằng BrowserRouter để kích hoạt routing */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);