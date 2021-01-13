# docker run --rm -v "$PWD":/usr/src/myapp -w /usr/src/myapp -e GOOS=linux -e GOARCH=amd64 golang:1.14 go build -v -ldflags '-s -w -linkmode external -extldflags "-static"' -o tornjak . 
docker build -t lumjjb/tornjak . && docker push lumjjb/tornjak \
&& docker build -f Dockerfile.spireadd -t lumjjb/tornjak-spire-server . && docker push lumjjb/tornjak-spire-server
