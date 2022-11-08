import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import KeycloakService from "./auth/KeycloakAuth";

const renderApp = () =>
  ReactDOM.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>,
    document.getElementById('root')
  );

if(process.env.REACT_APP_AUTH_SERVER_URI) { // with Auth for testing purposes
  KeycloakService.initKeycloak(renderApp);
} else {
  renderApp(); // without Auth
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
