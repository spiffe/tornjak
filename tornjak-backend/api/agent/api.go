package api

import (
	"context"
	"errors"

	grpc "google.golang.org/grpc"

	agent "github.com/spiffe/spire/proto/spire/api/server/agent/v1"
	entry "github.com/spiffe/spire/proto/spire/api/server/entry/v1"
	types "github.com/spiffe/spire/proto/spire/types"

	agentTypes "github.com/lumjjb/tornjak/tornjak-backend/pkg/agent/types"
)

type ListAgentsRequest agent.ListAgentsRequest
type ListAgentsResponse agent.ListAgentsResponse

func (s *Server) ListAgents(inp ListAgentsRequest) (*ListAgentsResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	inpReq := agent.ListAgentsRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
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

func (s *Server) BanAgent(inp BanAgentRequest) error { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	inpReq := agent.BanAgentRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
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

func (s *Server) DeleteAgent(inp DeleteAgentRequest) error { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	inpReq := agent.DeleteAgentRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
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

func (s *Server) CreateJoinToken(inp CreateJoinTokenRequest) (*CreateJoinTokenResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	inpReq := agent.CreateJoinTokenRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
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

func (s *Server) ListEntries(inp ListEntriesRequest) (*ListEntriesResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	inpReq := entry.ListEntriesRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
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

func (s *Server) BatchCreateEntry(inp BatchCreateEntryRequest) (*BatchCreateEntryResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	inpReq := entry.BatchCreateEntryRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
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

func (s *Server) BatchDeleteEntry(inp BatchDeleteEntryRequest) (*BatchDeleteEntryResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	inpReq := entry.BatchDeleteEntryRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
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

type GetTornjakServerInfoRequest struct{}
type GetTornjakServerInfoResponse TornjakServerInfo

func (s *Server) GetTornjakServerInfo(inp GetTornjakServerInfoRequest) (*GetTornjakServerInfoResponse, error) {
	return (*GetTornjakServerInfoResponse)(&s.SpireServerInfo), nil
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

type ListSelectorsRequest struct{}
type ListSelectorsResponse agentTypes.AgentInfoList

// ListSelectors returns list of agents from the loacal DB with the following info
// spiffeid string
// plugin   string
func (s *Server) ListSelectors(inp ListSelectorsRequest) (*ListSelectorsResponse, error) {
	resp, err := s.Db.GetAgents()
	if err != nil {
		return nil, err
	}
	return (*ListSelectorsResponse)(&resp), nil
}

type RegisterSelectorRequest agentTypes.AgentInfo

// DefineSelectors registers an agent to the loacal DB with the following info
// spiffeid string
// plugin   string
func (s *Server) DefineSelectors(inp RegisterSelectorRequest) error {
	sinfo := agentTypes.AgentInfo(inp)
	if len(sinfo.Spiffeid) == 0 {
		return errors.New("agent's info missing mandatory field - Spiffeid")
	}
	return s.Db.CreateAgentEntry(sinfo)
}
