.PHONY: ui vendor build container-tornjak-backend-spire container-tornjak-backend-spire-push container-manager container-manager-push release-tornjak-backend-spire-multiversions push container-frontend container-frontend-push container-tornjak-backend container-tornjak-backend-push

VERSION=$(shell cat version.txt)

CONTAINER_TAG ?= tsidentity/tornjak:$(VERSION)
CONTAINER_BACKEND_TAG ?= tsidentity/tornjak-backend:$(VERSION)
CONTAINER_BACKEND_WITH_SPIRE_TAG ?= tsidentity/tornjak-backend-spire-server:latest
CONTAINER_FRONTEND_TAG ?= tsidentity/tornjak-frontend:$(VERSION)
CONTAINER_BACKEND_SPIRE_VERSION_IMAGEPATH ?= tsidentity/tornjak-backend-spire-server

CONTAINER_TORNJAK_GHCR_IMAGEPATH ?= ghcr.io/spiffe/tornjak
CONTAINER_BACKEND_SPIRE_VERSION_GHCR_IMAGEPATH ?= ghcr.io/spiffe/tornjak-backend-spire-server
CONTAINER_BACKEND_GHCR_IMAGEPATH ?= ghcr.io/spiffe/tornjak-backend
CONTAINER_FRONTEND_GHCR_IMAGEPATH ?= ghcr.io/spiffe/tornjak-frontend
CONTAINER_MANAGER_GHCR_IMAGEPATH ?= ghcr.io/spiffe/tornjak-manager

CONTAINER_MANAGER_TAG ?= tsidentity/tornjak-manager:$(VERSION)
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
container-tornjak-backend: bin/tornjak-backend
	docker build --no-cache -f Dockerfile.backend-container -t ${CONTAINER_BACKEND_TAG} .

container-tornjak-backend-push: container-tornjak-backend
	docker push ${CONTAINER_BACKEND_TAG}

container-tornjak-backend-spire: bin/tornjak-backend
	docker build --no-cache -f Dockerfile.add-backend -t ${CONTAINER_BACKEND_WITH_SPIRE_TAG} .

container-tornjak-backend-spire-push: container-tornjak-backend-spire
	docker push ${CONTAINER_BACKEND_WITH_SPIRE_TAG}

container-manager: bin/tornjak-manager #ui-manager
	docker build --no-cache -f Dockerfile.tornjak-manager -t ${CONTAINER_MANAGER_TAG} .

container-manager-push: container-manager
	 docker push ${CONTAINER_MANAGER_TAG}

container-frontend: #ui-agent 
	docker build --no-cache -f Dockerfile.frontend-container -t ${CONTAINER_FRONTEND_TAG} .

compose-frontend: 
	docker-compose -f docker-compose-frontend.yml up --build --force-recreate -d
	docker tag tornjak-public_tornjak-frontend:latest ${CONTAINER_FRONTEND_TAG}

container-frontend-push: container-frontend
	docker push ${CONTAINER_FRONTEND_TAG}

# WARNING: EXPERIMENTAL feature to merge frontend and backend in one container
container-tornjak: bin/tornjak-backend #ui-agent
	docker build --no-cache -f Dockerfile.tornjak-container -t ${CONTAINER_TAG} .

container-tornjak-push: container-tornjak
	docker push ${CONTAINER_TAG}


# releases for Github Container Registry
release-tornjak-backend-ghcr: container-tornjak-backend
	docker tag ${CONTAINER_BACKEND_TAG} ${CONTAINER_BACKEND_GHCR_IMAGEPATH}:latest
	docker tag ${CONTAINER_BACKEND_TAG} ${CONTAINER_BACKEND_GHCR_IMAGEPATH}:$(VERSION)
	docker push ${CONTAINER_BACKEND_TAG}
	docker push ${CONTAINER_BACKEND_GHCR_IMAGEPATH}:latest
	docker push ${CONTAINER_BACKEND_GHCR_IMAGEPATH}:${VERSION}

release-tornjak-backend-spire-multiversions: bin/tornjak-backend
	for i in $(shell cat SPIRE_BUILD_VERSIONS); do \
		./build-and-push-versioned-container.sh $$i ${CONTAINER_BACKEND_SPIRE_VERSION_IMAGEPATH}; \
	done

release-tornjak-backend-spire-multiversions-ghcr: bin/tornjak-backend
	for i in $(shell cat SPIRE_BUILD_VERSIONS); do \
		./build-and-push-versioned-container.sh $$i ${CONTAINER_BACKEND_SPIRE_VERSION_GHCR_IMAGEPATH}; \
	done

release-tornjak-frontend-ghcr: container-frontend
	docker tag ${CONTAINER_FRONTEND_TAG} ${CONTAINER_FRONTEND_GHCR_IMAGEPATH}:latest
	docker tag ${CONTAINER_FRONTEND_TAG} ${CONTAINER_FRONTEND_GHCR_IMAGEPATH}:$(VERSION)
	docker push ${CONTAINER_FRONTEND_TAG}
	docker push ${CONTAINER_FRONTEND_GHCR_IMAGEPATH}:latest
	docker push ${CONTAINER_FRONTEND_GHCR_IMAGEPATH}:$(VERSION)

# PLACEHOLDER FOR TORNJAK IMAGE WITH BE AND FE
release-tornjak-ghcr: container-tornjak
	docker tag ${CONTAINER_TAG} ${CONTAINER_TORNJAK_GHCR_IMAGEPATH}:latest
	docker tag ${CONTAINER_TAG} ${CONTAINER_TORNJAK_GHCR_IMAGEPATH}:$(VERSION)
	docker push ${CONTAINER_TAG}
	docker push ${CONTAINER_TORNJAK_GHCR_IMAGEPATH}:latest
	docker push ${CONTAINER_TORNJAK_GHCR_IMAGEPATH}:$(VERSION)

release-tornjak-manager-ghcr: container-manager
	docker tag ${CONTAINER_MANAGER_TAG} ${CONTAINER_MANAGER_GHCR_IMAGEPATH}:latest
	docker tag ${CONTAINER_MANAGER_TAG} ${CONTAINER_MANAGER_GHCR_IMAGEPATH}:$(VERSION)
	docker push ${CONTAINER_MANAGER_TAG}
	docker push ${CONTAINER_MANAGER_GHCR_IMAGEPATH}:latest
	docker push ${CONTAINER_MANAGER_GHCR_IMAGEPATH}:$(VERSION)

clean:
	rm -rf bin/
	rm -rf tornjak-frontend/build
	rm -rf ui-agent/
	rm -rf ui-manager/

push:
	docker push ${CONTAINER_BACKEND_WITH_SPIRE_TAG}
	docker push ${CONTAINER_MANAGER_TAG}
	docker push ${CONTAINER_BACKEND_TAG}
	docker push ${CONTAINER_FRONTEND_TAG}
