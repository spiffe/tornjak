import Keycloak from "keycloak-js";

const keycloak = new Keycloak('/keycloak.json');
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

const doLogin = keycloak.login;
const doLogout = keycloak.logout;
const getToken = () => keycloak.token;
const isLoggedIn = () => !!keycloak.token;
const updateToken = (successCallback) =>
    keycloak.updateToken(5)
        .then(successCallback)
        .catch(doLogin);
const getUsername = () => keycloak.tokenParsed?.preferred_username;
const getFirstName = () => keycloak.tokenParsed?.given_name;
const hasRole = (roles) => roles.some((role) => keycloak.hasRealmRole(role));

const KeycloakService = {
    initKeycloak,
    doLogin,
    doLogout,
    isLoggedIn,
    getToken,
    updateToken,
    getUsername,
    getFirstName,
    hasRole,
};

export default KeycloakService;