# Usage

We support three container images currently:
- [Tornjak Backend](https://github.com/spiffe/tornjak/pkgs/container/tornjak-be): This image can be deployed as a sidecar with any SPIRE server. 
- [Tornjak Manager](https://github.com/spiffe/tornjak/pkgs/container/tornjak-manager): A container that runs this image exposes a port to register multiple Tornjak backends and forward typical commands to multiple Tornjak backends from one API. 
- [Tornjak Frontend](https://github.com/spiffe/tornjak/pkgs/container/tornjak-fe): This image is typically deployed after the Tornjak Backend or Manager are deployed, as it requires a URL to connect directly to the Tornjak backend API.  

NOTE: Previously, we had images placing the Tornjak backend and SPIRE server in the same container, but these were recently deprecated. Images other than those above are NOT currently supported. 

## Tornjak Backend

This is meant to be deployed where it can access a SPIRE server. To run, the container has three arguments:

| Flag                  | Description                                                 | Default | Arguments | Required |
|:----------------------|:------------------------------------------------------------|:--------|:----------|:---------|
| `-config\|-c`         | Config file path for SPIRE server                           |         | <path>    | true     |
| `-tornjak-config\|-t` | Config file path for Tornjak (see our [configuration reference](./docs/config-tornjak-agent.md)) | | <path> | false |
| `-expandEnv`          | If included, expand environment variables in Tornjak config | False   |           | false    |

```
docker run -p 10000:10000 -d ghcr.io/spiffe/tornjak-be:latest -c <SPIRE CONFIG PATH> -t <TORNJAK CONFIG PATH> -expandEnv
```

The above command creates a container listening at http://localhost:10000 for Tornjak API calls. Note that the config files must be accessible from INSIDE the container. Also note, this expands the container's environment variables in the Tornjak config map. 

For more instructions on Tornjak config formatting, please see our [configuration reference](./docs/config-tornjak-agent.md).

## Tornjak Manager

The manager is meant to be deployed where it can access all Tornjak backends we want to manage. To run, the container has no arguments. An example is below:

```
docker run -p 50000:50000 -d ghcr.io/spiffe/tornjak-manager:latest
```

This creates a service listening on container port 50000, forwarded to localhost:50000 for Tornjak Manager API calls. 

## Tornjak Frontend

The frontend is meant to connect to either the Tornjak backend or the Tornjak manager. To run the container, we must set some environment variables:

| Variable                    | Description | Default | Argument | Required |
|:----------------------------|-------------|--|--|--|
| `REACT_APP_API_SERVER_URI`  |             |  |  |  |
| `REACT_APP_TORNJAK_MANAGER` |             |  |  |  |
| `REACT_APP_AUTH_SERVER_URI` |             |  |  |  |

```
docker run -p 3000:3000 -e REACT_APP_API_SERVER_URI='http://localhost:50000' -e REACT_APP_TORNJAK_MANAGER=true ghcr.io/spiffe/tornjak-fe:latest
```

The above command is an example of how to run the frontend. This creates a UI available at http://localhost:3000 forwarded from container port 3000. It is listening to a Tornjak manager component available at http://localhost:50000, and knows to run in manager mode with the `REACT_APP_TORNJAK_MANAGER` flag. 

## Further steps

It is recommended to try a full deployment of the Tornjak frontend, backend, and SPIRE Server in minikube. Please see our [tutorial document](./docs/tornjak-quickstart.md) for step-by-step instructions. 





-------------

### Running the Tornjak Manager
Once you have a Tornjak agent running, you may run the Tornjak manager by locally running

```
go run tornjak-backend/cmd/manager/manager.go
```

which starts listening on port 50000. To start the manager UI, run:

```
REACT_APP_API_SERVER_URI=http://localhost:50000/
REACT_APP_TORNJAK_MANAGER=true npm start
```

In this view, there is an additional navigation bar tab titled "Manage Servers" where you may register Tornjak agents.  

Alternatively, one may also run these components in a container. 

### Testing and validating the Tornjak frontend
To start a local version of the Tornjak frontend, one must have a point at the running Tornjak APIs:

```console
cd tornjak-frontend
REACT_APP_API_SERVER_URI=http://<tornjak_API>/  npm start
```

Assuming `npm` is installed, this will start a server on `http://localhost:3000`
Please be patient, as it might take a few minutes to compile and start the server.

## Enable User Management
User Management prevents un-authorized access to Tornjak and SPIRE APIs.
For more information on enabling the User Management and Keycloak configuration,
please check [docs/keycloak-configuration.md](docs/keycloak-configuration.md) document.

First, start Keycloak instance locally:

```
docker run -p 8080:8080 -e KEYCLOAK_ADMIN=”username” -e KEYCLOAK_ADMIN_PASSWORD=”password” quay.io/keycloak/keycloak:19.0.1 start-dev
```

Keycloak instance will start listening port on 8080

Next, start the Tornjak with Auth service:

```
cd tornjak-frontend
REACT_APP_API_SERVER_URI=http://localhost:10000/
REACT_APP_AUTH_SERVER_URI=http://localhost:8080/ npm start
```

To build the frontend on a container as a separate image:

Note: Make sure CONTAINER_TAG_FRONTEND point at your directory, as tsidentity can only be used for pulling but not pushing.

```
CONTAINER_TAG_FRONTEND=tsidentity/tornjak-fe:latest
make container-frontend-push
```

## User Management Disabled

To test build image locally, run:

```
docker run -p 3000:3000 -d -e REACT_APP_API_SERVER_URI='http://localhost:10000' tsidentity/tornjak-fe:latest
```

Alternatively, to run the image with the authentication/authorization enabled on the local Keycloak instance, run:

```
docker run -p 3000:3000 -d -e REACT_APP_API_SERVER_URI='http://localhost:10000' -e REACT_APP_AUTH_SERVER_URI='http://localhost:8080' tsidentity/tornjak-fe:latest
```

This will start a server on `http://localhost:3000`
Please be patient, as it might take a few minutes to compile and start the server.

Depending on the user used to signin, there will be two different views.
An Admin User will have an Admin portal with admin privilages and a viewer user will have restricted access for the Tornjak UI only for viewing.  
