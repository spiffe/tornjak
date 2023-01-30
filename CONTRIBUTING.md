# Contributing

## Development: Building and pushing

The binary and container can be built with the following command, replacing the container tag with the desired container tag of choice.


This makes the tornjak agent + spire 1.1.3 server container:

```
CONTAINER_BACKEND_WITH_SPIRE_TAG=tsidentity/tornjak-spire-server:latest make container-tornjak-be-spire
```

The container is run with the same arguments as the SPIRE server image, and usage is transparent. It runs a server hosted on port 10000 accessed via http. A different spire version may be specified within the first line of the [Dockerfile.add-frontend](./Dockerfile.add-frontend#L1) file. Currently, SPIRE versions <= 1.4.0 are compatible with Tornjak.

Alternatively, pre-built Tornjak images can be found at `gcr.io/spiffe-io/tornjak-spire-server:{version}`, where the specified tag denotes the supported SPIRE server version, as listed in the [SPIRE_BUILD_VERSIONS](./SPIRE_BUILD_VERSIONS) document.

### Testing and validating the Tornjak front-end
To start a local version of the Tornjak front-end server
point at the running Tornjak APIs:

```console
cd tornjak-frontend
REACT_APP_API_SERVER_URI=http://<tornjak_API>/  npm start
```

Assuming `npm` is installed, this will start a server on `http://localhost:3000`
Please be patient, as it might take a few minutes to compile and start the server.

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
