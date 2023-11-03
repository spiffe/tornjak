import Keycloak from "keycloak-js";
import {env} from '../env';
const keycloakConfig = {
    "realm": "tornjak",
    "url": env.REACT_APP_AUTH_SERVER_URI,
    "ssl-required": "external",
    "clientId": "Tornjak-React-auth",
    "public-client": true,
    "verify-token-audience": true,
    "use-resource-role-mappings": true,
    "confidential-port": 0
};
const keycloak = new Keycloak(keycloakConfig);
const initKeycloak = (renderApp) => {
    keycloak.init({ onLoad: 'login-required' })
        .then((authenticated) => {
            if (authenticated) {
                console.log("User is authenticated...Redirecting to Tornjak App!");
                renderApp();
            } else {
                console.log("User is not authenticated...Redirecting to Keycloak Login!");
                doLogin();
            }
        })
        .catch(console.error);
};

// get user attributes
const getFirstName = () => keycloak.tokenParsed?.given_name;

// login
const isLoggedIn = () => !!keycloak.token;
const doLogin = keycloak.login;

// logout
const doLogout = keycloak.logout;

// token
const getToken = () => keycloak.token;
const updateToken = (successCallback) =>
    keycloak.updateToken()
        .then(successCallback)
        .catch(doLogin);

const KeycloakService = {
    initKeycloak,
    getFirstName,
    isLoggedIn,
    doLogin,
    doLogout,
    getToken,
    updateToken,
};

export default KeycloakService;