require('dotenv').config();
var urljoin = require('url-join');

// API_SERVER_URL
//console.log(process.env.API_SERVER_URI);
const ApiServerUri = process.env["REACT_APP_API_SERVER_URI"];

export default function GetApiServerUri (uri: string): string {
    if (ApiServerUri) {
        return urljoin(ApiServerUri, uri)
    } else {
        return urljoin("/", uri)
    }
}

