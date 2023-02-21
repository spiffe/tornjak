#!/bin/sh
echo "${@}"

usage() {
	cat << EOF >&2
Usage: run_server [-c <file>] [-t <file>]

-config,-c <file>: SPIRE Config File
-tornjak-config,-t <file>: Tornjak Config File
EOF
	exit 1
}

# argument parse
while [[ $# -gt 0 ]]
do
key="$1"


case $key in
	-c|-config)
	SPIRE_CONFIG="$2"
	shift
	shift
	;;
	-t|-tornjak-config)
	TORNJAK_CONFIG="$2"
	shift
	shift
	;;
	*)
	echo "$key"
	echo "$2"
	usage
	;;
esac
done

echo $SPIRE_CONFIG
echo $TORNJAK_CONFIG

if [[ "$SPIRE_CONFIG" == "" ]] ; then
	echo "-c SPIRE_CONFIG must be provided"
	exit 1
elif [[ "$TORNJAK_CONFIG" == "" ]] ; then
	#echo "-t TORNJAK_CONFIG must be provided"
	#exit 1
	/opt/spire/tornjak-backend -c $SPIRE_CONFIG serverinfo &
	/opt/spire/tornjak-backend -c $SPIRE_CONFIG http --tls --cert sample-keys/tls.pem --key sample-keys/key.pem  --listen-addr :20000 &
	/opt/spire/tornjak-backend -c $SPIRE_CONFIG http --mtls --cert sample-keys/tls.pem --key sample-keys/key.pem  --mtls-ca sample-keys/rootCA.pem --listen-addr :30000 &
	/opt/spire/tornjak-backend -c $SPIRE_CONFIG http &
else 
	/opt/spire/tornjak-backend -c $SPIRE_CONFIG -t $TORNJAK_CONFIG serverinfo &
	/opt/spire/tornjak-backend -c $SPIRE_CONFIG -t $TORNJAK_CONFIG http --tls --cert sample-keys/tls.pem --key sample-keys/key.pem  --listen-addr :20000 &
	/opt/spire/tornjak-backend -c $SPIRE_CONFIG -t $TORNJAK_CONFIG http --mtls --cert sample-keys/tls.pem --key sample-keys/key.pem  --mtls-ca sample-keys/rootCA.pem --listen-addr :30000 &
	/opt/spire/tornjak-backend -c $SPIRE_CONFIG -t $TORNJAK_CONFIG http &
fi

# run SPIRE
/usr/bin/dumb-init /opt/spire/bin/spire-server run -config $SPIRE_CONFIG
