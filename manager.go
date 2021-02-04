package main

import (
    managerapi "github.com/lumjjb/tornjak/manager/api"
    "log"
)

func main() {
    var (
        dbString = "./localdb"
        listenAddr = ":50000"
    )
    s, err := managerapi.NewManagerServer(listenAddr, dbString)
    if err != nil {
        log.Fatalf("err: %v", err)
    }
    s.HandleRequests()
}
