#!/bin/sh
echo "${@}"

/opt/spire/tornjak-backend ${@} serverinfo
/opt/spire/tornjak-backend ${@} http
