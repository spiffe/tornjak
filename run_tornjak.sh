#!/bin/sh
echo "${@}"

# run frontend in background
npm start &

# run serverinfo to print SPIRE config if given and Tornjak config
/opt/spire/tornjak-backend ${@} serverinfo

# run Tornjak server
/opt/spire/tornjak-backend ${@} http
