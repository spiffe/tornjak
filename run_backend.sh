#!/bin/sh
echo "${@}"

/opt/spire/tornjak-backend ${@} serverinfo &
/opt/spire/tornjak-backend ${@} http --tls --cert sample-keys/tls.pem --key sample-keys/key.pem  --listen-addr :20000 &
/opt/spire/tornjak-backend ${@} http --mtls --cert sample-keys/tls.pem --key sample-keys/key.pem  --mtls-ca sample-keys/rootCA.pem --listen-addr :30000 &
/opt/spire/tornjak-backend ${@} http
