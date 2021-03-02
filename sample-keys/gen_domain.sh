#!/bin/bash

function usage {
    echo "Takes in domain name as input"
    exit 1
}
[[ -z $1 ]] && usage
export DOMAIN=$1

echo "Generating certs..."
openssl req -new -x509 -sha256 -key key.pem -subj "/C=US/ST=CA/O=Acme, Inc./CN=example.com" -extensions SAN -config <(cat /etc/ssl/openssl.cnf <(printf "[SAN]\nsubjectAltName=DNS:${DOMAIN},DNS:example.com,DNS:www.example.com")) -out $DOMAIN.pem

#echo "Creating k8s secrets in tornjak namesapce..."
#kubectl -n tornjak create secret generic tornjak-certs --from-file=key.pem --from-file=cert.pem=$DOMAIN.pem

# Modify tornjak server k8s manifest to add Volume from secret "tornjak-certs" to mount point "/opt/spire/sample-keys"
