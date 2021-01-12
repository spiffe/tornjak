GOOS=linux GOARCH=amd64 go build -o tornjak . && docker build -t lumjjb/tornjak . && docker push lumjjb/tornjak
