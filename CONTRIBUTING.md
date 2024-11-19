# Contributing

- [Contributor Guidelines and Governance](#contributor-guidelines-and-governance)
- [Pre-built images](#pre-built-images)
- [Build Requirements](#build-requirements)
- [Building Executables and Images from Scratch](#building-executables-and-images)
- [Development](#development)
- [Local Testing](#local-testing)

## Contributor Guidelines and Governance

Please see [CONTRIBUTING](https://github.com/spiffe/spiffe/blob/main/CONTRIBUTING.md) and [GOVERNANCE](https://github.com/spiffe/spiffe/blob/main/GOVERNANCE.md) from the SPIFFE project for community guidelines. 

> [!IMPORTANT] 
> Before opening a new issue, search for any existing issues [here](https://github.com/spiffe/tornjak/issues) to avoid duplication.

If you're new to this project, we recommend you join us on [Slack](https://spiffe.slack.com/archives/C024JTTK58T) for discussion of potential new features. 

## Pre-built images

You can use pre-built images for various versions and Tornjak components. For a list of supported public images of Tornjak along with usage instructions please see our [USAGE document](./USAGE.md).

Otherwise, you can follow instructions below to build Tornjak images. 

## Build Requirements

In order to build, we require the following installations:
- [Docker](https://docs.docker.com/engine/install/) for the backend build
- [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) for the frontend build if running locally
- [Golang](https://go.dev/doc/install) is required if you would like to run the Go backends locally

## Building Executables and Images

Building Tornjak manually can be done with the Makefile. Below is a list of local executable builds: 
- `make bin/tornjak-backend`: makes the Go executable of the Tornjak backend
- `make bin/tornjak-manager`: makes the Go executable of the Tornjak manager
- `make frontend-local-build`: makes the optimized ReactJS app locally for the Tornjak frontend. Uses environment variable configuration as in tornjak-frontend/.env

And below is a list of container image builds: 
- `make image-tornjak-backend`: containerizes Go executable of the Tornjak backend
- `make image-tornjak-manager`:containerizes Go executable of the Tornjak manager
- `make image-tornjak-frontend`: containerizes React JS app for the Tornjak frontend

For usage instructions of the containers, please see our [USAGE document](./USAGE.md) to get started.

## Development

We welcome all development attempts and contributions from the community. The easiest place to start is by reviewing our code architecture diagrams available in our [api documentation](./docs/tornjak-ui-api-documentation.md#11-overview).

## Opening a pull request

1. Fork the tornjak repo
2. Ensure your branch is based on the latest commit in `main`
3. Commit changes to your fork. Make sure your commit messages contain a `Signed-off-by: <your-email-address>` line (see `git-commit --signoff`) to certify the [DCO](/DCO)
4. Test your PR locally and ensure all tests in Github actions pass
5. Open a [pull request](https://help.github.com/articles/creating-a-pull-request-from-a-fork/)
  against the upstream `main` branch

> [!IMPORTANT] 
> Please make sure you open all PRs against the `main` branch

> [!IMPORTANT] 
> For any new feature design, or feature level changes, please create an issue first, then submit a PR with design details before code implementation.

## After your pull request is submitted

At least one maintainer must approve the pull request.

Once your pull request is submitted, it's your responsibility to:

* Respond to reviewer's feedback
* Keep it merge-ready at all times until it has been approved and actually merged

Following approval, the pull request will be merged by the last maintainer to approve the request.

#### Third-party code

When third-party code must be included, all licenses must be preserved. This includes modified
third-party code and excerpts, as well.

Thank you for contributing to Tornjak!

## Local testing

We highly recommend starting with our [quickstart tutorial](docs/quickstart/README.md), using official images and preset configs before development. This tutorial creates a local instance of SPIRE on Minikube, adds Tornjak server, and runs a UI. 

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
npm install
REACT_APP_API_SERVER_URI=http://localhost:3000  npm start
```

This will start a server on `http://localhost:3000`. Please be patient, as it might take a few minutes to compile and start the server.

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

### Windows Line Ending Troubleshooting

1. On Windows, files use CRLF (`\r\n`) line endings, but Git (Linux) uses LF (`\n`) line endings.

2. We can check the status of line endings using:  
   ```console
   git config --global core.autocrlf
   ```

3. If there is no status, Windows will use its own line endings. We can fix this issue by setting:  
   ```console
   git config --global core.autocrlf true
   ```

4. Now if we run the command in step 2 again:  
   ```console
   git config --global core.autocrlf
   ```  
   Windows should now output:  
   ```console
   true
   ```

5. Files are now checked out with CRLF (Windows format), and files are committed with LF (Unix format).

