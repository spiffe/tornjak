import {env} from '../env';

const oidcConfig = {
  authority: env.REACT_APP_OIDC_URI,
  clientId: env.REACT_APP_OIDC_CLIENT_ID,
  clientSecret: env.REACT_APP_OIDC_CLIENT_SECRET,
  // autoSignIn: true,
  responseType: env.REACT_APP_OIDC_RESPONSE_TYPE,
  scope: env.REACT_APP_OIDC_SCOPES,
  redirectUri: window.location.origin,
  onSignIn: () => {
    window.location.replace(window.location.origin);
  },
};

export default oidcConfig;