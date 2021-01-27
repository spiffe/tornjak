# tornjak

This repo container add-ons to a SPIRE server. It is a single binary which runs alongside the spire server. It is configured by pointing to a SPIRE server config file. Right now the features are:

- UI for SPIRE server API

Usage:
```
tornjak <server.conf> [api/rest/]
```


# Building and pushing

The binary and container can be built with the following command, replacing the container tag with the desired container tag of choice.

```
CONTAINER_TAG=lumjjb/tornjak-spire-server:latest make container
```

The container is run with the same arguments as the SPIRE server image, and usage is transparent. It runs a server hosted on port 10000 accessed via http.
