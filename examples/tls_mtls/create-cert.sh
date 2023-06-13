#!/bin/bash
function usage {
	echo "Takes in domain name (1), cert name (2), CA directory (3) as input and outputs name.key and name.crt as output"
    exit 1
}
[[ -z $3 ]] && usage
export DOMAIN=$1
export CERTNAME=$2
export CA_DIR=$3

openssl genrsa -out ${CERTNAME}.key 2048
openssl req -new -sha256 -key ${CERTNAME}.key -subj "/C=US/ST=CA/O=MyOrg, Inc./CN=mydomain.com" -out ${CERTNAME}.csr
openssl req -new -sha256 -key ${CERTNAME}.key -subj "/C=US/ST=CA/O=MyOrg, Inc./CN=mydomain.com" -out ${CERTNAME}.csr  \
 -reqexts SAN -config <(cat /etc/ssl/openssl.cnf <(printf "[SAN]\nsubjectAltName=DNS:${DOMAIN},DNS:example.com,DNS:www.example.com"))
openssl req -in ${CERTNAME}.csr -noout -text

openssl x509 -req -extensions SAN \
    -extfile <(cat /etc/ssl/openssl.cnf <(printf "[SAN]\nsubjectAltName=DNS:${DOMAIN},DNS:example.com,DNS:www.example.com")) \
    -in ${CERTNAME}.csr -CA ${CA_DIR}/rootCA.crt -CAkey ${CA_DIR}/rootCA.key -CAcreateserial -out ${CERTNAME}.crt -days 500 -sha256
openssl x509 -in ${CERTNAME}.crt -text -noout
