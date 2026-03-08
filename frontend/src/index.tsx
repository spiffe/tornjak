import React from 'react';
import { createRoot } from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import KeycloakService from "./auth/KeycloakAuth";
import {env} from './env';

const container = document.getElementById('root');
if (!container) throw new Error('Root element not found');
const root = createRoot(container);

const renderApp = () => root.render(<App />);

if (env.REACT_APP_AUTH_SERVER_URI) { // with Auth for testing purposes
  KeycloakService.initKeycloak(renderApp);
} else {
  renderApp(); // without Auth
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
