package api

import (
	"context"
	"errors"

	grpc "google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	agent "github.com/spiffe/spire-api-sdk/proto/spire/api/server/agent/v1"
	debugServer "github.com/spiffe/spire-api-sdk/proto/spire/api/server/debug/v1"
	entry "github.com/spiffe/spire-api-sdk/proto/spire/api/server/entry/v1"
	types "github.com/spiffe/spire-api-sdk/proto/spire/api/types"
	"google.golang.org/grpc/health/grpc_health_v1"

	tornjakTypes "github.com/spiffe/tornjak/pkg/agent/types"
)

type HealthcheckRequest grpc_health_v1.HealthCheckRequest
type HealthcheckResponse grpc_health_v1.HealthCheckResponse

func (s *Server) SPIREHealthcheck(inp HealthcheckRequest) (*HealthcheckResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	inpReq := grpc_health_v1.HealthCheckRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	var conn *grpc.ClientConn
	conn, err := grpc.Dial(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	defer conn.Close()
	client := grpc_health_v1.NewHealthClient(conn)

	resp, err := client.Check(context.Background(), &inpReq)
	if err != nil {
		return nil, err
	}

	return (*HealthcheckResponse)(resp), nil
}

type DebugServerRequest debugServer.GetInfoRequest
type DebugServerResponse debugServer.GetInfoResponse

func (s *Server) DebugServer(inp DebugServerRequest) (*DebugServerResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	inpReq := debugServer.GetInfoRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	var conn *grpc.ClientConn
	conn, err := grpc.Dial(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	defer conn.Close()
	client := debugServer.NewDebugClient(conn)

	resp, err := client.GetInfo(context.Background(), &inpReq)
	if err != nil {
		return nil, err
	}

	return (*DebugServerResponse)(resp), nil
}

type ListAgentsRequest agent.ListAgentsRequest
type ListAgentsResponse agent.ListAgentsResponse

func (s *Server) ListAgents(inp ListAgentsRequest) (*ListAgentsResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	inpReq := agent.ListAgentsRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	var conn *grpc.ClientConn
	conn, err := grpc.Dial(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
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
	conn, err := grpc.Dial(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
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
	conn, err := grpc.Dial(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
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
	conn, err := grpc.Dial(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
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
	conn, err := grpc.Dial(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
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
	conn, err := grpc.Dial(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
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
	conn, err := grpc.Dial(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
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
type GetTornjakServerInfoResponse TornjakSpireServerInfo

func (s *Server) GetTornjakServerInfo(inp GetTornjakServerInfoRequest) (*GetTornjakServerInfoResponse, error) {
	if s.SpireServerInfo.TrustDomain == "" {
		return nil, errors.New("No SPIRE config provided to Tornjak")
	}
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
type ListSelectorsResponse tornjakTypes.AgentInfoList

// ListSelectors returns list of agents from the local DB with the following info
// spiffeid string
// plugin   string
func (s *Server) ListSelectors(inp ListSelectorsRequest) (*ListSelectorsResponse, error) {
	resp, err := s.Db.GetAgentSelectors()
	if err != nil {
		return nil, err
	}
	return (*ListSelectorsResponse)(&resp), nil
}

type RegisterSelectorRequest tornjakTypes.AgentInfo

// DefineSelectors registers an agent to the local DB with the following info
// spiffeid string
// plugin   string
func (s *Server) DefineSelectors(inp RegisterSelectorRequest) error {
	sinfo := tornjakTypes.AgentInfo(inp)
	if len(sinfo.Spiffeid) == 0 {
		return errors.New("agent's info missing mandatory field - Spiffeid")
	}
	return s.Db.CreateAgentEntry(sinfo)
}

type ListAgentMetadataRequest tornjakTypes.AgentMetadataRequest
type ListAgentMetadataResponse tornjakTypes.AgentInfoList

// ListAgentMetadata takes in list of agent spiffeids
// and returns list of those agents from the local DB with following info
// spiffeid string
// plugin string
// cluster string
// if no metadata found, no row is included
// if no spiffeids are specified, all agent metadata is returned
func (s *Server) ListAgentMetadata(inp ListAgentMetadataRequest) (*ListAgentMetadataResponse, error) {
	inpReq := tornjakTypes.AgentMetadataRequest(inp)
	resp, err := s.Db.GetAgentsMetadata(inpReq)
	if err != nil {
		return nil, err
	}
	return (*ListAgentMetadataResponse)(&resp), nil
}

type ListClustersRequest struct{}
type ListClustersResponse tornjakTypes.ClusterInfoList

// ListClusters returns list of clusters from the local DB with the following info
// name string
// details json
func (s *Server) ListClusters(inp ListClustersRequest) (*ListClustersResponse, error) {
	retVal, err := s.Db.GetClusters()
	if err != nil {
		return nil, err
	}
	return (*ListClustersResponse)(&retVal), nil
}

type RegisterClusterRequest tornjakTypes.ClusterInput

// DefineCluster registers cluster to local DB
func (s *Server) DefineCluster(inp RegisterClusterRequest) error {
	cinfo := tornjakTypes.ClusterInfo(inp.ClusterInstance)
	if len(cinfo.Name) == 0 {
		return errors.New("cluster definition missing mandatory field - Name")
	} else if len(cinfo.PlatformType) == 0 {
		return errors.New("cluster definition missing mandatory field - PlatformType")
	} else if len(cinfo.EditedName) > 0 {
		return errors.New("cluster definition attempts renaming on create cluster - EditedName")
	}
	return s.Db.CreateClusterEntry(cinfo)
}

type EditClusterRequest tornjakTypes.ClusterInput

// EditCluster registers cluster to local DB
func (s *Server) EditCluster(inp EditClusterRequest) error {
	cinfo := tornjakTypes.ClusterInfo(inp.ClusterInstance)
	if len(cinfo.Name) == 0 {
		return errors.New("cluster definition missing mandatory field - Name")
	} else if len(cinfo.PlatformType) == 0 {
		return errors.New("cluster definition missing mandatory field - PlatformType")
	} else if len(cinfo.EditedName) == 0 {
		return errors.New("cluster definition missing mandatory field - EditedName")
	}
	return s.Db.EditClusterEntry(cinfo)
}

type DeleteClusterRequest tornjakTypes.ClusterInput

// DeleteCluster deletes cluster with name cinfo.Name and assignment to agents
func (s *Server) DeleteCluster(inp DeleteClusterRequest) error {
	cinfo := tornjakTypes.ClusterInfo(inp.ClusterInstance)
	if len(cinfo.Name) == 0 {
		return errors.New("input missing mandatory field - Name")
	}
	return s.Db.DeleteClusterEntry(cinfo.Name)
}
