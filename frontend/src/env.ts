declare global {
    interface Window {
      env: any
    }
  }
  type EnvType = {
    REACT_APP_SPIRE_HEALTH_CHECK_ENABLE: string,
    REACT_APP_AUTH_SERVER_URI: string,
    REACT_APP_KEYCLOAK_REALM: string,
    REACT_APP_API_SERVER_URI: string,
    REACT_APP_TORNJAK_MANAGER: string,
    REACT_APP_OIDC: string,
    REACT_APP_OIDC_URI: string,
    REACT_APP_OIDC_CLIENT_ID: string,
    REACT_APP_OIDC_CLIENT_SECRET: string,
    REACT_APP_OIDC_RESPONSE_TYPE: string,
    REACT_APP_OIDC_SCOPES: string,
  }
  export const env: EnvType = { ...process.env, ...window.env }