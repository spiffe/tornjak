package main

import (
	"context"
	"flag"
	"log"

	"github.com/spiffe/go-spiffe/v2/workloadapi"
)

func main() {
	workloadAPIAddr := flag.String("workload-api-addr", "", "Workload API Address")
	flag.Parse()

	var opts []workloadapi.ClientOption
	if *workloadAPIAddr != "" {
		opts = append(opts, workloadapi.WithAddr(*workloadAPIAddr))
	}

	log.Println("Watching...")
	err := workloadapi.WatchX509Context(context.Background(), watcher{}, opts...)
	log.Fatal("Error: ", err)
}

type watcher struct{}

func (watcher) OnX509ContextUpdate(x509Context *workloadapi.X509Context) {
	log.Println("Update:")
	log.Println("  SVIDs:")
	for _, svid := range x509Context.SVIDs {
		log.Printf("    %s\n", svid.ID)
	}
	log.Println("  Bundles:")
	for _, bundle := range x509Context.Bundles.Bundles() {
		log.Printf("    %s (%d authorities)\n", bundle.TrustDomain(), len(bundle.X509Authorities()))
	}
}

func (watcher) OnX509ContextWatchError(err error) {
	log.Println("Error:", err)
}
