#!/bin/bash
mkdir -p CA
# creat key if none exists
[[ -z CA/rootCA.key ]] && openssl genrsa -out CA/rootCA.key 4096
openssl req -x509 -subj "/C=US/ST=CA/O=Acme, Inc./CN=example.com" -new -nodes -key CA/rootCA.key -sha256 -days 1024 -out CA/rootCA.crt
