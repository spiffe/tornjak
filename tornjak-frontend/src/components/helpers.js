require('dotenv').config();
var urljoin = require('url-join');

console.log(process.env.API_SERVER_URI);
const ApiServerUri = process.env["API_SERVER_URI"]

function GetApiServerUri (uri) {
    if (ApiServerUri) {
        return urljoin(ApiServerUri, uri)
    } else {
        return urljoin("/", uri)
    }
}

module.exports = GetApiServerUri;
