declare global {
    interface Window {
      env: any
    }
  }
  type EnvType = {
    REACT_APP_SPIRE_HEALTH_CHECK_ENABLE: string,
    REACT_APP_AUTH_SERVER_URI: string,
    REACT_APP_API_SERVER_URI: string,
    REACT_APP_TORNJAK_MANAGER: string,
  }
  export const env: EnvType = { ...process.env, ...window.env }