# TLS and mTLS for Tornjak

This document describes steps required for enabling TLS (Transport Layer Security) and/or mTLS (mutualTLS) communication with Tornjak. By default, the Tornjak image already contains sample certificates and keys to demonstrate the functionality of the secure connection. These keys are included for illustrative purpose only, and they should not be used in production deployments. 
In order to enable TLS and mTLS connection for Tornjak, a server must be configured with certificate and key information. This document outlines the following steps to try out the feature:

1. [Create the relevant TLS/mtls files](#create-the-relevant-tls-files)
2. [Configure the Tornjak server](#configure-the-tornjak-server)
3. [Making calls to Tornjak Backend](#making-calls-to-tornjak-backend)

## Create the relevant TLS/mTLS files

The relevant certificates and keys first require a CA to sign a certificate. 

Note that sample certificates and keys are included in publicly provided image `ghcr.io/spiffe/tornjak-backend` within the `sample-keys` directory. The below steps are available to OPTIONALLY create your own local certificates and keys. 

<details><summary><b> 🔴 [Click] Create your own CA and certificate/key pair</b></summary>

### Create a CA

You can bring your own CA to use for signing the certificates. Replace the CA and key in `CA/` directory with yours.
Otherwise, delete the content of current `CA/` directory and run `./create-ca.sh` script to create a CA. It will put the necessary cert and key files in the `CA/` directory. 

### Signing a cert

Certificates are required for TLS and mTLS connections with the Tornjak server. To create and sign a certificate run `./create-cert.sh <domain name> <name>`. 

For example, to create a certificate to be run at the local host domain name, we can run: 

```
./create-cert.sh localhost client
```

which will create `client.key` and `client.crt` files that represent the key/cert pair to configure the client. 

----

</details>

## Configure the Tornjak server

The Tornjak server configuration has separate settings for TLS and mTLS connection. For full Tornjak server configuration, see [the Tornjak server configuration document](../docs/config-tornjak-server.md). 

Please click to expand below sections for configuring each connection type.  These sample paths assume that the relevant certificates and keys are located within `sample-keys/` as is in the default container image. To use custom keys, you will need to edit the paths. 

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

----

</details>

## Making calls to Tornjak Backend

Once configured with the certificates, we can make curl commands to the Tornjak server. 

In order to make these calls, we require the rootCA certificates and some certificate/key pair signed by the rootCA. We can get these in the Tornjak repo:

```
git clone https://github.com/spiffe/tornjak.git
git checkout v1.3
cd tornjak/sample-keys
```

### Make a TLS call

In order to make a TLS call, we require the rootCA certificate so that the client can validate the Tornjak certificate. We can execute the following curl command to the Tornjak server with it:

```
curl --cacert rootCA.crt https://<Tornjak_TLS_endpoint>
```

### Make a mTLS call

In order to make an mTLS call, we require the rootCA certificate that signs the Tornjak certificate, as well as an additional certificate/key pair for the Tornjak server to validate. Then, we can execute the following curl command:

```
curl --cacert CA/rootCA.crt --key client.key --cert client.crt https://<Tornjak_mTLS_endpoint>
```

----

## Additional Notes

Note that to properly use this feature, the keys and certs should not be the given sample keys and certificates published in the `tornjak-backend` image. Instead, one could configure the Tornjak server with a secret. For example:

```
kubectl -n tornjak create secret generic tornjak-certs \
--from-file=key.pem="roks1.key"  \
--from-file=tls.pem="roks1.crt" \
--from-file=rootCA.pem="CA/rootCA.crt"
```

using your own key and certificate. 
