.PHONY: ui vendor build ui-agent ui-manager container-tornjak-be-spire container-tornjak-be-spire-push container-manager container-manager-push release-tornjak-be-spire-multiversions push container-frontend container-frontend-push container-tornjak-be container-tornjak-be-push

CONTAINER_BACKEND_TAG ?= tsidentity/tornjak-be:latest
CONTAINER_BACKEND_WITH_SPIRE_TAG ?= tsidentity/tornjak-be-spire-server:latest
CONTAINER_FRONTEND_TAG ?= tsidentity/tornjak-fe:latest
CONTAINER_BACKEND_SPIRE_VERSION_IMAGEPATH ?= tsidentity/tornjak-be-spire-server

CONTAINER_TORNJAK_GHCR_IMAGEPATH ?= ghcr.io/spiffe/tornjak
CONTAINER_BACKEND_SPIRE_VERSION_GHCR_IMAGEPATH ?= ghcr.io/spiffe/tornjak-be-spire-server
CONTAINER_BACKEND_GHCR_IMAGEPATH ?= ghcr.io/spiffe/tornjak-be
CONTAINER_FRONTEND_GHCR_IMAGEPATH ?= ghcr.io/spiffe/tornjak-fe
CONTAINER_MANAGER_GHCR_IMAGEPATH ?= ghcr.io/spiffe/tornjak-manager

CONTAINER_MANAGER_TAG ?= tsidentity/tornjak-manager:latest
GO_FILES := $(shell find . -type f -name '*.go' -not -name '*_test.go' -not -path './vendor/*')

all: bin/tornjak-backend bin/tornjak-manager ui-manager container-tornjak-be-spire container-manager container-frontend container-tornjak-be

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

container-tornjak-be: bin/tornjak-backend
	docker build --no-cache -f Dockerfile.backend-container -t ${CONTAINER_BACKEND_TAG} .

container-tornjak-be-push: container-tornjak-be
	docker push ${CONTAINER_BACKEND_TAG}

release-tornjak-be-ghcr: container-backend
	docker tag ${CONTAINER_BACKEND_TAG} ${CONTAINER_BACKEND_GHCR_IMAGEPATH}
	docker push ${CONTAINER_BACKEND_GHCR_IMAGEPATH}

container-tornjak-be-spire: bin/tornjak-backend
	docker build --no-cache -f Dockerfile.add-backend -t ${CONTAINER_BACKEND_WITH_SPIRE_TAG} .

container-tornjak-be-spire-push: container-tornjak-be-spire
	docker push ${CONTAINER_BACKEND_WITH_SPIRE_TAG}

container-manager: bin/tornjak-manager ui-manager
	docker build --no-cache -f Dockerfile.tornjak-manager -t ${CONTAINER_MANAGER_TAG} .

container-manager-push: container-manager
	 docker push ${CONTAINER_MANAGER_TAG}

release-tornjak-be-spire-multiversions: bin/tornjak-backend
	for i in $(shell cat SPIRE_BUILD_VERSIONS); do \
		./build-and-push-versioned-container.sh $$i ${CONTAINER_BACKEND_SPIRE_VERSION_IMAGEPATH}; \
	done

release-tornjak-be-spire-multiversions-ghcr: bin/tornjak-backend
	for i in $(shell cat SPIRE_BUILD_VERSIONS); do \
		./build-and-push-versioned-container.sh $$i ${CONTAINER_BACKEND_SPIRE_VERSION_GHCR_IMAGEPATH}; \
	done

container-frontend: 
	docker build --no-cache -f Dockerfile.frontend-container -t ${CONTAINER_FRONTEND_TAG} .

container-frontend-push: container-frontend
	docker push ${CONTAINER_FRONTEND_TAG}

release-tornjak-fe-ghcr: container-frontend
	docker tag ${CONTAINER_FRONTEND_TAG} ${CONTAINER_FRONTEND_GHCR_IMAGEPATH}
	docker push ${CONTAINER_FRONTEND_GHCR_IMAGEPATH}

# PLACEHOLDER FOR TORNJAK IMAGE WITH BE AND FE
release-tornjak-ghcr: container-frontend
	docker tag ${CONTAINER_FRONTEND_TAG} ${CONTAINER_TORNJAK_GHCR_IMAGEPATH}
	docker push ${CONTAINER_TORNJAK_GHCR_IMAGEPATH}

release-tornjak-manager-ghcr: container-manager
	docker tag ${CONTAINER_MANAGER_TAG} ${CONTAINER_MANAGER_GHCR_IMAGEPATH}
	docker push ${CONTAINER_MANAGER_GHCR_IMAGEPATH}

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
