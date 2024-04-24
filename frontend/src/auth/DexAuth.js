import {env} from '../env';

const oidcConfig = {
  authority: "http://localhost:5556/dex",
  clientId: env.REACT_APP_OIDC_CLIENT_ID,
  clientSecret: env.REACT_APP_OIDC_CLIENT_SECRET,
  // autoSignIn: true,
  responseType: env.REACT_APP_OIDC_RESPONSE_TYPE,
  scope: "openid profile email groups",
  redirectUri: window.location.origin,
  onSignIn: () => {
    window.location.replace(window.location.origin);
  },
};

export default oidcConfig;