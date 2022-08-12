import Keycloak from "keycloak-js";
const keycloak = new Keycloak({
 url: "http://localhost:8080",
 realm: "tornjak",
 clientId: "Tornjak-React-auth",
});

export default keycloak;
