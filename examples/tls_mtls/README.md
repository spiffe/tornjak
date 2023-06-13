# TLS and mTLS for Tornjak

This document describes steps required for enabling TLS (Transport Layer Security) and/or mTLS (mutualTLS) communication with Tornjak. We provide sample keys and certificates in this directory for illustrative purpose only. They should not be used in production deployments. **You should always use your own Root SSL certificate issued by your own Certificate Authority**. Once HTTPS access is well-tested, HTTP access should be disabled. 

To enable TLS and mTLS connection for Tornjak, a server must be configured with the proper certificate and key information. This document outlines the following steps to try out the feature:

1. [Deliver relevant certificate/key pair to Tornjak container](#step-1-deliver-relevant-certificatekey-pair-to-tornjak-container)
2. [Configure the Tornjak server](#step-2-configure-the-tornjak-server)
3. [Make calls to the Tornjak Backend](#step-3-make-calls-to-the-tornjak-backend)
4. [Create your own TLS/mTLS files](#step-4-create-your-own-tlsmtls-files)

### Prerequisites

You must have an instance of Tornjak deployed. If this is not done yet, please follow our [quickstart tutorial](../../docs/quickstart) to deploy your instance of Tornjak. We recommend deploying the backend-only version of Tornjak. 

## Step 1: Deliver relevant certificate/key pair to Tornjak container

For this step, we will use the sample keys provided in this directory. To obtain them, we can execute the following commands:

```
git clone https://github.com/spiffe/tornjak.git
cd tornjak/examples/tls_mtls
```

For both TLS and mTLS, we will need to deliver a certificate/key pair to the server. In this directory are the respective files `server.crt` and `server.key`. These files have been signed by the self-signed CA in the `CA-server` directory. They will be delivered to the caller when establishing a connection so that the caller may verify the certificate. 

For mTLS, we additionally need to deliver the CA certificate of the caller to the server so that the server may verify the caller certificate. The relevant file can be found in `CA-caller/rootCA.crt`

### Deliver the certificate/key pair to Tornjak (TLS and mTLS)

We can do this via secret and volume mount. First, to create the secret, we can use the dedicated [TLS secret type](https://kubernetes.io/docs/concepts/configuration/secret/#tls-secrets):

```
kubectl create secret tls -n spire tornjak-server-tls \
  --cert=server.crt \
  --key=server.key 
```

Now we can see the secret has been created here:

```
kubectl describe secret -n spire tornjak-server-tls
```

```
Name:         tornjak-server-tls
Namespace:    default
Labels:       <none>
Annotations:  <none>

Type:  kubernetes.io/tls

Data
====
tls.crt:  1558 bytes
tls.key:  1675 bytes
```

To make the secret accessible to the Tornjak container, we must create a volume for the secret and mount the volume to the container. In the case of the quickstart, for example, we would edit the `server-statefulset.yaml` file to create the secret volume and mount. 

For the secret created above, we can modify the statefulset deployment. One example for modifying the quickstart deployment can be found in the current directory at server-statefulset-tls.yaml. 

```
cat server-statefulset-tls.yaml
```

```
...
volumeMounts:
...
  - name: tls-volume
    mountPath: /opt/spire/server
...
volumes:
...
  - name: tls-volume
    secret:
      secretName: tornjak-server-tls
```

Apply the same changes to your deployment, attaching the secret volumeMount to the Tornjak container. For the quickstart, we can simply apply the file and view the files in the container:

```
kubectl apply -f server-statefulset-tls.yaml
kubectl exec -n spire spire-server-0 -c tornjak-backend -- ls server
```

```
tls.cert
tls.key
```

### Deliver the CA certificate to Tornjak (mTLS only)

For mTLS we will additionally need to deliver a CA certificate to the Tornjak container. The process is the same. First we create the secret:

```
kubectl create secret generic -n spire tornjak-user-certs \
  --from-file=CA-user/rootCA.crt
```

Then we mount the secret to the Tornjak container via volume mount, as in the previous secret volume mount, retaining the previous modifications: 

```
...
volumeMounts:
...
  - name: tls-volume
    mountPath: /opt/spire/server
  - name: user-cas
    mountPath: /opt/spire/users
...
volumes:
...
  - name: tls-volume
    secret:
      secretName: tornjak-server-tls
  - name: user-cas
    secret: 
      secretName: tornjak-user-certs

```

Apply the same changes to your deployment, attaching the secret volumeMount to the Tornjak container. For the quickstart, we can simply apply the file and view the files in the container:

```
kubectl apply -f server-statefulset-mtls.yaml
kubectl exec -n spire spire-server-0 -c tornjak-backend -- ls users
```

```
rootCA.crt
```

----

## Step 2: Configure the Tornjak server

Now that we have mounted the relevant files in step 1, we must configure the Tornjak server to read these files in and create a TLS and/or mTLS connection. First, we will edit the Tornjak configmap to configure these connections, then we can apply the configmap. 

More details on the configmap can be found [in our config documentation](../../docs/config-tornjak-server.md). 

One Tornjak server can open three connections simultaneously: HTTP, TLS, and mTLS, and at least one must be enabled. A configuration that opens all three is provided in [the configmap in this directory](./tornjak-configmap.yaml)

To learn about the configurations each of the TLS and mTLS, expand below sections. 

<details><summary><b> 🔴 [Click] Configuring TLS connection </b></summary>b

The TLS configuration requires the port number on which to open the connection and the paths to the certificate and key pair as delivered in step 1. We can simply add a section under the `server{}` section of the configuration. This is formatted like so:

```
server {
  ...
  tls {
    enabled = true
    port = 20000                 # container port for TLS connection
    cert = "server/tls.crt" # TLS cert <TODO check paths>
    key = "server/tls.key"  # TLS key
  }
  ...
}
```

In the above configuration, we create TLS connection at `localhost:20000` that uses certificate key pair at paths `server/tls.cert` and `server/tls.key` respectively. An example of the TLS configuration is found in the current directory at `tornjak-configmap.yaml`.  

A call to this port will require a CA that can verify the `cert/key` pair given. We can see that making a curl command to this port will create an error. First port-forward this connection to `localhost:20000`

</details>

<details><summary><b> 🔴 [Click] Configuring mTLS connection </b></summary>

The mTLS configuration, much like the TLS configuration, requires the port number on which to open the connection, the paths to the certificate and key pair as delivered in step 1, and a CA for verifying calls to this connection.  We can simply add a section under the `server{}` section of the configuration.  This is formatted like so: 

```
server {
  ...
  mtls {
    enabled = true
    port = 30000                  # container port for mTLS connection
    cert = "server/tls.crt"  # mTLS cert
    key = "server/tls.key"   # mTLS key
    ca = "users/rootCA.crt"  # mTLS CA 
  }
  ...
}
```

The above configuration enables mTLS at `localhost:30000` that uses certificate/key pair at paths `server/tls.crt` and `server/tls.key` respectively.  It verifies caller certificate/key pairs with ca certificate at path `server/CA/rootCA.pem`. An example of the TLS configuration is found in the current directory at `tornjak-configmap.yaml`.  

A call to this port requires a CA that can verify the `cert/key` pair given, as well as a cert/key pair signed by the CA with the `ca` certificate. 

</details>

If your desired configurations are set in the `tornjak-configmap.yaml` file, we can apply the configmap and restart the Tornjak server to make these changes:

```
kubectl apply -f tornjak-configmap.yaml
kubectl delete po -n spire spire-server-0
``` 

Now if we take a look at the logs, you can see the relevant connections have been opened!

```
kubectl logs -n spire spire-server-0 -c tornjak-backend
```

If we try to open the service to `localhost:20000`: 

```
kubectl -n spire port-forward spire-server-0 20000:20000
```

Then attempt curl command:

```
curl https://localhost:20000
```

```
curl: (60) SSL certificate problem: unable to get local issuer certificate
More details here: https://curl.se/docs/sslcerts.html

curl failed to verify the legitimacy of the server and therefore could not
establish a secure connection to it. To learn more about this situation and
how to fix it, please visit the web page mentioned above.
```

We see we rightfully get an error, as the caller has not provided the necessary information to verify the connection. 

We will show how to make a proper curl command in the next section. 

----

## Step 3: Make calls to the Tornjak Backend

Now that we have opened TLS and mTLS connection, we may make calls. You will need the url to access the endpoints.  If you have deployed locally on Minikube, as in the quickstart, you will need to port-forward the container to localhost. 

### Make a TLS call

In order to make a TLS call we need only a CA certificate that can validate the certificate/key pair given to Tornjak in step 1.  In our case, we can use the certificate within `CA-server`:

```
curl --cacert CA-server/rootCA.crt https://<Tornjak_TLS_endpoint>
```

```
"Welcome to the Tornjak Backend!"
```

### Make an mTLS call

In order to make a TLS call we need only a CA certificate that can validate the certificate/key pair given to Tornjak in step 1.  In our case, we can use the certificate within `CA-server`.  

Additionally, we must have a certificate/key pair locally that was signed by the CA certificate given to the Tornjak server when configuring mTLS.  In our case, we can use the certificate/key pair `user.crt` and `user.key`: 

```
curl --cacert CA-server/rootCA.crt --key user.key --cert user.crt https://<Tornjak_mTLS_endpoint> 
```

-----

## Step 4: Create your own TLS/mTLS files

All of the above can be demonstrated with our given sample-keys. However, to create your own sample certificates and keys, we have provided several scripts.  

In general, for any entity that will be verified with a certificate/key pair, you must first create a CA for it, and then create a certificate/key pair signed by that CA.  In the case for both TLS and mTLS, the Tornjak server will need its own certificate/key pair.  In the case of mTLS, the caller will require its own certificate/key pair.  

### Create the CA

You can bring your own CA to use for signing the certificates. Simply place the relevant `rootCA.crt` and `rootCA.key` into a directory and skip to the next step. 

Otherwise, to manually create your own self-signed certificate/key pair for a CA, run the `create-ca.sh` script. This script takes in the argument for the directory name. To create a CA at directory `CA-test`, run the following command:

```
./create-ca.sh CA-test 
```

It will put the necessary cert (`rootCA.crt`) and key (`rootCA.key`) files in the `CA-test/` directory. Be sure to verify these files exist before moving on!

### Signing a cert

Certificates are required for TLS and mTLS connections with the Tornjak server. To create and sign a certificate run `./create-cert.sh <domain name> <name> <ca_dir>`. 

For example, to create a certificate to be run at the `localhost` domain name, we can run:

```
./create-cert.sh localhost client CA-test
```

which will create `client.key` and `client.crt` files that represent the key/cert pair to configure the client, and are signed by the files in `CA-test`

----

To create all relevant files, you will need a certificate-key pair for the Tornjak server, and a certificate-key pair for each caller, with the CA certificate for each. 

Once the above files are created, you may follow through steps 1-3 in the tutorial to ensure the flow works end-to-end!
