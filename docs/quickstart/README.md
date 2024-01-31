# Tornjak simple deployment with SPIRE k8s quickstart

In this tutorial, we will show how to configure Tornjak with a SPIRE deployment using the SPIRE k8s quickstart tutorial. This is heavily inspired by the [SPIRE quickstart for Kubernetes](https://spiffe.io/docs/latest/try/getting-started-k8s/).

Before we dive into the deployment process, let’s familiarize ourselves with Tornjak and SPIRE.

[SPIRE](https://github.com/spiffe/spire) (the SPIFFE Runtime Environment) is an open-source software tool that provides a way to issue and manage identities in the form of SPIFFE IDs within a distributed system. These identities are used to establish trust between software services and are based on the SPIFFE (Secure Production Identity Framework For Everyone) standards, which define a universal identity control plane for distributed systems. SPIRE provides access to the SPIFFE Workload API, which authenticates active software systems and allocates SPIFFE IDs and corresponding SVIDs to them. This process enables mutual trust establishment between two distinct workloads.

Tornjak is a control plane and GUI for SPIRE, aimed at managing SPIRE deployments across multiple clusters. It provides a management plane that simplifies and centralizes the administration of SPIRE, offering an intuitive interface for defining, distributing, and visualizing SPIFFE identities across a heterogeneous environment. 

This tutorial will get you up and running with a local deployment of SPIRE and Tornjak in three simple steps: 
- Setting up the deployment files
- Deployment
- Connecting to Tornjak. 

Contents
- [Step 0: Prerequisite](#step-0-prerequisite)
- [Step 1: Setup Deployment files](#step-1-setup-deployment-files)
- [Step 2: Deployment of SPIRE and co-located Tornjak](#step-2-deployment-of-spire-and-co-located-tornjak)
- [Step 3: Configuring Access to Tornjak](#step-3-configuring-access-to-tornjak)
- [Cleanup](#cleanup)
- [Troubleshooting Commmon Issues](#Troubleshooting)

## Step 0: Prerequisite 

Before you begin this tutorial, make sure you have the following:
- Minikube: Version 1.12.0 or later. [Download Minikube.](https://docs.docker.com/get-docker/)
- Docker: Version 20.10.23 or later. [Install Docker.](https://docs.docker.com/get-docker/)

Note: While we have tested this tutorial with the versions below, newer versions should also work. Ensure you're using the most recent stable releases to avoid compatibility issues.
 - Minikube Version 1.12.0, Version 1.31.2
 - Docker Version 20.10.23, Version 24.0.6 

## Step 1: Setup deployment files

### Setting up k8s

For this tutorial, we will use minikube. If you have an existing kubernetes cluster, feel free to use that. 

```console
minikube start
```

```
😄  minikube v1.12.0 on Darwin 11.2
🎉  minikube 1.18.1 is available! Download it: https://github.com/kubernetes/minikube/releases/tag/v1.18.1
💡  To disable this notice, run: 'minikube config set WantUpdateNotification false'
✨  Automatically selected the docker driver. Other choices: hyperkit, virtualbox
👍  Starting control plane node minikube in cluster minikube
🔥  Creating docker container (CPUs=2, Memory=1989MB) ...
🐳  Preparing Kubernetes v1.18.3 on Docker 19.03.2 ...
🔎  Verifying Kubernetes components...
🌟  Enabled addons: default-storageclass, storage-provisioner
🏄  Done! kubectl is now configured to use "minikube"
```

```console
kubectl get nodes
```

```
NAME       STATUS   ROLES    AGE   VERSION
minikube   Ready    master   79s   v1.18.3
```

[Troubleshoot 1: Minikube fails to start with a Docker CLI context error](#troubleshooting)
### Obtaining the Deployment Files

To obtain the relevant files, clone our git repository and cd into the correct directory:

```console
git clone https://github.com/spiffe/tornjak.git
cd tornjak
cd docs/quickstart
```

Notice, the files in this directory are largely the same files as provided by the [SPIRE quickstart for Kubernetes](https://spiffe.io/docs/latest/try/getting-started-k8s/). However, there are some minor key differences. Take note of the tornjak-configmap.yaml file, which includes configuration details for the Tornjak backend. 
To view the configuration you can issue the following:

```console
cat tornjak-configmap.yaml 
```

Contents of the configuration for the Tornjak backend should look like:

```
apiVersion: v1
kind: ConfigMap
metadata:
  name: tornjak-agent
  namespace: spire
data:
  server.conf: |

    server {
      # location of SPIRE socket
      # here, set to default SPIRE socket path
      spire_socket_path = "unix:///tmp/spire-server/private/api.sock"

      # configure HTTP connection to Tornjak server
      http {
        enabled = true
        port = 10000 # opens at port 10000
      }
    }

    plugins {
      DataStore "sql" { # local database plugin
        plugin_data {
          drivername = "sqlite3"
          filename = "/run/spire/data/tornjak.sqlite3" # stores locally in this file
        }
      }
    }
```

More information on this config file format can be found in [our config documentation](../config-tornjak-server.md). 

Additionally, we have sample server-statefulset files in the directory `server-statefulset-examples`. We will copy one of them in depending on which deployment scheme you would like. 

### Choosing the Statefulset Deployment


Depending on your use case, you can deploy Tornjak in different configurations. Note we have deprecated support of the use case where parts of Tornjak run on the same container as SPIRE. 

Currently, we support the following deployment scheme: 

1. Only the Tornjak backend (to make Tornjak API calls)  is run as a separate container on the same pod that exposes only one port (to communicate with the Tornjak backend). This deployment type is fully-supported, has a smaller sidecar image without the frontend components, and ensures that the frontend and backend share no memory. 

Using the option below, easily copy in the right server-statefulset file. 

<details><summary><b> 🔴 [Click] For the deployment of only the Tornjak backend (API)</b></summary>

There is an additional requirement to mount the SPIRE server socket and make it accessible to the Tornjak backend container. 

The relevant file is called `backend-sidecar-server-statefulset.yaml` within the examples directory.  Please copy to the relevant file as follows:

```console
cp server-statefulset-examples/backend-sidecar-server-statefulset.yaml server-statefulset.yaml
```

The statefulset will look something like this, where we have commented leading with a 👈 on the changed or new lines: 

```console
cat server-statefulset.yaml 
```

```
apiVersion: apps/v1
kind: StatefulSet
metadata:
  name: spire-server
  namespace: spire
  labels:
    app: spire-server
spec:
  replicas: 1
  selector:
    matchLabels:
      app: spire-server
  serviceName: spire-server
  template:
    metadata:
      namespace: spire
      labels:
        app: spire-server
    spec:
      serviceAccountName: spire-server
      containers:
        - name: spire-server
          image: ghcr.io/spiffe/spire-server:1.4.4
          args:
            - -config
            - /run/spire/config/server.conf
          ports:
            - containerPort: 8081
          volumeMounts:
            - name: spire-config
              mountPath: /run/spire/config
              readOnly: true
            - name: spire-data
              mountPath: /run/spire/data
              readOnly: false
            - name: socket                         # 👈 ADDITIONAL VOLUME
              mountPath: /tmp/spire-server/private # 👈 ADDITIONAL VOLUME
          livenessProbe:
            httpGet:
              path: /live
              port: 8080
            failureThreshold: 2
            initialDelaySeconds: 15
            periodSeconds: 60
            timeoutSeconds: 3
          readinessProbe:
            httpGet:
              path: /ready
              port: 8080
            initialDelaySeconds: 5
            periodSeconds: 5
        ### 👈 BEGIN ADDITIONAL CONTAINER ###
        - name: tornjak-backend
          image: ghcr.io/spiffe/tornjak-backend:latest
          args:
            - --config
            - /run/spire/config/server.conf
            - --tornjak-config
            - /run/spire/tornjak-config/server.conf
          ports:
            - containerPort: 8081
          volumeMounts:
            - name: spire-config
              mountPath: /run/spire/config
              readOnly: true
            - name: tornjak-config
              mountPath: /run/spire/tornjak-config
              readOnly: true
            - name: spire-data
              mountPath: /run/spire/data
              readOnly: false
            - name: socket
              mountPath: /tmp/spire-server/private
        ### 👈 END ADDITIONAL CONTAINER ###
      volumes:
        - name: spire-config
          configMap:
            name: spire-server
        - name: tornjak-config  # 👈 ADDITIONAL VOLUME
          configMap:            # 👈 ADDITIONAL VOLUME
            name: tornjak-agent # 👈 ADDITIONAL VOLUME
        - name: socket          # 👈 ADDITIONAL VOLUME
          emptyDir: {}          # 👈 ADDITIONAL VOLUME
  volumeClaimTemplates:
    - metadata:
        name: spire-data
        namespace: spire
      spec:
        accessModes:
          - ReadWriteOnce
        resources:
          requests:
            storage: 1Gi
```

Note that there are three key differences in this StatefulSet file from that in the SPIRE quickstart:

1. There is a new container in the pod named tornjak-backend. 
3. We create a volume named `tornjak-config` that reads from the ConfigMap `tornjak-agent`.
4. We create a volume named `test-socket` so that the containers may communicate. 

This is all done specifically to pass the Tornjak config file as an argument to the container and to allow communication between Tornjak and SPIRE. 

</details>

## Step 2: Deployment of SPIRE and co-located Tornjak

Now that we have the correct deployment files, please follow the below steps to deploy Tornjak and SPIRE!

NOTE: In a Windows OS environment, you will need to replace the backslashes ( \\ ) below with backticks ( \` ) to copy and paste into a Windows terminal. This doesnt apply for Mac. 
```console
kubectl apply -f spire-namespace.yaml \
    -f server-account.yaml \
    -f spire-bundle-configmap.yaml \
    -f tornjak-configmap.yaml \
    -f server-cluster-role.yaml \
    -f server-configmap.yaml \
    -f server-statefulset.yaml \
    -f server-service.yaml
```
The above command should deploy the SPIRE server with Tornjak:

```
namespace/spire created
serviceaccount/spire-server created
configmap/spire-bundle created
configmap/tornjak-agent created
role.rbac.authorization.k8s.io/spire-server-configmap-role created
rolebinding.rbac.authorization.k8s.io/spire-server-configmap-role-binding created
clusterrole.rbac.authorization.k8s.io/spire-server-trust-role created
clusterrolebinding.rbac.authorization.k8s.io/spire-server-trust-role-binding created
configmap/spire-server created
statefulset.apps/spire-server created
service/spire-server created
service/tornjak-backend-http created
service/tornjak-backend-tls created
service/tornjak-backend-mtls created
service/tornjak-frontend created
```

Before continuing, check that the spire-server is ready: 

```console
kubectl get statefulset --namespace spire
```

```
NAME           READY   AGE
spire-server   1/1     26s
```

NOTE: You may initially see a `0/1` for READY status. Just wait a few minutes and then try again

### Deploying the agent and creating test entries

The following steps will configure and deploy the SPIRE agent. 
NOTE: In a windows environment, you will need to replace the backslashes ( \\ ) below with backticks ( \` ) to copy and paste into a windows terminal
```console
kubectl apply \
    -f agent-account.yaml \
    -f agent-cluster-role.yaml \
    -f agent-configmap.yaml \
    -f agent-daemonset.yaml
```

```
serviceaccount/spire-agent created
clusterrole.rbac.authorization.k8s.io/spire-agent-cluster-role created
clusterrolebinding.rbac.authorization.k8s.io/spire-agent-cluster-role-binding created
configmap/spire-agent created
daemonset.apps/spire-agent created
```

```console
kubectl get daemonset --namespace spire
```

```
NAME          DESIRED   CURRENT   READY   UP-TO-DATE   AVAILABLE   NODE SELECTOR   AGE
spire-agent   1         1         1       1            1           <none>          19s

```

Then, we can create a registration entry for the node. 

NOTE: In a windows environment, you will need to replace the backslashes ( \\ ) below with backticks ( \` ) to copy and paste into a windows terminal
```console
kubectl exec -n spire -c spire-server spire-server-0 -- \
    /opt/spire/bin/spire-server entry create \
    -spiffeID spiffe://example.org/ns/spire/sa/spire-agent \
    -selector k8s_sat:cluster:demo-cluster \
    -selector k8s_sat:agent_ns:spire \
    -selector k8s_sat:agent_sa:spire-agent \
    -node
```

```
Entry ID         : 03d0ec2b-54b7-4340-a0b9-d3b2cf1b041a
SPIFFE ID        : spiffe://example.org/ns/spire/sa/spire-agent
Parent ID        : spiffe://example.org/spire/server
Revision         : 0
TTL              : default
Selector         : k8s_sat:agent_ns:spire
Selector         : k8s_sat:agent_sa:spire-agent
Selector         : k8s_sat:cluster:demo-cluster
```

And we create a registration entry for the workload registrar, specifying the workload registrar's SPIFFE ID:

NOTE: In a windows environment, you will need to replace the backslashes ( \\ ) below with backticks ( \` ) to copy and paste into a windows terminal
```console
kubectl exec -n spire -c spire-server spire-server-0 -- \
    /opt/spire/bin/spire-server entry create \
    -spiffeID spiffe://example.org/ns/default/sa/default \
    -parentID spiffe://example.org/ns/spire/sa/spire-agent \
    -selector k8s:ns:default \
    -selector k8s:sa:default
```

```
Entry ID         : 11a367ab-7095-4390-ab89-34dea5fddd61
SPIFFE ID        : spiffe://example.org/ns/default/sa/default
Parent ID        : spiffe://example.org/ns/spire/sa/spire-agent
Revision         : 0
TTL              : default
Selector         : k8s:ns:default
Selector         : k8s:sa:default
```

Finally, here we deploy a workload container: 

```console
kubectl apply -f client-deployment.yaml
```
```
deployment.apps/client created
```

And also verify that the container can access the workload API UNIX domain socket:

```console
kubectl exec -it $(kubectl get pods -o=jsonpath='{.items[0].metadata.name}' \
   -l app=client)  -- /opt/spire/bin/spire-agent api fetch -socketPath /run/spire/sockets/agent.sock
```

```
Received 1 svid after 8.8537ms

SPIFFE ID:		spiffe://example.org/ns/default/sa/default
SVID Valid After:	2021-04-06 20:13:02 +0000 UTC
SVID Valid Until:	2021-04-06 21:13:12 +0000 UTC
CA #1 Valid After:	2021-04-06 20:12:20 +0000 UTC
CA #1 Valid Until:	2021-04-07 20:12:30 +0000 UTC
```

Let's verify that the `spire-server-0` pod is now started with the new image:

```console
kubectl -n spire describe pod spire-server-0 | grep "Image:"
```

**or**, on Windows:
```console
kubectl -n spire describe pod spire-server-0 | select-string "Image:"
```

Should yield two lines depending on which deployment you used:

```
    Image:         ghcr.io/spiffe/spire-server:1.4.4
    Image:         <TORNJAK-IMAGE>
```

where `<TORNJAK-IMAGE>` is `ghcr.io/spiffe/tornjak:latest` if you deployed the Tornjak with the UI and is `ghcr.io/spiffe/tornjak-backend:latest` if you deployed only the Tornjak backend. 

## Step 3: Configuring Access to Tornjak

### Step 3a: Connecting to the Tornjak backend to make Tornjak API calls

The Tornjak HTTP server is running on port 10000 on the pod. This can easily be accessed by performing a local port forward using `kubectl`. This will cause the local port 10000 to proxy to the Tornjak HTTP server.

```console
kubectl -n spire port-forward spire-server-0 10000:10000
```

You'll see something like this:

```
Forwarding from 127.0.0.1:10000 -> 10000
Forwarding from [::1]:10000 -> 10000
```

While this runs, open a browser to 

```
http://localhost:10000/api/tornjak/serverinfo
```

This output represents the backend response. Now you should be able to make Tornjak API calls!

![tornjak-agent-browser](../rsrc/tornjak-agent-browser.png)

### Step 3b: Connecting to the Tornjak frontend to access the Tornjak UI

Make sure that the backend is accessible from your browser at `http://localhost:10000`, as above, or the frontend will not work. 

If you chose to deploy Tornjak with the UI, connecting to the UI is very simple. Otherwise, you can always run the UI locally and connect. See the two choices below:

<details><summary><b> 🔴 [Click] Run the Tornjak frontend locally</b></summary>

You will need to deploy the separate frontend separately to access the exposed Tornjak backend. We have prebuilt the frontend in a container, so we can simply run it via a single docker command in a separate terminal, which will take a couple minutes to run: 

```console
docker run -p 3000:3000 -e REACT_APP_API_SERVER_URI='http://localhost:10000' ghcr.io/spiffe/tornjak-frontend:latest 
```

After the image is downloaded, you will eventually see the following output:

```
> tornjak-frontend@0.1.0 start
> react-scripts --openssl-legacy-provider start

ℹ ｢wds｣: Project is running at http://172.17.0.3/
ℹ ｢wds｣: webpack output is served from 
ℹ ｢wds｣: Content not from webpack is served from /usr/src/app/public
ℹ ｢wds｣: 404s will fallback to /
Starting the development server...

Compiled successfully!

You can now view tornjak-frontend in the browser.

  Local:            http://localhost:3000
  On Your Network:  http://172.17.0.3:3000

Note that the development build is not optimized.
To create a production build, use npm run build.
```

Note, it will likely take a few minutes for the applicaiton to compile successfully. 

</details>

Either of the above steps exposes the frontend at http://localhost:3000.  If you visit in your browser, you should see this page:

![tornjak-ui](../rsrc/tornjak-ui.png)

## Cleanup

Here are the steps to clean the deployed entities. First, we delete the workload container:

```terminal
kubectl delete deployment client
```

Then, delete the spire agent and server, along with the namespace we created:

```terminal
kubectl delete namespace spire
```

NOTE: You may need to wait a few minutes for the action to complete and the prompt to return

Finally, we can delete the ClusterRole and ClusterRoleBinding:

```terminal
kubectl delete clusterrole spire-server-trust-role spire-agent-cluster-role
kubectl delete clusterrolebinding spire-server-trust-role-binding spire-agent-cluster-role-binding
```

## Troubleshooting 
<details><summary><b>Troubleshoot 1: Minikube fails to start with a Docker CLI context error</b></summary>

When running the `minikube start` command, you might encounter an error like the one below:


```console
minikube start
```
```
W1105 15:48:51.730095   42754 main.go:291] Unable to resolve the current Docker CLI context "default": context "default": context not found: open /Users/kidus/.docker/contexts/meta/37a8eec1ce19687d132fe29051dca629d164e2c4958ba141d5f4133a33f0688f/meta.json: no such file or directory
😄  minikube v1.31.2 on Darwin 14.0 (arm64)
✨  Using the docker driver based on existing profile

💣  Exiting due to PROVIDER_DOCKER_NOT_RUNNING: "docker version --format <no value>-<no value>:<no value>" exit status 1: Cannot connect to the Docker daemon at unix:///var/run/docker.sock. Is the docker daemon running?
💡  Suggestion: Start the Docker service
📘  Documentation: https://minikube.sigs.k8s.io/docs/drivers/docker/
```
This typically means that Docker is not running on your machine, and since Minikube is attempting to use Docker as a driver, it's required to have Docker active.
Solution:

1. Check Docker Installation:
-  Make sure Docker is installed on your system. If it's not installed, you can install Docker by following the instructions on the official Docker [installation guide.](https://docs.docker.com/get-docker/)

2. Start Docker:
- On macOS and Windows: Docker Desktop has a graphical interface to manage the Docker service. Open Docker Desktop to start Docker. Alternativly, run the command '''open -a Docker''''  
3. Retry Starting Minikube:
- After ensuring that Docker is running, you can start Minikube again using:  
```console
minikube start
```
4. Reset Configurations if Needed:
- For Docker context issues:
```console
docker context ls
docker context use default
```
- To reset Minikube:
```console
minikube delete
```
- followed by:
```console
minikube start
```
</details>
