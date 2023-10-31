import { AxiosRequestConfig as OriginalAxiosRequestConfig } from "axios";

declare module "axios" {
  export interface AxiosRequestConfig extends OriginalAxiosRequestConfig {
    // custom properties 
    crossdomain: boolean;
  }
}
