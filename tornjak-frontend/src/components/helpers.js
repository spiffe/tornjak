require('dotenv').config();
var urljoin = require('url-join');

console.log(process.env.API_SERVER_URI);
const ApiServerUri = process.env["API_SERVER_URI"] || "http://localhost:10000"

function GetApiServerUri (uri) {
    return urljoin(ApiServerUri, uri)
}

module.exports = GetApiServerUri;
