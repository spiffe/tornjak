import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';
import KeycloakService from "./auth/KeycloakAuth";
import {env} from './env';
import { AuthProvider } from "oidc-react";

const configuration = {
  authority: 'http://127.0.0.1:5556/dex/auth',
  clientId: 'tornjak',
  // autoSignIn: true,
  responseType: "id_token",
  scope: "openid profile email",
  // redirectUri: window.location.origin,
  redirect_uri: 'http://localhost:3000/callback',
  //audience: process.env.REACT_APP_OIDC_AUDIENCE,
  onSignIn: () => {
    window.location.replace(window.location.origin);
  },
};

const renderApp = () => ReactDOM.render(<App />, document.getElementById('root'));

if (env.REACT_APP_AUTH_SERVER_URI) { // with Auth for testing purposes
  KeycloakService.initKeycloak(renderApp);
}
else if (env.REACT_APP_DEX) {
  <AuthProvider {...configuration}>
    renderApp();
  </AuthProvider>
} 
else {
  renderApp(); // without Auth
}

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
