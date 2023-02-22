# Tornjak CSI (Container Storage Interface) Configuration
Currently Tornjak uses hostPath in workload containers to communicate with SPIRE, due to security concerns several SPIRE deployments prevent opening hostPath on the host machine. This document shows how to deploy SPIFFE CSI Driver into kubernetes cluster and how to use the CSI for Tornjak to communicate with SPIRE instead of hostPath. 

Note: HostPath volumes are still required for the CSI driver to interact with the Kubelet

Prerequisites:
- minikube
- The .yaml files in this directory

### 1. Start minikube
    $ minikube start

### 2. Create the spire namespace:
    $ kubectl apply -f spire-namespace.yaml
    $ kubectl get namespaces [to check the spire namespace is successfully created]

### 3. Deploy the SPIFFE CSI Driver (which resides in the same DaemonSet as the SPIRE Agent):
#### 3.1. Applying SPIFFE CSI Driver configuration
    $ kubectl apply -f spiffe-csi-driver.yaml

### 4. Deploy SPIRE:
#### 4.1 Deploying SPIRE server
    $ kubectl apply -f spire-server.yaml
#### 4.2. Waiting for SPIRE Server to deploy...
    $ kubectl rollout status -nspire deployment/spire-server

### 5. Deploy the SPIRE Agent:
#### 5.1. Deploying SPIRE agent …
    $ kubectl apply -f spire-agent.yaml
#### 5.2. Waiting for SPIRE Agent to deploy …
    $ kubectl rollout status -nspire daemonset/spire-agent   


### 6. Register the example workload with SPIRE Server:
  #### 6.1. Register the node
    $ kubectl exec -it \
          -nspire \
          deployment/spire-server -- \
          /opt/spire/bin/spire-server entry create \
              -node \
              -spiffeID spiffe://example.org/node \
              -selector k8s_psat:cluster:example-cluster

  #### 6.2. Register the workload
    $ kubectl exec -it \
          -nspire \
          deployment/spire-server -- \
          /opt/spire/bin/spire-server entry create \
              -parentID spiffe://example.org/node \
              -spiffeID spiffe://example.org/workload \
              -selector k8s:ns:default

### 7. Edit image to connect with Tornjak
    $ Kubectl get deployment -n spire
    $ Kubectl edit deployment spire-server -n spire

And edit the image name [image] to your Tornjak backend image for example "ghcr.io/spiffe/tornjak-be-spire-server:1.1.5"

### 8. Delete pod and expose to port
    $ Kubectl get pods -n spire
#### 8.1. Delete Pod 
    $ kubectl delete pod spire-server-x -n spire [replace with your spire server name]
    $ kubectl -n spire port-forward spire-server-x 10000:10000 [replace with your spire server name]


### Optional: To check the workload logs to see the update received over the Workload API:

### 9. Build the example workload image and load it into MINIKUBE:
You will find example workload deploymnt under the "example-workload directory" 

#### 9.1. BUILDING AND LOADING example workload image into MINIKUBE
    $ eval $(minikube docker-env)
    $ docker build ./example-workload -t spiffe-csi-driver-example-workload:example

#### 9.2. Deploy the workload
    $ kubectl apply -f workload.yaml
    $ kubectl logs pod/example-workload

You should be able to see the workload logs here

Done!
