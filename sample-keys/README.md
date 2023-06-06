# Configuring TLS and mTLS for Tornjak

In order to enable TLS and mTLS connection for Tornjak, a server must be configured with certificate and key information. This document outlines the following steps to try out the feature:

1. [Create the relevant TLS/mtls files](#create-the-relevant-tls-files)
2. [Configure the Tornjak server](#configure-the-tornjak-server)
3. [Make a TLS or mTLS call](#make-a-tls-or-mtls-call)

## Create the relevant TLS/mTLS files

The relevant certificates and keys first require a CA to sign a certificate. 

Note that sample certificates and keys are included in publicly provided images `ghcr.io/spiffe/tornjak-backend` within the `sample-keys` directory. To try TLS and mTLS, these steps can be skipped. 

### Create a CA

Run `./create-ca.sh` to create a CA. It will put the necessary cert and key files in the `CA/` directory. 

### Signing a cert

Certificates are required for TLS and mTLS connectiosn with the Tornjak server. To create and sign a certificate run `./create-cert.sh <domain name> <name>`. 

For example, to create a certificate to be run at the local host domain name, we can run: 

```
./create-cert.sh localhost client
```

which will create `client.key` and `client.crt` files that represent the key/cert pair to configure the client. 

## Configure the Tornjak server

### TLS configuration

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

If the previous command created `client.key` and `client.crt` and placed them in the `sample-keys` directory, we would use the above configuration to configure TLS. 

### mTLS configuration

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

If the previous command created `client.key` and `client.crt` and placed them in the `sample-keys` directory, we would use the above configuration to configure mTLS. 

## Make a TLS or mTLS call

Once configured with the certificates, we can make curl commands to the Tornjak server. 

### Make a TLS call

In order to make a TLS call, we must have access to the same root CA certificate, and we can execute the following curl command:

```
curl --cacert CA/rootCA.crt https://<Tornjak_TLS_endpoint>
```

### Make a mTLS call

In order to make an mTLS call, we must have access to the same root CA certificate, and we can execute the following curl command:

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
