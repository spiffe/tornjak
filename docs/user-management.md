# User Management

This document compiles all the information on the user management integration we have experimented with. 

Currently, this feature is available only for a single instance of a Tornjak agent with a frontend. 

## Overview

We follow the OAuth2.0 spec for authentication. The diagrams below show the implemented [Standard Authorization Code Flow](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow):
![standard](./rsrc/standard-auth-code-flow.png)

We will eventually be implementing the [Authorization Code Flow with PKCE](https://auth0.com/docs/get-started/authentication-and-authorization-flow/authorization-code-flow-with-proof-key-for-code-exchange-pkce) to secure the backend with a public frontend application. This is necessary as the public frontend cannot store client secrets securely: 
![pkce](./rsrc/pkce-auth-code-flow.png)

A more in-depth Medium article for the overall architecture can be found [here](https://medium.com/universal-workload-identity/identity-access-management-iam-integration-with-tornjak-749984966ab5). 

## Architecture

[TODO insert architecture diagram here]

The architecture integrates with a separate Auth server. This Auth server is used to secure the backend, which can be configured to expected access tokens signed by a given list of public keys.  Then, any callers to the Auth server must be able to obtain such an access token.  

## General Deployment

In order to deploy, there are several steps:

1. There must be an existing, preconfigured auth server for Tornjak components to integrate with. 
2. The backend is deployed with a configuration pointing to said auth server. 
3. The frontend must be deployed configured to obtain access tokens from said auth server before sending calls to the backend. 

## Examples and Tutorials

We have experimented extensively with the open source Keycloak Auth server. Specifically, it is very easy to set up a Tornjak secured by Keycloak today. 

To configure the Auth server, please see our [Medium blog](https://medium.com/universal-workload-identity/step-by-step-guide-to-setup-keycloak-configuration-for-tornjak-dbe5c3049034) for a walkthrough on configuring the auth server. For more in-depth documentation on this setup, please see [this document on Keycloak configuration](./keycloak-configuration.md).

Once the Auth server is set up, we can deploy the backend to require access tokens from our auth server, as detailed in [this followup Medium blog](https://medium.com/universal-workload-identity/guide-to-integrating-tornjak-with-keycloak-for-access-control-to-spire-40a3d5ee5f5a), with more details on the general configuration [here](https://github.com/spiffe/tornjak/blob/main/docs/config-tornjak-agent.md). 

Finally, the frontend must be deployed and configured to obtain access tokens from this auth server. This can be done locally with the environment variable `REACT_APP_AUTH_SERVER_URI`:

```
cd tornjak-frontend
REACT_APP_API_SERVER_URI=http://localhost:10000/
REACT_APP_AUTH_SERVER_URI=http://localhost:8080/ npm start
```

Alternatively, we can do the same on the containerized version:

```
docker run -p 3000:3000 -d -e REACT_APP_API_SERVER_URI='http://localhost:10000' -e REACT_APP_AUTH_SERVER_URI='http://localhost:8080' tsidentity/tornjak-frontend:latest
```

This will start a server on `http://localhost:3000`
Please be patient, as it might take a few minutes to compile and start the server.

Given the Auth server configuration above, we have an admin and a viewer user type. An Admin User will have an Admin portal with admin privilages and a viewer user will have restricted access for the Tornjak UI only for viewing.  
