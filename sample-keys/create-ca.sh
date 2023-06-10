#!/bin/bash
mkdir -p CA
# create key
openssl genrsa -out CA/rootCA.key 4096

# create certificate based on key
# the CA subject is Acme Inc. Organization
openssl req -x509 -subj "/C=US/ST=CA/O=Acme, Inc./CN=example.com" -new -nodes -key CA/rootCA.key -sha256 -days 3650 -out CA/rootCA.crt
