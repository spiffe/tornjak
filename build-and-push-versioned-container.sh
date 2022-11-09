#!/bin/bash

VERSION=$1
IMAGE_PATH=$2
# Cleanup old dockerfiles
cleanup() {
    rm -f Dockerfile.add-backend-versions-*
}

helptext() {
    echo "Usage: ${0} <spire image version> <image path>"
    exit 1
}

errExit() {
    cleanup
    exit 2
}

cleanup
[[ -z $VERSION ]] && helptext
[[ -z $IMAGE_PATH ]] && helptext

sed "s/{version}/${VERSION}/g" Dockerfile.add-backend-versions > Dockerfile.add-backend-versions-${VERSION}
docker build -t ${IMAGE_PATH}:${VERSION} -f Dockerfile.add-backend-versions-${VERSION} . || errExit
docker push ${IMAGE_PATH}:${VERSION} || errExit
cleanup
