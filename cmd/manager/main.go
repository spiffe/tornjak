package main

import (
	"log"

	managerapi "github.com/spiffe/tornjak/api/manager"
)

func main() {
	// Define listening address and database path
	dbString := "./serverlocaldb"
	listenAddr := ":50000"

	// Initialize the manager server
	srv, err := managerapi.NewManagerServer(listenAddr, dbString)
	if err != nil {
		log.Fatalf("Failed to create manager server: %v", err)
	}

	// Start the server (blocking call)
	log.Printf("Starting Manager API on %s...", listenAddr)
	if err := srv.Start(); err != nil {
		log.Fatalf("Server exited with error: %v", err)
	}
}
