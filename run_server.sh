#!/bin/sh
echo "${@}"
/opt/spire/tornjak $2 http &
# PORT=3000 npm start --prefix ./tornjak-frontend &
/usr/bin/dumb-init /opt/spire/bin/spire-server run "${@}" 
