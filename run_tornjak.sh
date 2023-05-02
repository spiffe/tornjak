#!/bin/sh
echo "${@}"

npm start &

/opt/spire/tornjak-backend ${@} serverinfo
/opt/spire/tornjak-backend ${@} http 
