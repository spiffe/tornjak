import Keycloak from "keycloak-js";
const keycloakConfig = {
    "realm": "tornjak",
    "url": process.env.REACT_APP_AUTH_SERVER_URI,
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

const getFirstName = () => keycloak.tokenParsed?.given_name;
const doLogin = keycloak.login;
const doLogout = keycloak.logout;
const getToken = () => keycloak.token;
const isLoggedIn = () => !!keycloak.token;
const updateToken = (successCallback) =>
    keycloak.updateToken(5)
        .then(successCallback)
        .catch(doLogin);

const KeycloakService = {
    initKeycloak,
    doLogin,
    doLogout,
    isLoggedIn,
    getToken,
    updateToken,
    getFirstName,
};

export default KeycloakService;