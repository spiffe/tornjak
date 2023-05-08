# Contributing

- [Contributor Guidelines and Governance](#contributor-guidelines-and-governance)
- [Pre-built images](#pre-built-images)
- [Build Requirements](#build-requirements)
- [Building Executables and Images from Scratch](#building-executables-and-images)
- [Development](#development)
- [Local Testing](#local-testing)

## Contributor Guidelines and Governance

Please see [CONTRIBUTING](https://github.com/spiffe/spiffe/blob/main/CONTRIBUTING.md) and [GOVERNANCE](https://github.com/spiffe/spiffe/blob/main/GOVERNANCE.md) from the SPIFFE project. 

## Pre-built images

You can use pre-built images for various versions and Tornjak components. For a list of supported public images of Tornjak along with usage instructions please see our [USAGE document](./USAGE.md).

Otherwise, you can follow instructions below to build Tornjak images. 

## Build Requirements

In order to build, we require the following installations:
- [Docker](https://docs.docker.com/engine/install/) for the backend build
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) for the frontend build if running locally
- [Golang](https://go.dev/doc/install) is required if you would like to run the Go backends locally

## Building Executables and Images

Building Tornjak manually can be done with the Makefile. Notable make targets follow:
- `make bin/tornjak-backend`: makes the Go executable of the Tornjak backend
- `make bin/tornjak-manager`: makes the Go executable of the Tornjak manager
- `make ui-agent`: makes the optimized ReactJS app locally for the Tornjak frontend
- `make container-tornjak-backend`: containerizes Go executable of the Tornjak backend
- `make container-manager`:containerizes Go executable of the Tornjak manager
- `make container-frontend`: containerizes React JS app for the Tornjak frontend
- `make container-tornjak`: containerizes Tornjak backend with Tornjak frontend

For usage instructions of the containers, please see our [USAGE document](./USAGE.md) to get started.

## Development

We welcome all development attempst and contributions from the community. The easiest place to start is by reviewing our code architecture diagrams available in our [api documentation](./docs/tornjak-ui-api-documentation.md#11-overview).

## Local testing

We highly recommend starting with our [quickstart tutorial](./docs/tornjak-quickstart.md), using official images and preset configs before development. This tutorial creates a local instance of SPIRE on Minikube, adds Tornjak server, and runs a UI. 

Additionally, one may test out several other features including the following:
- [Running the Frontend Locally](#running-the-frontend-locally)
- [Running the Backend Locally](#running-the-backend-locally)
- [Running the Tornjak Manager Locally](#running-the-tornjak-manager)
- [User Management](#user-management)

Usage documentation for each of the Tornjak components can be found in our [Usage document](./USAGE.md).

### Running the Frontend Locally

An excellent feature for frontend development is the ability to make changes to the frontend code without needing to restart the application.  To start a local version of the Tornjak frontend, one must have it point at the running Tornjak APIs:

```console
cd tornjak-frontend
REACT_APP_API_SERVER_URI=http://<tornjak_API>/  npm start
```

Assuming `npm` is installed, this will start a server on `http://localhost:3000`
Please be patient, as it might take a few minutes to compile and start the server.

### Running the Backend Locally

The backend may also be run locally as well. 

```console
go run tornjak-backend/cmd/agent/agent.go
```

Note, the above command will print out usage documentation for the server. Please see our documentation for the backend [here](./docs/config-tornjak-agent.md) for more information.  Additionally, full functionality of the server requires a SPIRE server to be running. 

### Running the Tornjak Manager

You may run the uncontainerized Tornjak manager by locally running the following:

```
go run tornjak-backend/cmd/manager/manager.go
```

which starts listening on port 50000.

To start the manager UI, run:

```
REACT_APP_API_SERVER_URI=http://localhost:50000/
REACT_APP_TORNJAK_MANAGER=true npm start
```

In this view, there is an additional navigation bar tab titled "Manage Servers" where you may register Tornjak agents. 

Alternatively, one may also run these components in a container, as is described in our [USAGE doc](./USAGE.md).

### User Management

User Management is an optional feature that prevents un-authorized access to Tornjak and SPIRE APIs. We have several comprehensive resources for getting started with integrating user management in this [User Management documentation](./docs/user-management.md).
