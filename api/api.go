package api

import (
	"context"
	grpc "google.golang.org/grpc"

	agent "github.com/spiffe/spire/proto/spire/api/server/agent/v1"
	entry "github.com/spiffe/spire/proto/spire/api/server/entry/v1"
	types "github.com/spiffe/spire/proto/spire/types"
)

type ListAgentsRequest agent.ListAgentsRequest
type ListAgentsResponse agent.ListAgentsResponse

func (s *Server) ListAgents(inp ListAgentsRequest) (*ListAgentsResponse, error) {
	inpReq := agent.ListAgentsRequest(inp)
	var conn *grpc.ClientConn
	conn, err := grpc.Dial(s.SpireServerAddr, grpc.WithInsecure())
	if err != nil {
		return nil, err
	}
	defer conn.Close()
	client := agent.NewAgentClient(conn)

	resp, err := client.ListAgents(context.Background(), &inpReq)
	if err != nil {
		return nil, err
	}

	return (*ListAgentsResponse)(resp), nil
}

type BanAgentRequest agent.BanAgentRequest

func (s *Server) BanAgent(inp BanAgentRequest) error {
	inpReq := agent.BanAgentRequest(inp)
	var conn *grpc.ClientConn
	conn, err := grpc.Dial(s.SpireServerAddr, grpc.WithInsecure())
	if err != nil {
		return err
	}
	defer conn.Close()
	client := agent.NewAgentClient(conn)

	_, err = client.BanAgent(context.Background(), &inpReq)
	if err != nil {
		return err
	}

	return nil
}

type DeleteAgentRequest agent.DeleteAgentRequest

func (s *Server) DeleteAgent(inp DeleteAgentRequest) error {
	inpReq := agent.DeleteAgentRequest(inp)
	var conn *grpc.ClientConn
	conn, err := grpc.Dial(s.SpireServerAddr, grpc.WithInsecure())
	if err != nil {
		return err
	}
	defer conn.Close()
	client := agent.NewAgentClient(conn)

	_, err = client.DeleteAgent(context.Background(), &inpReq)
	if err != nil {
		return err
	}

	return nil
}

type CreateJoinTokenRequest agent.CreateJoinTokenRequest
type CreateJoinTokenResponse types.JoinToken

func (s *Server) CreateJoinToken(inp CreateJoinTokenRequest) (*CreateJoinTokenResponse, error) {
	inpReq := agent.CreateJoinTokenRequest(inp)
	var conn *grpc.ClientConn
	conn, err := grpc.Dial(s.SpireServerAddr, grpc.WithInsecure())
	if err != nil {
		return nil, err
	}
	defer conn.Close()
	client := agent.NewAgentClient(conn)

	joinToken, err := client.CreateJoinToken(context.Background(), &inpReq)
	if err != nil {
		return nil, err
	}

	return (*CreateJoinTokenResponse)(joinToken), nil
}

// Entries

type ListEntriesRequest entry.ListEntriesRequest
type ListEntriesResponse entry.ListEntriesResponse

func (s *Server) ListEntries(inp ListEntriesRequest) (*ListEntriesResponse, error) {
	inpReq := entry.ListEntriesRequest(inp)
	var conn *grpc.ClientConn
	conn, err := grpc.Dial(s.SpireServerAddr, grpc.WithInsecure())
	if err != nil {
		return nil, err
	}
	defer conn.Close()
	client := entry.NewEntryClient(conn)

	resp, err := client.ListEntries(context.Background(), &inpReq)
	if err != nil {
		return nil, err
	}

	return (*ListEntriesResponse)(resp), nil
}

type BatchCreateEntryRequest entry.BatchCreateEntryRequest
type BatchCreateEntryResponse entry.BatchCreateEntryResponse

func (s *Server) BatchCreateEntry(inp BatchCreateEntryRequest) (*BatchCreateEntryResponse, error) {
	inpReq := entry.BatchCreateEntryRequest(inp)
	var conn *grpc.ClientConn
	conn, err := grpc.Dial(s.SpireServerAddr, grpc.WithInsecure())
	if err != nil {
		return nil, err
	}
	defer conn.Close()
	client := entry.NewEntryClient(conn)

	resp, err := client.BatchCreateEntry(context.Background(), &inpReq)
	if err != nil {
		return nil, err
	}

	return (*BatchCreateEntryResponse)(resp), nil
}

type BatchDeleteEntryRequest entry.BatchDeleteEntryRequest
type BatchDeleteEntryResponse entry.BatchDeleteEntryResponse

func (s *Server) BatchDeleteEntry(inp BatchDeleteEntryRequest) (*BatchDeleteEntryResponse, error) {
	inpReq := entry.BatchDeleteEntryRequest(inp)
	var conn *grpc.ClientConn
	conn, err := grpc.Dial(s.SpireServerAddr, grpc.WithInsecure())
	if err != nil {
		return nil, err
	}
	defer conn.Close()
	client := entry.NewEntryClient(conn)

	resp, err := client.BatchDeleteEntry(context.Background(), &inpReq)
	if err != nil {
		return nil, err
	}

	return (*BatchDeleteEntryResponse)(resp), nil
}

/*

Agent

ListAgents(ListAgentsRequest) returns (ListAgentsResponse);
BanAgent(BanAgentRequest) returns (google.protobuf.Empty);
DeleteAgent(DeleteAgentRequest) returns (google.protobuf.Empty);
CreateJoinToken(CreateJoinTokenRequest) returns (spire.types.JoinToken);

Entries

ListEntries(ListEntriesRequest) returns (ListEntriesResponse);
BatchCreateEntry(BatchCreateEntryRequest) returns (BatchCreateEntryResponse);
GetEntry(GetEntryRequest) returns (spire.types.Entry);

*/

// types
