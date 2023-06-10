# TLS and mTLS for Tornjak

This document describes steps required for enabling TLS (Transport Layer Security) and/or mTLS (mutualTLS) communication with Tornjak. By default, the Tornjak image already contains sample certificates and keys to demonstrate the functionality of the secure connection. These keys are included for illustrative purpose only, and they should not be used in production deployments. **You should always use your own Root SSL certificate issued by your own Certificate Authority**. Once HTTPS access is well-tested, HTTP access should be disabled. 
 
In order to enable TLS and mTLS connection for Tornjak, a server must be configured with certificate and key information. This document outlines the following steps to try out the feature:

1. [Create the relevant TLS/mtls files](#create-the-relevant-tls-files) [NOTE: this step can be skipped if you are testing and do not want to provide your own certificates/keys yet]
2. [Configure the Tornjak server](#configure-the-tornjak-server)
3. [Making calls to Tornjak Backend](#making-calls-to-tornjak-backend)

## Create the relevant TLS/mTLS files

The relevant certificates and keys first require a CA to sign a certificate. 

Note that sample certificates and keys are included in publicly provided image `ghcr.io/spiffe/tornjak-backend` within the `sample-keys` directory. The below steps are available to OPTIONALLY create your own local certificates and keys for testing. 

In a production-level environment, be sure to use your own keys and certificates, as the defaults provided are public. 

<details><summary><b> 🔴 [Click] Create your own CA and certificate/key pair</b></summary>

### Create a CA

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

Then, when you run `./create-ca.sh` script to create a CA. It will put the necessary cert (`rootCA.crt`) and key (`rootCA.key`) files in the `CA/` directory. Be sure to verify these files exist!

### Signing a cert

Certificates are required for TLS and mTLS connections with the Tornjak server. To create and sign a certificate run `./create-cert.sh <domain name> <name>`. 

For example, to create a certificate to be run at the `localhost` domain name, we can run: 

```
./create-cert.sh localhost client
```

which will create `client.key` and `client.crt` files that represent the key/cert pair to configure the client. 

----

</details>

## Configure the Tornjak server

The Tornjak server configuration has separate settings for TLS and mTLS connection. For full Tornjak server configuration, see [the Tornjak server configuration document](../docs/config-tornjak-server.md). 

Please click to expand below sections for configuring each connection type.  These sample paths assume that the relevant certificates and keys are located within `sample-keys/` as is in the default container image. To use custom keys, you will need to add your own certificate and key files to the container and change the paths in this configuration to point to those files. 

<details><summary><b> 🔴 [Click] TLS configuration</b></summary>

The TLS configuration requires a certificate and key pair. This is formatted like so:

```
server {
  ...
  tls {
    enabled = true
    port = 20000                 # container port for TLS connection
    cert = "sample-keys/client.crt" # TLS cert
    key = "sample-keys/client.key"  # TLS key
  }
  ...
}
```

Note that the certificate given will be verified by the client. Therefore, when a client calls to the TLS connection, it must be configured to trust the CA that signed the server certificate. For our example, we will simply use the root CA certificate that signed this client certificate. 

----

</details>

<details><summary><b> 🔴 [Click] mTLS configuration</b></summary>

The mTLS configuration requires a certificate and key pair, along with a CA certificate to verify client requests. The mTLS configuration is formatted like so: 

```
server {
  ...
  mtls {
    enabled = true
    port = 30000                  # container port for mTLS connection
    cert = "sample-keys/client.crt"  # mTLS cert
    key = "sample-keys/client.key"   # mTLS key
    ca = "sample-keys/CA/rootCA.pem" # mTLS CA
  }
  ...
}
```

Note that the certificate given will be verified by the client, so when a client makes a call to the Tornjak server, the client must be configured to trust the CA that signed the given cert and key, as in TLS connections.  

Additionally, the client will call with their own certificate/key pair that must be trusted by the above configured CA. 

----

</details>

## Making calls to Tornjak Backend

Once configured with the certificates, we can make curl commands to the Tornjak server. 

In order to make these calls in our simple usecase, we require the rootCA certificates and some certificate/key pair signed by the rootCA. We can get these in the Tornjak repo:

```
git clone https://github.com/spiffe/tornjak.git
git checkout v1.3
cd tornjak/sample-keys
```

### Make a TLS call

In TLS connection, only the server's certificate is verified by the client caller. In our example, we can make a curl command with the rootCA certificate that signed the Tornjak server certificate so that the client can validate the server's certificate:

```
curl --cacert rootCA.crt https://<Tornjak_TLS_endpoint>
```

### Make a mTLS call

In order to make an mTLS call, we require the rootCA certificate that signs the Tornjak certificate for the client to validate the Tornjak server certificate.  Additionally, we require an additional certificate/key pair for the Tornjak server to validate with its configured rootCA certificate. We can execute the following curl command. 

```
curl --cacert CA/rootCA.crt --key client.key --cert client.crt https://<Tornjak_mTLS_endpoint>
```

Note that we are using the same certificate/key pair as the Tornjak server. However, we could generally use any certificate/key pair that has been signed by this rootCA. 

----

## Additional Notes

Note that to properly use this feature in production-level environment, the keys and certs should not be the given sample keys and certificates published in the `tornjak-backend` image. Instead, one could configure the Tornjak server with a secret. For example:

```
kubectl -n tornjak create secret generic tornjak-certs \
--from-file=key.pem="roks1.key"  \
--from-file=tls.pem="roks1.crt" \
--from-file=rootCA.pem="CA/rootCA.crt"
```

using your own key and certificate. 
