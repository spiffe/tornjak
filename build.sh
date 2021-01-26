#rm -f tornjak
#docker run --rm -v "$PWD":/usr/src/myapp -w /usr/src/myapp -e GOOS=linux -e GOARCH=amd64 golang:1.14 go build -v -ldflags '-s -w -linkmode external -extldflags "-static"' -o tornjak . 

[[ -f tornjak ]] && \
docker build -t lumjjb/tornjak . && docker push lumjjb/tornjak \
&& docker build -f Dockerfile.spireadd -t lumjjb/tornjak-spire-server . && docker push lumjjb/tornjak-spire-server \
&& docker build --no-cache -f Dockerfile.add-frontend -t lumjjb/tornjak-spire-server-front . && docker push lumjjb/tornjak-spire-server-front
