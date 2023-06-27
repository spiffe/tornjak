VERSION=$(shell cat version.txt)
GITHUB_SHA ?= "$(shell git rev-parse HEAD 2>/dev/null)"

## REPO defines where to push images
REPO ?= tsidentity

## when containers are built, they are tagged to these container repos
CONTAINER_TORNJAK_TAG ?= $(REPO)/tornjak
CONTAINER_BACKEND_TAG ?= $(REPO)/tornjak-backend
CONTAINER_FRONTEND_TAG ?= $(REPO)/tornjak-frontend
CONTAINER_MANAGER_TAG ?= $(REPO)/tornjak-manager

BINARIES=tornjak-backend tornjak-manager
IMAGES=$(BINARIES) tornjak-frontend tornjak

GO_VERSION ?= 1.20

all: build-binaries images ## Builds both binaries and images (default task)

.PHONY: help
help: ## Display this help.
	@awk 'BEGIN {FS = ":.*##"; printf "\nUsage:\n  make \033[36m<target>\033[0m\n"} /^[a-zA-Z_0-9-]+:.*?##/ { printf "  \033[36m%-25s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST)

PHONY: clean
clean: ## Cleanup local build outputs
	rm -rf bin/
	rm -rf tornjak-frontend/build
	rm -rf frontend-local-build/

##@ Dependencies:

PHONY: download
download: ## Download go modules
	@echo Downloading go modules…
	@go mod download

PHONY: tidy
tidy: download ## Tidy go modules
	@echo Tidying go modules…
	@go mod tidy

PHONY: vendor
vendor: tidy ## Vendor go modules
	@echo Vendoring go modules…
	@go mod vendor

##@ Build:

PHONY: build-binaries
build-binaries: $(addprefix bin/,$(BINARIES)) ## Build bin/tornjak-backend and bin/tornjak-manager binaries

bin/tornjak-backend: tornjak-backend/cmd/agent vendor ## Build tornjak-backend binary
	# Build hack because of flake of imported go module
	docker run --rm -v "${PWD}":/app -w /app -e GOOS=linux -e GOARCH=amd64 golang:$(GO_VERSION) \
		/bin/sh -c "go build --tags 'sqlite_json' ./$<; go build --tags 'sqlite_json' -mod=vendor -ldflags '-s -w -linkmode external -extldflags "-static"' -o $@ ./$<"

bin/tornjak-manager: tornjak-backend/cmd/manager vendor ## Build bin/tornjak-manager binary
	# Build hack because of flake of imported go module
	docker run --rm -v "${PWD}":/app -w /app -e GOOS=linux -e GOARCH=amd64 golang:$(GO_VERSION) \
		/bin/sh -c "go build --tags 'sqlite_json' -o tornjak-manager ./$<; go build --tags 'sqlite_json' -mod=vendor -ldflags '-s -w -linkmode external -extldflags "-static"' -o $@ ./$<"

frontend-local-build: ## Build tornjak-frontend
	npm install --prefix tornjak-frontend
	rm -rf tornjak-frontend/build
	npm run build --prefix tornjak-frontend
	rm -rf frontend-local-build
	cp -r tornjak-frontend/build frontend-local-build

##@ Containter images:

.PHONY: images
images: $(addprefix image-,$(IMAGES)) ## Build all images

.PHONY: image-tornjak-backend
image-tornjak-backend: bin/tornjak-backend ## Build image for bin/tornjak-backend 
	docker build --no-cache -f Dockerfile.backend-container --build-arg version=$(VERSION) \
		--build-arg github_sha=$(GITHUB_SHA) -t $(CONTAINER_BACKEND_TAG):$(VERSION) .

.PHONY: image-tornjak-manager
image-tornjak-manager: bin/tornjak-manager ## Build image for bin/tornjak-manager 
	docker build --no-cache -f Dockerfile.tornjak-manager --build-arg version=$(VERSION) \
		--build-arg github_sha=$(GITHUB_SHA) -t $(CONTAINER_MANAGER_TAG):$(VERSION) .

.PHONY: image-tornjak-frontend
image-tornjak-frontend: ## Build image for tornjak-frontend 
	docker build --no-cache -f Dockerfile.frontend-container --build-arg version=$(VERSION) \
		--build-arg github_sha=$(GITHUB_SHA) -t $(CONTAINER_FRONTEND_TAG):$(VERSION) .

.PHONY: image-tornjak
image-tornjak: bin/tornjak-backend ## Build image for bin/tornjak-backend and tornjak-frontend bundled in single image
	docker build --no-cache -f Dockerfile.tornjak-container --build-arg version=$(VERSION) \
		--build-arg github_sha=$(GITHUB_SHA) -t $(CONTAINER_TORNJAK_TAG):$(VERSION) .

##@ Run:

.PHONY: compose-frontend
compose-frontend: ## Run frontend using docker-compose
	docker-compose -f docker-compose-frontend.yml up --build --force-recreate -d
	docker tag tornjak-public_tornjak-frontend:latest $(CONTAINER_FRONTEND_TAG):$(VERSION)

##@ Release:

.PHONY: release-images
release-images: $(addprefix release-,$(IMAGES)) ## Release all images

.PHONY: release-tornjak-backend
release-tornjak-backend: image-tornjak-backend ## Release tornjak-backend image
	docker push $(CONTAINER_BACKEND_TAG):$(VERSION)
	docker tag $(CONTAINER_BACKEND_TAG):$(VERSION) $(CONTAINER_BACKEND_TAG):$(GITHUB_SHA)
	docker push $(CONTAINER_BACKEND_TAG):$(GITHUB_SHA)

.PHONY: release-tornjak-manager
release-tornjak-manager: image-tornjak-manager ## Release tornjak-manager image
	docker push $(CONTAINER_MANAGER_TAG):$(VERSION)
	docker tag $(CONTAINER_MANAGER_TAG):$(VERSION) $(CONTAINER_MANAGER_TAG):$(GITHUB_SHA)
	docker push $(CONTAINER_MANAGER_TAG):$(GITHUB_SHA)

.PHONY: release-tornjak-frontend
release-tornjak-frontend: image-tornjak-frontend ## Release tornjak-frontend image
	docker push $(CONTAINER_FRONTEND_TAG):$(VERSION)
	docker tag $(CONTAINER_FRONTEND_TAG):$(VERSION) $(CONTAINER_FRONTEND_TAG):$(GITHUB_SHA)
	docker push $(CONTAINER_FRONTEND_TAG):$(GITHUB_SHA)

.PHONY: release-tornjak
release-tornjak: image-tornjak ## Release tornjak image (bundling frontend and backend)
	docker push $(CONTAINER_TORNJAK_TAG):$(VERSION)
	docker tag $(CONTAINER_TORNJAK_TAG):$(VERSION) $(CONTAINER_TORNJAK_TAG):$(GITHUB_SHA)
	docker push $(CONTAINER_TORNJAK_TAG):$(GITHUB_SHA)
