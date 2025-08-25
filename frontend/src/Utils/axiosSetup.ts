import axios from 'axios';

// Callback to notify app when server is down
let onServerDownCallback: (() => void) | null = null;

export const setServerDownHandler = (callback: () => void) => {
  onServerDownCallback = callback;
};

// Axios response interceptor to catch network/server down errors
axios.interceptors.response.use(
  response => response,
  error => {
    // If no response (network error or server down)
    if (!error.response) {
      console.warn('Axios interceptor detected network/server down');

      if (onServerDownCallback) {
        onServerDownCallback();
      }
    }
    return Promise.reject(error);
  }
);