import {env} from '../env';
// import { useAuth } from "oidc-react";

const dexConfig = {
  authority: "http://dex.dex:5556/dex",
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

// const IsAuthenticated = () => useAuth().userData?.id_token ? true : false;
// const isAuthenticated = IsAuthenticated();
// console.log("IsAuthenticated", isAuthenticated)
// const DexConfig = () => {
//     const auth = useAuth();
//     const isAuthenticated = auth.userData?.id_token ? true : false;
  
//     console.log("isAuthenticated: ", isAuthenticated);
//     return dexConfig;
// };


export default dexConfig;