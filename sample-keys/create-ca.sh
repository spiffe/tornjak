#!/bin/bash
mkdir -p CA
# creat key if none exists
echo "create key"
[[ -z CA/rootCA.key ]] && openssl genrsa -out CA/rootCA.key 4096

echo "create cert"
openssl req -x509 -subj "/C=US/ST=CA/O=Acme, Inc./CN=example.com" -new -nodes -key CA/rootCA.key -sha256 -days 3650 -out CA/rootCA.crt
