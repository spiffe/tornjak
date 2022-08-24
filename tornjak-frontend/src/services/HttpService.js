import axios from "axios";
import KeycloakService from "./KeycloakService";

const HttpMethods = {
  GET: 'GET',
  POST: 'POST',
  DELETE: 'DELETE',
};

const _axios = axios.create();

const configure = () => {
  _axios.interceptors.request.use((config) => {
    console.log("Is Logged In: ", KeycloakService.isLoggedIn())
    if (KeycloakService.isLoggedIn()) {
      const cb = () => {
        config.headers.Authorization = `Bearer ${KeycloakService.getToken()}`;
        return Promise.resolve(config);
      };
      return KeycloakService.updateToken(cb);
    }
  });
};

const getAxiosClient = () => _axios;

const HttpService = {
  HttpMethods,
  configure,
  getAxiosClient,
};

export default HttpService;