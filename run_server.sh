#!/bin/sh
echo "${@}"
/opt/spire/tornjak-agent -c $2 http &
/opt/spire/tornjak-agent -c /run/spire/config/server.conf http --tls --cert sample-keys/tls.pem --key sample-keys/key.pem  --listen-addr :20000 &
/opt/spire/tornjak-agent -c /run/spire/config/server.conf http --mtls --cert sample-keys/mtls.pem --key sample-keys/key.pem  --listen-addr :30000 &
# PORT=3000 npm start --prefix ./tornjak-frontend &
/usr/bin/dumb-init /opt/spire/bin/spire-server run "${@}" 
