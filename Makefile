.PHONY: ui vendor build

CONTAINER_TAG ?= lumjjb/tornjak-spire-server:latest

all: bin/tornjak ui container

bin/tornjak: vendor
	# Build hack because of flake of imported go module
	docker run --rm -v "${PWD}":/usr/src/myapp -w /usr/src/myapp -e GOOS=linux -e GOARCH=amd64 golang:1.15 /bin/sh -c "go build .; go build -mod=vendor -ldflags '-s -w -linkmode external -extldflags "-static"' -o bin/tornjak ."

ui:
	npm install --prefix tornjak-frontend
	npm run build --prefix tornjak-frontend
	rm -rf ui
	cp -r tornjak-frontend/build ui

vendor:
	go mod tidy
	go mod vendor

container: bin/tornjak ui
	docker build --no-cache -f Dockerfile.add-frontend -t ${CONTAINER_TAG} . && docker push ${CONTAINER_TAG}

clean:
	rm -rf bin/
	rm -rf ui/
