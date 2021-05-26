#!/bin/bash

VERSION=$1
IMAGE_PATH=$2
# Cleanup old dockerfiles
cleanup() {
    rm -f Dockerfile.add-frontend-versions-*
}

helptext() {
    echo "Usage: ${0} <spire image version> <image path>"
    exit 1
}

cleanup
[[ -z $VERSION ]] && helptext
[[ -z $IMAGE_PATH ]] && helptext


sed "s/{version}/${VERSION}/g" Dockerfile.add-frontend-versions > Dockerfile.add-frontend-versions-${VERSION}
docker build -t ${IMAGE_PATH}:${VERSION} -f Dockerfile.add-frontend-versions-${VERSION} .
docker push ${IMAGE_PATH}:${VERSION}
cleanup
