#!/bin/sh
echo "${@}"
echo $1
echo $2
/opt/spire/tornjak-agent "${@}" http &
/opt/spire/tornjak-agent "${@}" http --tls --cert sample-keys/tls.pem --key sample-keys/key.pem  --listen-addr :20000 &
/opt/spire/tornjak-agent "${@}" http --mtls --cert sample-keys/tls.pem --key sample-keys/key.pem  --mtls-ca sample-keys/rootCA.pem --listen-addr :30000 &
# PORT=3000 npm start --prefix ./tornjak-frontend &
/usr/bin/dumb-init /opt/spire/bin/spire-server run $1 $2 # TODO need better arg parsing
