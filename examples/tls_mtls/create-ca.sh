#!/bin/bash

function usage {
	echo "Takes in CA directory name (1)"
	exit 1
}
[[ -z $1 ]] && usage
export CA_DIR=$1

mkdir -p ${CA_DIR}
nameCA="${CA_DIR}/rootCA"
keyCA="$nameCA.key"
# create key
[[ ! -f "$keyCA" ]] && openssl genrsa -out "$keyCA" 4096

# create certificate based on key
# the CA subject is Acme Inc. Organization
openssl req -x509 -subj "/C=US/ST=CA/O=Acme, Inc./CN=example.com" -new -nodes -key "$keyCA" -sha256 -days 3650 -out "$nameCA.crt"
