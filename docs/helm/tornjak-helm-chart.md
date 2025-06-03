# Deploying Tornjak via Helm Charts

## Overview

You can deploy **Tornjak** using the [SPIFFE helm-charts-hardened repository](https://github.com/spiffe/helm-charts-hardened).

This guide walks you through deploying both the frontend and backend of Tornjak with Direct Access, using Helm charts in a local Kubernetes environment via Minikube.

By the end, you’ll have a working instance of SPIRE integrated with Tornjak for easier visibility and management of your SPIFFE identities.

## Prerequisites

Make sure you have the following installed on your system:

- [Minikube](https://minikube.sigs.k8s.io/docs/start/?arch=%2Fmacos%2Fx86-64%2Fstable%2Fbinary+download)
- [Helm](https://helm.sh/docs/intro/install/)

## Step-by-Step Deployment

### 1. Start Minikube

```sh
minikube start
```

### 2. Deploy SPIRE

Now we can excute the following to deploy our SPIRE instance:

```sh
helm upgrade --install -n spire-server spire-crds spire-crds --repo https://spiffe.github.io/helm-charts-hardened/ --create-namespace
```

### 3. Deploy Tornjak

Now we can deploy Tornjak with SPIRE.

First, we need to export the Tornjak backend API URL:

```sh
export TORNJAK_API=http://localhost:10000
```

Then, run the following Helm command to deploy Tornjak with the frontend and backend enabled:

```sh
helm upgrade --install -n spire-server spire spire \
--repo https://spiffe.github.io/helm-charts-hardened/ \
--set tornjak-frontend.apiServerURL=$TORNJAK_API \
--values helm/values.yaml \
--render-subchart-notes
```

### 4. Test Deployment

You can verify the deployment with:

```sh
helm test spire -n spire-server
```

### 5. Access Tornjak UI

Run the backend.

```sh
kubectl -n spire-server port-forward service/spire-tornjak-backend 10000:10000
```

In a separate terminal, run the frontend.

```sh
kubectl -n spire-server port-forward service/spire-tornjak-frontend 3000:3000
```

Open your browser and go to [http://localhost:3000](http://localhost:3000)
You should now see the Tornjak UI!
