.PHONY: ui vendor build container-manager container-manager-push push container-frontend container-frontend-push container-backend container-backend-push

VERSION=$(shell cat version.txt)
GITHUB_SHA ?= "$(shell git rev-parse HEAD 2>/dev/null)"

## REPO defines where to push images
REPO ?= tsidentity

## when containers are built, they are tagged to these container repos
CONTAINER_TORNJAK_TAG ?= $(REPO)/tornjak
CONTAINER_BACKEND_TAG ?= $(REPO)/tornjak-backend
CONTAINER_FRONTEND_TAG ?= $(REPO)/tornjak-frontend
CONTAINER_MANAGER_TAG ?= $(REPO)/tornjak-manager

## `make release-*` pushes to DEV tag as well as below corresponding RELEASE tag
## used by Github

GO_FILES := $(shell find . -type f -name '*.go' -not -name '*_test.go' -not -path './vendor/*')

all: bin/tornjak-backend bin/tornjak-manager container-manager container-frontend container-backend container-tornjak

#### BEGIN LOCAL EXECUTABLE BUILDS ####

# build binaries for Tornjak backend (bin/tornjak-backend)
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


#### BEGIN LOCAL CONTAINER IMAGE BUILD ####
## container-* creates an image for the component

container-backend: bin/tornjak-backend
	docker build --no-cache -f Dockerfile.backend-container --build-arg version=$(VERSION) \
		--build-arg github_sha=$(GITHUB_SHA) -t ${CONTAINER_BACKEND_TAG}:$(VERSION) .

container-manager: bin/tornjak-manager
	docker build --no-cache -f Dockerfile.tornjak-manager --build-arg version=$(VERSION) \
		--build-arg github_sha=$(GITHUB_SHA) -t ${CONTAINER_MANAGER_TAG}:$(VERSION) .

container-frontend: 
	docker build --no-cache -f Dockerfile.frontend-container --build-arg version=$(VERSION) \
		--build-arg github_sha=$(GITHUB_SHA) -t ${CONTAINER_FRONTEND_TAG}:$(VERSION) .

compose-frontend: 
	docker-compose -f docker-compose-frontend.yml up --build --force-recreate -d
	docker tag tornjak-public_tornjak-frontend:latest ${CONTAINER_FRONTEND_TAG}:$(VERSION)

container-tornjak: bin/tornjak-backend
	docker build --no-cache -f Dockerfile.tornjak-container --build-arg version=$(VERSION) \
		--build-arg github_sha=$(GITHUB_SHA) -t ${CONTAINER_TORNJAK_TAG}:$(VERSION) .

#### END LOCAL CONTAINER IMAGE BUILD ####

#### BEGIN PUSH ONTAINER IMAGE ####
## container-*-push creates an image for the component and pushes to repo

container-backend-push: container-backend
	docker push ${CONTAINER_BACKEND_TAG}:$(VERSION)
	docker tag ${CONTAINER_BACKEND_TAG}:$(VERSION) ${CONTAINER_BACKEND_TAG}:$(GITHUB_SHA)
	docker push ${CONTAINER_BACKEND_TAG}:$(GITHUB_SHA)

container-manager-push: container-manager
	docker push ${CONTAINER_MANAGER_TAG}:$(VERSION)
	docker tag ${CONTAINER_MANAGER_TAG}:$(VERSION) ${CONTAINER_MANAGER_TAG}:$(GITHUB_SHA)
	docker push ${CONTAINER_MANAGER_TAG}:$(GITHUB_SHA)

container-frontend-push: container-frontend
	docker push ${CONTAINER_FRONTEND_TAG}:$(VERSION)
	docker tag ${CONTAINER_FRONTEND_TAG}:$(VERSION) ${CONTAINER_FRONTEND_TAG}:$(GITHUB_SHA)
	docker push ${CONTAINER_FRONTEND_TAG}:$(GITHUB_SHA)

container-tornjak-push: container-tornjak
	docker push ${CONTAINER_TORNJAK_TAG}:$(VERSION)
	docker tag ${CONTAINER_TORNJAK_TAG}:$(VERSION) ${CONTAINER_TORNJAK_TAG}:$(GITHUB_SHA)
	docker push ${CONTAINER_TORNJAK_TAG}:$(GITHUB_SHA)

dev-push: container-backend-push container-manager-push container-frontend-push container-tornjak-push
#### END PUSH CONTAINER IMAGE ####

clean:
	rm -rf bin/
	rm -rf tornjak-frontend/build
	rm -rf frontend-local-build/

