import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import 'bootstrap/dist/css/bootstrap.min.css';
import { NotificationProvider } from './context/NotificationContext';
import { AuthProvider } from './context/authContext';

const rootElement = document.getElementById('root');

ReactDOM.render(
  <React.StrictMode>
      <NotificationProvider>
      <AuthProvider>
        <App />
        </AuthProvider>
    </NotificationProvider>,
  </React.StrictMode>,
  rootElement
);

reportWebVitals();
