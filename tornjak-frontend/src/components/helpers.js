require('dotenv').config();
var urljoin = require('url-join');

// API_SERVER_URL
export default function GetApiServerUri (uri) {
    const ApiServerUri = process.env["REACT_APP_API_SERVER_URI"];
    if (ApiServerUri) {
        return urljoin(ApiServerUri, uri)
    } else {
        return urljoin("/", uri)
    }
}

// const IS_DUBUG = process.env["REACT_APP_DEBUG_TORNJAK"] || window.DEBUG_TORNJAK;
// console.log(process.env["REACT_APP_DEBUG_TORNJAK"]);
// console.log(window.DEBUG_TORNJAK);

export const logDebug = function (...args){
    if (process.env["REACT_APP_DEBUG_TORNJAK"] || window.DEBUG_TORNJAK){ // real time variable
        console.log(...args);
    }
};

export const logError = function (...args){
    if (process.env["REACT_APP_DEBUG_TORNJAK"] || window.DEBUG_TORNJAK){ // real time variable
        console.error(...args);
    }
};

export const logWarn = function (...args){
    if (process.env["REACT_APP_DEBUG_TORNJAK"] || window.DEBUG_TORNJAK){ // real time variable
        console.warn(...args);
    }
};


// IS_MANAGER

