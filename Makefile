.PHONY: ui vendor build container-tornjak-backend-spire container-manager container-manager-push push container-frontend container-frontend-push container-tornjak-backend container-tornjak-backend-push

VERSION=$(shell cat version.txt)

## when containers are built, they are tagged with these
CONTAINER_TAG ?= tsidentity/tornjak:$(VERSION)
CONTAINER_BACKEND_TAG ?= tsidentity/tornjak-backend:$(VERSION)
CONTAINER_FRONTEND_TAG ?= tsidentity/tornjak-frontend:$(VERSION)
CONTAINER_MANAGER_TAG ?= tsidentity/tornjak-manager:$(VERSION)

## `make release-*` pushes to above tag as well as below corresponding tag
CONTAINER_TORNJAK_IMAGEPATH ?= ghcr.io/spiffe/tornjak
CONTAINER_BACKEND_IMAGEPATH ?= ghcr.io/spiffe/tornjak-backend
CONTAINER_FRONTEND_IMAGEPATH ?= ghcr.io/spiffe/tornjak-frontend
CONTAINER_MANAGER_IMAGEPATH ?= ghcr.io/spiffe/tornjak-manager

GO_FILES := $(shell find . -type f -name '*.go' -not -name '*_test.go' -not -path './vendor/*')

all: bin/tornjak-backend bin/tornjak-manager ui-manager container-manager container-frontend container-tornjak-backend

bin/tornjak-backend: $(GO_FILES) vendor
	# Build hack because of flake of imported go module
	docker run --rm -v "${PWD}":/usr/src/myapp -w /usr/src/myapp -e GOOS=linux -e GOARCH=amd64 golang:1.16 /bin/sh -c "go build --tags 'sqlite_json' tornjak-backend/cmd/agent/agent.go; go build --tags 'sqlite_json' -mod=vendor -ldflags '-s -w -linkmode external -extldflags "-static"' -o bin/tornjak-backend tornjak-backend/cmd/agent/agent.go"


bin/tornjak-manager: $(GO_FILES) vendor
	# Build hack because of flake of imported go module
	docker run --rm -v "${PWD}":/usr/src/myapp -w /usr/src/myapp -e GOOS=linux -e GOARCH=amd64 golang:1.16 /bin/sh -c "go build --tags 'sqlite_json' -o tornjak-manager tornjak-backend/cmd/manager/manager.go; go build --tags 'sqlite_json' -mod=vendor -ldflags '-s -w -linkmode external -extldflags "-static"' -o bin/tornjak-manager tornjak-backend/cmd/manager/manager.go"


ui-agent:
	npm install --prefix tornjak-frontend
	rm -rf tornjak-frontend/build
	npm run build --prefix tornjak-frontend
	rm -rf ui-agent
	cp -r tornjak-frontend/build ui-agent


ui-manager:
	npm install --prefix tornjak-frontend
	rm -rf tornjak-frontend/build
	REACT_APP_TORNJAK_MANAGER=true npm run build --prefix tornjak-frontend
	rm -rf ui-manager
	cp -r tornjak-frontend/build ui-manager


vendor:
	go mod tidy
	go mod vendor


# Containerized components
## Build Backend container
container-tornjak-backend: bin/tornjak-backend
	docker build --no-cache -f Dockerfile.backend-container --build-arg version=$(VERSION) -t ${CONTAINER_BACKEND_TAG} .

## Build and push Backend to image repository
container-tornjak-backend-push: container-tornjak-backend
	docker push ${CONTAINER_BACKEND_TAG}

## Manager container
container-manager: bin/tornjak-manager #ui-manager
	docker build --no-cache -f Dockerfile.tornjak-manager --build-arg version=$(VERSION) -t ${CONTAINER_MANAGER_TAG} .

container-manager-push: container-manager
	 docker push ${CONTAINER_MANAGER_TAG}

## Frontend container
container-frontend: #ui-agent 
	docker build --no-cache -f Dockerfile.frontend-container --build-arg version=$(VERSION) -t ${CONTAINER_FRONTEND_TAG} .

compose-frontend: 
	docker-compose -f docker-compose-frontend.yml up --build --force-recreate -d
	docker tag tornjak-public_tornjak-frontend:latest ${CONTAINER_FRONTEND_TAG}

container-frontend-push: container-frontend
	docker push ${CONTAINER_FRONTEND_TAG}

## Backend + Frontend container
container-tornjak: bin/tornjak-backend #ui-agent
	docker build --no-cache -f Dockerfile.tornjak-container --build-arg version=$(VERSION) -t ${CONTAINER_TAG} .

container-tornjak-push: container-tornjak
	docker push ${CONTAINER_TAG}


## BEGIN RELEASES FOR GITHUB CONTAINER REGISTRY ##
# These targets are used by Github to create official pre-built images

## backend image
release-tornjak-backend: container-tornjak-backend
	docker tag ${CONTAINER_BACKEND_TAG} ${CONTAINER_BACKEND_IMAGEPATH}:latest
	docker tag ${CONTAINER_BACKEND_TAG} ${CONTAINER_BACKEND_IMAGEPATH}:$(VERSION)
	docker push ${CONTAINER_BACKEND_TAG}
	docker push ${CONTAINER_BACKEND_IMAGEPATH}:latest
	docker push ${CONTAINER_BACKEND_IMAGEPATH}:${VERSION}

## frontend image
release-tornjak-frontend: container-frontend
	docker tag ${CONTAINER_FRONTEND_TAG} ${CONTAINER_FRONTEND_IMAGEPATH}:latest
	docker tag ${CONTAINER_FRONTEND_TAG} ${CONTAINER_FRONTEND_IMAGEPATH}:$(VERSION)
	docker push ${CONTAINER_FRONTEND_TAG}
	docker push ${CONTAINER_FRONTEND_IMAGEPATH}:latest
	docker push ${CONTAINER_FRONTEND_IMAGEPATH}:$(VERSION)

# backend + frontend image
release-tornjak: container-tornjak
	docker tag ${CONTAINER_TAG} ${CONTAINER_TORNJAK_IMAGEPATH}:latest
	docker tag ${CONTAINER_TAG} ${CONTAINER_TORNJAK_IMAGEPATH}:$(VERSION)
	docker push ${CONTAINER_TAG}
	docker push ${CONTAINER_TORNJAK_IMAGEPATH}:latest
	docker push ${CONTAINER_TORNJAK_IMAGEPATH}:$(VERSION)

# manager backend
release-tornjak-manager: container-manager
	docker tag ${CONTAINER_MANAGER_TAG} ${CONTAINER_MANAGER_IMAGEPATH}:latest
	docker tag ${CONTAINER_MANAGER_TAG} ${CONTAINER_MANAGER_IMAGEPATH}:$(VERSION)
	docker push ${CONTAINER_MANAGER_TAG}
	docker push ${CONTAINER_MANAGER_IMAGEPATH}:latest
	docker push ${CONTAINER_MANAGER_IMAGEPATH}:$(VERSION)

## END RELEASES FOR GITHUB CONTAINER REGISTRY ##

clean:
	rm -rf bin/
	rm -rf tornjak-frontend/build
	rm -rf ui-agent/
	rm -rf ui-manager/

push:
	docker push ${CONTAINER_MANAGER_TAG}
	docker push ${CONTAINER_BACKEND_TAG}
	docker push ${CONTAINER_FRONTEND_TAG}
