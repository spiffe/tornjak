import {env} from '../env';
var urljoin = require('url-join');

// API_SERVER_URL
const ApiServerUri = env["REACT_APP_API_SERVER_URI"];

export default function GetApiServerUri (uri: string): string {
    return urljoin(ApiServerUri ? ApiServerUri : "/", uri)
}

// const IS_DUBUG = process.env["REACT_APP_DEBUG_TORNJAK"] || window.DEBUG_TORNJAK;
// console.log(process.env["REACT_APP_DEBUG_TORNJAK"]);
// console.log(window.DEBUG_TORNJAK);

export const logDebug = function (...args: any[]) {
    if (process.env["REACT_APP_DEBUG_TORNJAK"]) { // real time variable
        console.log(...args);
    }
};

export const logError = function (...args: any[]) {
    if (process.env["REACT_APP_DEBUG_TORNJAK"]) { // real time variable
        console.error(...args);
    }
};

export const logWarn = function (...args: any[]) {
    if (process.env["REACT_APP_DEBUG_TORNJAK"]) { // real time variable
        console.warn(...args);
    }
};


// IS_MANAGER

