# Tornjak Deployment via SPIFFE Helm Charts Hardened

## Overview

In order to deply Tornjak via Helm Charts is through the [SPIFFE Helm Charts Hardened](https://github.com/spiffe/helm-charts-hardened) repository. Here the repository includes an example for deploying both the frontend and backend for **Tornjak**. 

## Deployment Details

Before we begin make sure you have [minikube](https://minikube.sigs.k8s.io/docs/start/?arch=%2Fmacos%2Fx86-64%2Fstable%2Fbinary+download) and [helm](https://helm.sh/docs/intro/install/) installed on your system. 

To start we want to start our minikube environment using:
```
minikube start
```

After you see the completion message we can now move on to the next to the next step. 

We want for cd into the `helm-charts-hardened` directory that we just cloned and create a new branch. Name this branch whatever you want. 

Next in the root directory we want to create a yaml file called `your-values.yaml` (you can name this something else if you want). This file will contain all the parameters that helm will use to deploy your SPIRE instance. [This is probably wrong]

From where we want to copy these values onto the file:

```yaml
global:
  openshift: false # If running on openshift, set to true
  spire:
    recommendations:
      enabled: true
    namespaces:
      create: true
    ingressControllerType: "" # If not openshift, and want to expose services, set to a supported option [ingress-nginx]
    # Update these
    clusterName: example-cluster
    trustDomain: example.org
    caSubject:
      country: ARPA
      organization: Example
      commonName: example.org
# If rancher/kubectl doesn't have a version that matches your cluster, uncomment and update:
#    tools:
#       kubectl:
#         tag: "v1.23.3"
```

We want to take a look at under the `# Update these` tag and change the values to look like this:

```yaml
# Update these
clusterName: server.example 
trustDomain: server.example 
caSubject:
  country: US 
  organization: Server 
  commonName: server.example 
```

Great now we can excute the following to deploy our SPIRE instance: 

```
helm upgrade --install -n spire-mgmt spire-crds spire-crds --repo https://spiffe.github.io/helm-charts-hardened/ --create-namespace

helm upgrade --install -n spire-mgmt spire spire --repo https://spiffe.github.io/helm-charts-hardened/ -f your-values.yaml
```

Note: Make sure to update `your-values.yaml` if you decided to use a different name. 

Now that we have SPIRE running we can focus on doplying SPIRE with Tornjak enabled. 

First we want to export the Tornjak API like so: 

```console
export TORNJAK_API=http://localhost:10000
```

Next we can execute the following using help to launch Tornjak: 
```console
helm upgrade --install -n spire-mgmt spire spire \
--repo https://spiffe.github.io/helm-charts-hardened/ \
--set tornjak-frontend.apiServerURL=$TORNJAK_API \
--values examples/tornjak/values.yaml \
--values your-values.yaml \
--render-subchart-notes
```

To test the deployment run: 
```console 
helm test spire -n spire-server
```

Now that we have both the frontend and backend services running we want to forward the ports so that we can access them. Make sure that you run each command in a **seperate** terminal:
```console
kubectl -n spire-server port-forward service/spire-tornjak-backend 10000:10000
```
```console
kubectl -n spire-server port-forward service/spire-tornjak-frontend 3000:3000
```

Now if you open your browser and type `http://localhost:3000` you should be able to access the Tornjak frontend. 
