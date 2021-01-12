package main

import (
    grpc "google.golang.org/grpc"
    "fmt"
    "log"
    "context"
    agent "github.com/spiffe/spire/proto/spire/api/server/agent/v1"
    "os"
)

func main() {
    if len(os.Args) <  3 {
        log.Fatalf("Usage %v <unix://socket> [list|join]", os.Args[0])
    }
    var conn *grpc.ClientConn
	conn, err := grpc.Dial(os.Args[1], grpc.WithInsecure())
	if err != nil {
		log.Fatalf("did not connect: %s", err)
	}
	defer conn.Close()


    cmd := os.Args[2]
    client:= agent.NewAgentClient(conn)

    if cmd == "list" {

        resp, err := client.ListAgents(context.Background(), &agent.ListAgentsRequest{})
        if err != nil {
            log.Fatalf("can't list agents %s", err)
        }

        for _, v := range resp.Agents {
            fmt.Println(v)
        }
    } else if cmd == "join" {

        resp, err := client.CreateJoinToken(context.Background(), &agent.CreateJoinTokenRequest{Ttl: 6000})
        if err != nil {
            log.Fatalf("can't create join token %s", err)
        }
        fmt.Printf("Join token: %s\n", resp.Value)
    } else {
        log.Fatalf("Unrecognized command")
    }

    return
}
