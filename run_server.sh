#!/bin/sh
echo "${@}"
/opt/spire/tornjak $2 rest &
/usr/bin/dumb-init /opt/spire/bin/spire-server run "${@}" 
