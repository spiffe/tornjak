# Deploying Tornjak via SPIFFE Helm Charts Hardened

## Overview

You can deploy **Tornjak** using the [SPIFFE Helm Charts Hardened](https://github.com/spiffe/helm-charts-hardened)
repository. 

This guide walks you through deploying both the frontend and backend of Tornjak with Direct Access, 
using Helm charts in a local Kubernetes environment via Minikube. By the end, you’ll have a working instance 
of SPIRE integrated with Tornjak for easier visibility and management of your SPIFFE identities. 

## Prerequisites

Make sure you have the following installed on your system:

- [Minikube](https://minikube.sigs.k8s.io/docs/start/?arch=%2Fmacos%2Fx86-64%2Fstable%2Fbinary+download)
- [Helm](https://helm.sh/docs/intro/install/)

---

## Step-by-Step Deployment

### 1. Start Minikube

```bash
minikube start
``` 

Once minikube is up you can continue to the next step.

---

### 2. Clone the Helm Charts Repository 

Clone the `helm-charts-hardened` repository if you haven't already, then navigate 
into it and create a new branch. 

```bash
git clone https://github.com/spiffe/helm-charts-hardened.git
cd helm-charts-hardened 
git checkout -b your-branch
```

You can name the branch whatever you like.

---

### 3. Create a Custom Values File

In the root of your `helm-charts-hardened` directory, create a YAML file (e.g `your-values.yaml`).
This file will define the Helm configurations Helm uses when deploying SPIRE. 

Here's a template you can start with: 
```yaml
global:
  openshift: false  # Set to true if deploying on OpenShift
  spire:
    recommendations:
      enabled: true
    namespaces:
      create: true
    ingressControllerType: ""  # Use "ingress-nginx" if exposing services outside Minikube
    clusterName: server.example
    trustDomain: server.example
    caSubject:
      country: US
      organization: Server
      commonName: server.example
# Uncomment and set the correct version if you face issues with kubectl/rancher versions:
# tools:
#   kubectl:
#     tag: "v1.23.3"

```

⚠️ Note: If you name your file something other than your-values.yaml, remember to use that 
name in the following commands.

--- 

### 4. Deploy SPIRE

Now we can excute the following to deploy our SPIRE instance: 

```bash
helm upgrade --install -n spire-mgmt spire-crds spire-crds --repo https://spiffe.github.io/helm-charts-hardened/ --create-namespace

helm upgrade --install -n spire-mgmt spire spire --repo https://spiffe.github.io/helm-charts-hardened/ -f your-values.yaml
```

---

### 5. Deploy Tornjak 

Now we can deploy Tornjak with SPIRE. 

First, we need to export the Tornjak backend API URL: 

```bash 
export TORNJAK_API=http://localhost:10000
```

Then, run the following Helm command to deploy Tornjak with the frontend and backend enabled:
```bash
helm upgrade --install -n spire-mgmt spire spire \
--repo https://spiffe.github.io/helm-charts-hardened/ \
--set tornjak-frontend.apiServerURL=$TORNJAK_API \
--values examples/tornjak/values.yaml \
--values your-values.yaml \
--render-subchart-notes
```

---

### 6. Test Deployment 
You can verify the deployment with:  

```bash  
helm test spire -n spire-server
```

--- 

### 7. Access Tornjak UI

To access the Tornjak frontend you'll need to forward the necessary ports. Make sure that you 
run each of the following commands in a **seperate** terminal:

```bash
kubectl -n spire-server port-forward service/spire-tornjak-backend 10000:10000
```
```bash 
kubectl -n spire-server port-forward service/spire-tornjak-frontend 3000:3000
```

Open your browser and enter: 'http://localhost:3000`
You should now see the Tornjak UI! 

--- 