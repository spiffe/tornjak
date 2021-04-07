.PHONY: ui vendor build ui-agent ui-manager

CONTAINER_TAG ?= tsidentity/tornjak-spire-server:latest
CONTAINER_VERSION_IMAGEPATH ?= tsidentity/tornjak-spire-server
CONTAINER_MANAGER_TAG ?= tsidentity/tornjak-manager:latest
GO_FILES := $(shell find . -type f -name '*.go' -not -name '*_test.go' -not -path './vendor/*')

all: bin/tornjak ui container

bin/tornjak-agent: $(GO_FILES)
	# Build hack because of flake of imported go module
	docker run --rm -v "${PWD}":/usr/src/myapp -w /usr/src/myapp -e GOOS=linux -e GOARCH=amd64 golang:1.15 /bin/sh -c "go build agent.go; go build -mod=vendor -ldflags '-s -w -linkmode external -extldflags "-static"' -o bin/tornjak-agent agent.go"


bin/tornjak-manager: $(GO_FILES)
	# Build hack because of flake of imported go module
	docker run --rm -v "${PWD}":/usr/src/myapp -w /usr/src/myapp -e GOOS=linux -e GOARCH=amd64 golang:1.15 /bin/sh -c "go build -o tornjak-manager manager.go; go build -mod=vendor -ldflags '-s -w -linkmode external -extldflags "-static"' -o bin/tornjak-manager manager.go"


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

container-agent: bin/tornjak-agent ui-agent
	docker build --no-cache -f Dockerfile.add-frontend -t ${CONTAINER_TAG} . && docker push ${CONTAINER_TAG}

container-manager: bin/tornjak-manager ui-manager
	docker build --no-cache -f Dockerfile.tornjak-manager -t ${CONTAINER_MANAGER_TAG} . && docker push ${CONTAINER_MANAGER_TAG}

container-agent-multiversions: bin/tornjak-agent ui-agent
	for i in $(shell cat SPIRE_BUILD_VERSIONS); do \
		./build-and-push-versioned-container.sh $$i ${CONTAINER_VERSION_IMAGEPATH}; \
	done

clean:
	rm -rf bin/
	rm -rf tornjak-frontend/build
	rm -rf ui-agent/
	rm -rf ui-manager/
