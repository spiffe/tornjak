# TLS and mTLS for Tornjak

This document describes steps required for enabling TLS (Transport Layer Security) and/or mTLS (mutualTLS) communication with Tornjak. We provide sample keys and certificates in this directory for illustrative purpose only. They should not be used in production deployments. **You should always use your own Root SSL certificate issued by your own Certificate Authority**. Once HTTPS access is well-tested, HTTP access should be disabled. 

To enable TLS and mTLS connection for Tornjak, a server must be configured with the proper certificate and key information. This document outlines the following steps to try out the feature:

1. [Deliver relevant certificate/key pair to Tornjak container](#deliver-relevant-certificate-key-pair-to-tornjak-container)
2. [Configure the Tornjak server](#configure-the-tornjak-server)
3. [Make calls to the Tornjak Backend](#making-calls-to-the-tornjak-backend)
4. [Create your own TLS/mTLS files](#create-your-own-tls-mtls-files)

### Prerequesites

You must have an instance of Tornjak deployed. If this is not done yet, please follow our [quickstart tutorial]() to deploy your instance of Tornjak. We recommend deploying the backend-only version of Tornjak. 

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
kubectl create secret tls tornjak-server-tls \
  --cert=server.crt \
  --key=server.key
```

Now we can see the secret has been created here:

```
kubectl get secret
```

To make the secret accessible to the Tornjak container, we must create a volume for the secret and mount the volume to the container. 

< TODO > discuss changes to server statefulset file. 

### Deliver the CA certificate to Tornjak (mTLS only)

For mTLS we will additionally need to deliver a CA certificate to the Tornjak container. The process is the same. First we create the secret:

```
kubectl create secret ...
```

And then we mount the secret to the Tornjak container via volume mount:

< TODO > discuss changes to server statefulset file

----

## Step 2: Configure the Tornjak server

Now that we have mounted the relevant files in step 1, we must configure the Tornjak server to read these files in and create a TLS and/or mTLS connection. First, we will edit the Tornjak configmap to configure these connections, then we can apply the configmap. 

More details on the configmap can be found [in our config documentation](). 

One Tornjak server can open three connections simultaneously: HTTP, TLS, and mTLS, and at least one must be enabled. To configure each of the TLS and mTLS, expand below sections. 

<details><summary><b> 🔴 [Click] Configure TLS connection </b></summary>

The TLS configuration requires the port number on which to open the connection and the paths to the certificate and key pair as delivered in step 1. We can simply add a section under the `server{}` section of the configuration. This is formatted like so:

```
server {
  ...
  tls {
    enabled = true
    port = 20000                 # container port for TLS connection
    cert = "sample-keys/client.crt" # TLS cert <TODO check paths>
    key = "sample-keys/client.key"  # TLS key
  }
  ...
}
```

In the above configuration, we create TLS connection at `localhost:20000` that uses certificate key pair at paths `` and `` respectively. 

A call to this port will require a CA that can verify the `cert/key` pair given. 

</details>

<details><summary><b> 🔴 [Click] Configure mTLS connection </b></summary>

The mTLS configuration, much like the TLS configuration, requires the port number on which to open the connection, the paths to the certificate and key pair as delivered in step 1, and a CA for verifying calls to this connection.  We can simply add a section under the `server{}` section of the configuration.  This is formatted like so: 

```
server {
  ...
  mtls {
    enabled = true
    port = 30000                  # container port for mTLS connection
    cert = "sample-keys/client.crt"  # mTLS cert
    key = "sample-keys/client.key"   # mTLS key
    ca = "sample-keys/CA/rootCA.pem" # mTLS CA <TODO check paths>
  }
  ...
}
```

The above configuration enables mTLS at `localhost:30000` that uses certificate/key pair at paths `TODO` and `TODO` respectively.  It verifies caller certificate/key pairs with ca certificate at path `TODO`. 

A call to this port requires a CA that can verify the `cert/key` pair given, as well as a cert/key pair signed by the CA with the `ca` certificate. 

</details>

Once your desired configurations are set, we can apply the configmap and restart the Tornjak server to make these changes:

```
kubectl apply TODO
kubectl delete po TODO
``` 

Now if we take a look at the logs, you can see the relevant connections have been opened!

```
kubectl logs TODO
```

----

## Making calls to the Tornjak Backend

Now that we have opened TLS and mTLS connection, we may make calls. You will need the url to access the endpoints.  If you have deployed locally on Minikube, as in the quickstart, you will need to port-forward the container to localhost. 

### Make a TLS call

In order to make a TLS call we need only a CA certificate that can validate the certificate/key pair given to Tornjak in step 1.  In our case, we can use the certificate within `CA-server`:

```
curl --cacert CA/rootCA.crt https://<Tornjak_TLS_endpoint> <TODO>
```

### Make an mTLS call

In order to make a TLS call we need only a CA certificate that can validate the certificate/key pair given to Tornjak in step 1.  In our case, we can use the certificate within `CA-server`.  

Additionally, we must have a certificate/key pair locally that was signed by the CA certificate given to the Tornjak server when configuring mTLS.  In our case, we can use the certificate/key pair `user.crt` and `user.key`: 

```
curl --cacert CA/rootCA.crt --key client.key --cert client.crt https://<Tornjak_mTLS_endpoint> <TODO>
```

-----

## Create your own TLS/mTLS files

All of the above can be demonstrated with our given sample-keys. However, to create your own sample certificates and keys, we have provided several scripts.  

In general, for any entity that will be verified with a certificate/key pair, you must first create a CA for it, and then create a certificate/key pair signed by that CA.  In the case for both TLS and mTLS, the Tornjak server will need its own certificate/key pair.  In the case of mTLS, the caller will require its own certificate/key pair.  

### Create the CA

You can bring your own CA to use for signing the certificates. Replace the CA and key in `CA/` directory with yours.

Otherwise, to manually create your own certificate/key pair for a CA, delete the content of current `CA/` directory and see the commands in the `create-ca.sh` script:

```
cat create-ca.sh 
```

```
#!/bin/bash
mkdir -p CA
# create key
openssl genrsa -out CA/rootCA.key 4096

# create certificate based on key
# the CA subject is Acme Inc. Organization
openssl req -x509 -subj "/C=US/ST=CA/O=Acme, Inc./CN=example.com" -new -nodes -key CA/rootCA.key -sha256 -days 3650 -out CA/rootCA.crt
```

The commands here create a key and certificate for Acme Inc. You may customize the `-subj` flag. 

Then, when you run `./create-ca.sh` script to create a CA. It will put the necessary cert (`rootCA.crt`) and key (`rootCA.key`) files in the `CA/` directory. Be sure to verify these files exist before moving on!

### Signing a cert

Certificates are required for TLS and mTLS connections with the Tornjak server. To create and sign a certificate run `./create-cert.sh <domain name> <name>`. 

For example, to create a certificate to be run at the `localhost` domain name, we can run: 

```
./create-cert.sh localhost client
```

which will create `client.key` and `client.crt` files that represent the key/cert pair to configure the client. 

----

Once the above files are created, you may follow through steps 1-3 in the tutorial to ensure the flow works end-to-end!
