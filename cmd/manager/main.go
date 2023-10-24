package main

import (
	"log"

	managerapi "github.com/spiffe/tornjak/api/manager"
)

func main() {
	var (
		dbString   = "./serverlocaldb"
		listenAddr = ":50000"
	)
	s, err := managerapi.NewManagerServer(listenAddr, dbString)
	if err != nil {
		log.Fatalf("err: %v", err)
	}
	s.HandleRequests()
}
