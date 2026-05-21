import React from 'react';
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import store from './app/store';
import App from './App';
import './index.css';
import './i18n';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Toaster position="top-right" toastOptions={{
          duration: 3000,
          style: { fontFamily: 'var(--font-family)', borderRadius: 'var(--radius-md)', fontSize: '0.875rem' },
          success: { style: { background: '#DCFCE7', color: '#166534' } },
          error: { style: { background: '#FEE2E2', color: '#991B1B' } },
        }} />
      </BrowserRouter>
    </Provider>
  </React.StrictMode>
);
