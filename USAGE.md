# Usage

We publish four container images currently:
- [Tornjak Backend](https://github.com/spiffe/tornjak/pkgs/container/tornjak-backend): This image can be deployed as a sidecar with any SPIRE server. 
- [Tornjak Manager](https://github.com/spiffe/tornjak/pkgs/container/tornjak-manager): A container that runs this image exposes a port to register multiple Tornjak backends and forward typical commands to multiple Tornjak backends from one API. 
- [Tornjak Frontend](https://github.com/spiffe/tornjak/pkgs/container/tornjak-frontend): This image is typically deployed after the Tornjak Backend or Manager are deployed, as it requires a URL to connect directly to the Tornjak backend API.  
- [Tornjak](https://github.com/spiffe/tornjak/pkgs/container/tornjak): This image containing both Tornjak Backend and Frontend components can deployed as a sidecar alongside a SPIRE Server container

NOTE: Previously, we had images placing the Tornjak backend and SPIRE server in the same container, but these are currently deprecated. The above is a comprehensive list of images

Pre-built images can be found at the above links. To decide which tag to use, typically choose a release from [this page](https://github.com/spiffe/tornjak/releases) and choose the corresponding tag. For example, if you are interested in release `tornjak-1.0.2`, then choose image tag `v1.0.2`.

### Compatibility Table

Please see below for compatibility charts of SPIRE server versions with Tornjak:

| Tornjak version        | SPIRE Server version |
| :--------------------- | :------------------- |
| v1.1.x, v1.2.x, v1.3.x | v1.1.x, v1.2.x, v1.3.x, v1.4.x |

## Tornjak Backend

This is meant to be deployed where it can access a SPIRE server. To run, the container has three arguments:

| Flag                   | Description                                                 | Default | Arguments | Required |
|:-----------------------|:------------------------------------------------------------|:--------|:----------|:---------|
| `--spire-config`       | Config file path for SPIRE server                           |         | `<path>`  | true     |
| `--tornjak-config`     | Config file path for Tornjak (see our [configuration reference](./docs/config-tornjak-agent.md)) | | `<path>` | true |
| `--expandEnv`          | If included, expand environment variables in Tornjak config | False   |           | false    |

```
docker run -p 10000:10000 ghcr.io/spiffe/tornjak-backend:latest -c <SPIRE CONFIG PATH> -t <TORNJAK CONFIG PATH> -expandEnv
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

| Variable                    | Description | Default | Example Argument | Required |
|:----------------------------|-------------|--|--|--|
| `REACT_APP_API_SERVER_URI`  | URI for the Tornjak backend or Manager to connect to |   | `http://localhost:10000` | true |
| `NODE_OPTIONS`              | Node options for npm start | `--openssl-legacy-provider` | `--openssl-legacy-provider` | false |
| `REACT_APP_TORNJAK_MANAGER` | Boolean for whether the connected server is a manager | `false` | `true` | false |
| `REACT_APP_AUTH_SERVER_URI` | URI for the Keycloak instance to obtain access tokens |  | `http://localhost:8080` | false |
| `PORT_FE` | Port for the frontend to run | `3000` | `3000` | true |
| `PORT_BE` | Port for the backend to run | `10000` | `10000` | true |
| `REACT_APP_SPIRE_HEALTH_CHECK_ENABLE` | Enable SPIRE health check component | `false` | `true` | false |

```
docker run -p 3000:8080 -e REACT_APP_API_SERVER_URI='http://localhost:50000' -e REACT_APP_TORNJAK_MANAGER=true -e PORT_FE-8080 -e REACT_APP_SPIRE_HEALTH_CHECK=true ghcr.io/spiffe/tornjak-frontend:latest
```

The above command is an example of how to run the frontend. This creates a UI available at http://localhost:3000 forwarded from container port `8080`. It is listening to a Tornjak manager component available at http://localhost:50000, and knows to run in manager mode with the `REACT_APP_TORNJAK_MANAGER` flag. The last environment variables namely, `REACT_APP_SPIRE_HEALTH_CHECK_ENABLE` is used to enable the SPIRE health check component. 

## Tornjak

This container may be used as an alternative to having a frontend and backend container separately. The backend is configured exactly as the [Tornjak backend] with container arguments, and the frontend is configured exactly as the [Tornjak frontend] with container environment variables. 

An example command:

```
docker run -p 10000:10000 -p 3000:8080 -e REACT_APP_API_SERVER_URI='http://localhost:10000' -e PORT_FE-8080 -e PORT_BE-10000 ghcr.io/spiffe/tornjak:latest -c <SPIRE CONFIG PATH> -t <TORNJAK CONFIG PATH>
```

The above command creates a UI available at `http://localhost:3000` forwarded from container port `8080`. It is listening to the Tornjak backend at `http://localhost:10000`, as given by the `REACT_APP_API_SERVER_URI` value. At the same time, the container is exposing port `10000` for the backend, which reads the SPIRE config and Tornjak config at `<SPIRE CONFIG PATH>` and `<TORNJAK CONFIG PATH>` respectively. 

NOTE: The value of `REACT_APP_API_SERVER_URI` must be a URI that is separately available to any browser that accesses the frontend. Therefore, in production environments, it is necessary that backend service endpoint be public. 


## Further steps

It is recommended to try a full deployment of the Tornjak frontend, backend, and SPIRE Server in minikube. Please see our [tutorial document](docs/quickstart/README.md) for step-by-step instructions. 


