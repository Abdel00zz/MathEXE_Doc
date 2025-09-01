
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { AppProvider } from './contexts/AppContext';
import { ToastProvider } from './contexts/ToastContext';
import { HashRouter } from 'react-router-dom';
import { ensureMathJax } from './services/mathjaxLoader';

const rootElement = document.getElementById('root');
if (!rootElement) {
  throw new Error("Could not find root element to mount to");
}

const root = ReactDOM.createRoot(rootElement);
// Kick off MathJax load early (fire & forget)
ensureMathJax();

root.render(
  <React.StrictMode>
    <HashRouter>
      <ToastProvider>
        <AppProvider>
          <App />
        </AppProvider>
      </ToastProvider>
    </HashRouter>
  </React.StrictMode>
);