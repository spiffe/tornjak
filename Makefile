.PHONY: ui vendor build ui-agent ui-manager container-spire-tornjak-be container-spire-tornjak-be-push container-manager container-manager-push release-container-agent-multiversions push container-frontend-auth container-frontend-auth-push container-frontend-noauth container-frontend-noauth-push

CONTAINER_BACKEND_TAG ?= tsidentity/spire-server-tornjak-be:latest
CONTAINER_TAG_FRONTEND ?= tsidentity/tornjak-fe:latest
CONTAINER_BACKEND_SPIRE_VERSION_IMAGEPATH ?= tsidentity/spire-server-tornjak-be
CONTAINER_BACKEND_SPIRE_VERSION_GHCR_IMAGEPATH ?= ghcr.io/spiffe/spire-server-tornjak-be
CONTAINER_MANAGER_TAG ?= tsidentity/tornjak-manager:latest
GO_FILES := $(shell find . -type f -name '*.go' -not -name '*_test.go' -not -path './vendor/*')
AUTH_SERVER_URI ?= http://localhost:8080
APP_SERVER_URI ?= http://localhost:10000

all: bin/tornjak-backend bin/tornjak-manager ui-agent ui-manager container-spire-tornjak-be container-manager container-frontend-auth container-frontend-noauth

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

container-spire-tornjak-be: bin/tornjak-backend
	docker build --no-cache -f Dockerfile.add-backend -t ${CONTAINER_BACKEND_TAG} .

container-spire-tornjak-be-push: container-spire-tornjak-be
	docker push ${CONTAINER_BACKEND_TAG}

container-manager: bin/tornjak-manager ui-manager
	docker build --no-cache -f Dockerfile.tornjak-manager -t ${CONTAINER_MANAGER_TAG} .

container-manager-push: container-manager
	 docker push ${CONTAINER_MANAGER_TAG}

release-spire-tornjak-be-multiversions: bin/tornjak-backend
	for i in $(shell cat SPIRE_BUILD_VERSIONS); do \
		./build-and-push-versioned-container.sh $$i ${CONTAINER_BACKEND_SPIRE_VERSION_IMAGEPATH}; \
	done

release-spire-tornjak-be-multiversions-ghcr: bin/tornjak-backend
	for i in $(shell cat SPIRE_BUILD_VERSIONS); do \
		./build-and-push-versioned-container.sh $$i ${CONTAINER_BACKEND_SPIRE_VERSION_GHCR_IMAGEPATH}; \
	done

container-frontend-auth: 
	docker build --no-cache -f Dockerfile.add-frontend-auth -t ${CONTAINER_TAG_FRONTEND} --build-arg REACT_APP_API_SERVER_URI=${APP_SERVER_URI} --build-arg REACT_APP_AUTH_SERVER_URI=${AUTH_SERVER_URI} .

container-frontend-auth-push: container-frontend-auth
	docker push ${CONTAINER_TAG_FRONTEND}

container-frontend-noauth: 
	docker build --no-cache -f Dockerfile.add-frontend-auth -t ${CONTAINER_TAG_FRONTEND} --build-arg REACT_APP_API_SERVER_URI=${APP_SERVER_URI} .

container-frontend-noauth-push: container-frontend-noauth
	docker push ${CONTAINER_TAG_FRONTEND}

clean:
	rm -rf bin/
	rm -rf tornjak-frontend/build
	rm -rf ui-agent/
	rm -rf ui-manager/

push:
	docker push ${CONTAINER_BACKEND_TAG}
	docker push ${CONTAINER_MANAGER_TAG}
	docker push ${CONTAINER_TAG_FRONTEND}
