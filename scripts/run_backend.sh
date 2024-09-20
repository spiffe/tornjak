#!/bin/sh
echo "${@}"

# run serverinfo to print SPIRE config if given and Tornjak config
/opt/tornjak/tornjak-backend ${@} serverinfo

# run Tornjak server
/opt/tornjak/tornjak-backend ${@} http
