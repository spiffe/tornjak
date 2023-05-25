.PHONY: ui vendor build container-manager container-manager-push push container-frontend container-frontend-push container-backend container-backend-push

VERSION=$(shell cat version.txt)
GITHUB_SHA ?= "$(shell git rev-parse HEAD 2>/dev/null)"

## This makefile uses 2 image repositories: 
## - DEV - tsidentity/tornjak-xx - for testing the images by Tornjak Development Team
## - RELEASE - ghcr.io/spiffe/tornjak-xx - public repository for official Tornjak images hosted by SPIFFE organization 

## when containers are built, they are tagged with these container tags
CONTAINER_TORNJAK_DEV_TAG ?= tsidentity/tornjak:$(VERSION)
CONTAINER_BACKEND_DEV_TAG ?= tsidentity/tornjak-backend:$(VERSION)
CONTAINER_FRONTEND_DEV_TAG ?= tsidentity/tornjak-frontend:$(VERSION)
CONTAINER_MANAGER_DEV_TAG ?= tsidentity/tornjak-manager:$(VERSION)

## `make release-*` pushes to DEV tag as well as below corresponding RELEASE tag
## used by Github
CONTAINER_TORNJAK_RELEASE_TAG ?= ghcr.io/spiffe/tornjak
CONTAINER_BACKEND_RELEASE_TAG ?= ghcr.io/spiffe/tornjak-backend
CONTAINER_FRONTEND_RELEASE_TAG ?= ghcr.io/spiffe/tornjak-frontend
CONTAINER_MANAGER_RELEASE_TAG ?= ghcr.io/spiffe/tornjak-manager

GO_FILES := $(shell find . -type f -name '*.go' -not -name '*_test.go' -not -path './vendor/*')

all: bin/tornjak-backend bin/tornjak-manager container-manager container-frontend container-backend container-tornjak

#### BEGIN LOCAL EXECUTABLE BUILDS ####

bin/tornjak-backend: $(GO_FILES) vendor
	# Build hack because of flake of imported go module
	docker run --rm -v "${PWD}":/usr/src/myapp -w /usr/src/myapp -e GOOS=linux -e GOARCH=amd64 golang:1.16 /bin/sh -c "go build --tags 'sqlite_json' tornjak-backend/cmd/agent/agent.go; go build --tags 'sqlite_json' -mod=vendor -ldflags '-s -w -linkmode external -extldflags "-static"' -o bin/tornjak-backend tornjak-backend/cmd/agent/agent.go"


bin/tornjak-manager: $(GO_FILES) vendor
	# Build hack because of flake of imported go module
	docker run --rm -v "${PWD}":/usr/src/myapp -w /usr/src/myapp -e GOOS=linux -e GOARCH=amd64 golang:1.16 /bin/sh -c "go build --tags 'sqlite_json' -o tornjak-manager tornjak-backend/cmd/manager/manager.go; go build --tags 'sqlite_json' -mod=vendor -ldflags '-s -w -linkmode external -extldflags "-static"' -o bin/tornjak-manager tornjak-backend/cmd/manager/manager.go"


frontend-local-build:
	npm install --prefix tornjak-frontend
	rm -rf tornjak-frontend/build
	npm run build --prefix tornjak-frontend
	rm -rf frontend-local-build
	cp -r tornjak-frontend/build frontend-local-build

vendor:
	go mod tidy
	go mod vendor

#### END LOCAL EXECUTABLE BUILDS ####


#### BEGIN LOCAL (DEV) CONTAINER IMAGE BUILD ####
## container-* creates an image for the component
## container-*-push creates an image for the component and pushes to DEV tags

container-backend: bin/tornjak-backend
	docker build --no-cache -f Dockerfile.backend-container --build-arg version=$(VERSION) \
	--build-arg github_sha=$(GITHUB_SHA) -t ${CONTAINER_BACKEND_DEV_TAG} .

container-manager: bin/tornjak-manager
	docker build --no-cache -f Dockerfile.tornjak-manager --build-arg version=$(VERSION) \
	--build-arg github_sha=$(GITHUB_SHA) -t ${CONTAINER_MANAGER_DEV_TAG} .

container-frontend: 
	docker build --no-cache -f Dockerfile.frontend-container --build-arg version=$(VERSION) \
	--build-arg github_sha=$(GITHUB_SHA) -t ${CONTAINER_FRONTEND_DEV_TAG} .

compose-frontend: 
	docker-compose -f docker-compose-frontend.yml up --build --force-recreate -d
	docker tag tornjak-public_tornjak-frontend:latest ${CONTAINER_FRONTEND_DEV_TAG}

container-tornjak: bin/tornjak-backend
	docker build --no-cache -f Dockerfile.tornjak-container --build-arg version=$(VERSION) \
	--build-arg github_sha=$(GITHUB_SHA) -t ${CONTAINER_TORNJAK_DEV_TAG} .

#### END LOCAL CONTAINER IMAGE BUILD ####

#### BEGIN PUSH DEV CONTAINER IMAGE ####

container-backend-dev-push: container-backend
	docker push ${CONTAINER_BACKEND_DEV_TAG}

container-manager-dev-push: container-manager
	 docker push ${CONTAINER_MANAGER_DEV_TAG}

container-frontend-dev-push: container-frontend
	docker push ${CONTAINER_FRONTEND_DEV_TAG}

container-tornjak-dev-push: container-tornjak
	docker push ${CONTAINER_TORNJAK_DEV_TAG}

dev-push:
	docker push ${CONTAINER_MANAGER_DEV_TAG}
	docker push ${CONTAINER_BACKEND_DEV_TAG}
	docker push ${CONTAINER_FRONTEND_DEV_TAG}
	docker push ${CONTAINER_TORNJAK_DEV_TAG}
#### END PUSH DEV CONTAINER IMAGE ####



## BEGIN RELEASES FOR GITHUB CONTAINER REGISTRY ##
# These targets are used by Github to create official pre-built images

release-tornjak-backend: container-backend
	docker tag ${CONTAINER_BACKEND_DEV_TAG} ${CONTAINER_BACKEND_RELEASE_TAG}:$(VERSION)
	docker push ${CONTAINER_BACKEND_DEV_TAG}
	docker push ${CONTAINER_BACKEND_RELEASE_TAG}:${VERSION}

release-tornjak-frontend: container-frontend
	docker tag ${CONTAINER_FRONTEND_DEV_TAG} ${CONTAINER_FRONTEND_RELEASE_TAG}:$(VERSION)
	docker push ${CONTAINER_FRONTEND_DEV_TAG}
	docker push ${CONTAINER_FRONTEND_RELEASE_TAG}:$(VERSION)

release-tornjak: container-tornjak
	docker tag ${CONTAINER_TORNJAK_DEV_TAG} ${CONTAINER_TORNJAK_RELEASE_TAG}:$(VERSION)
	docker push ${CONTAINER_TORNJAK_DEV_TAG}
	docker push ${CONTAINER_TORNJAK_RELEASE_TAG}:$(VERSION)

release-tornjak-manager: container-manager
	docker tag ${CONTAINER_MANAGER_DEV_TAG} ${CONTAINER_MANAGER_RELEASE_TAG}:$(VERSION)
	docker push ${CONTAINER_MANAGER_DEV_TAG}
	docker push ${CONTAINER_MANAGER_RELEASE_TAG}:$(VERSION)

## END RELEASES FOR GITHUB CONTAINER REGISTRY ##

clean:
	rm -rf bin/
	rm -rf tornjak-frontend/build
	rm -rf frontend-local-build/

