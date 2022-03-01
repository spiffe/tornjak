# Managing Certificate Authority (CA) for Tornjak

## Create a CA
Run `./create-ca.sh` to create a CA. It will put the necessary cert and key files in the `CA/` directory.

## Signing a cert
Certificates are required for TLS and mTLS connections with Tornjak server.

To create and sign a certificate run `./create-cert.sh <domain name> <name>`

Tornjak server example:

```console
./create-cert.sh *.mydomain.com roks1
```

This script creates `roks1.key` and `roks1.crt` files that represent
the key/cert pair to configure the server.

Client example:

```console
./create-cert.sh localhost client
```

This script creates `client.key` and `client.crt` files that represent
the key/cert pair to configure the client.

## Tornjak Server and Client configuration
* SPIRE with Tornjak represent Server.
* Browser, `curl`, or Tornjak Manager represent clients.

### For TLS

```
Client:
TLS: CA/rootCA.crt

Server:
TLS: roks1.key, roks1.crt
```

### For mTLS
```
Client:
TLS: CA/rootCA.crt
mTLS: client.key, client.crt

Server:
TLS: roks1.key, roks1.crt
mTLS: CA/rootCA.crt
```

# Examples
Secret to configure the Tornjak Server:
```console
kubectl -n tornjak create secret generic tornjak-certs \
--from-file=key.pem="roks1.key"  \
--from-file=tls.pem="roks1.crt" \
--from-file=rootCA.pem="CA/rootCA.crt"
```

TLS client request:
```console
curl --cacert CA/rootCA.crt https://<Tornjak_TLS_endpoint>
```

mTLS client request:
```console
curl --cacert CA/rootCA.crt --key client.key --cert client.crt https://<Tornjak_TLS_endpoint>
```
