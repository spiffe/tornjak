package api

import (
	"context"
	"errors"

	grpc "google.golang.org/grpc"
	"google.golang.org/grpc/credentials/insecure"

	agent "github.com/spiffe/spire-api-sdk/proto/spire/api/server/agent/v1"
	bundle "github.com/spiffe/spire-api-sdk/proto/spire/api/server/bundle/v1"
	debugServer "github.com/spiffe/spire-api-sdk/proto/spire/api/server/debug/v1"
	entry "github.com/spiffe/spire-api-sdk/proto/spire/api/server/entry/v1"
	trustdomain "github.com/spiffe/spire-api-sdk/proto/spire/api/server/trustdomain/v1"
	types "github.com/spiffe/spire-api-sdk/proto/spire/api/types"
	"google.golang.org/grpc/health/grpc_health_v1"
)

type HealthcheckRequest grpc_health_v1.HealthCheckRequest
type HealthcheckResponse grpc_health_v1.HealthCheckResponse

func (s *Server) SPIREHealthcheck(inp HealthcheckRequest) (*HealthcheckResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	inpReq := grpc_health_v1.HealthCheckRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = conn.Close() //TODO log error
	}()
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
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = conn.Close() //TODO log error
	}()

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
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = conn.Close() //TODO log error
	}()

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
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return err
	}
	defer func() {
		_ = conn.Close() //TODO log error
	}()

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
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return err
	}
	defer func() {
	_ = conn.Close()
}()
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
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = conn.Close() //TODO log error
	}()

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
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = conn.Close() //TODO log error
	}()

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
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	defer func() {
		_ = conn.Close() //TODO log error
	}()

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
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	defer func() {
	_ = conn.Close()
}()
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
		return nil, errors.New("no SPIRE config provided to Tornjak")
	}
	return (*GetTornjakServerInfoResponse)(&s.SpireServerInfo), nil
}

// Bundle APIs
type GetBundleRequest bundle.GetBundleRequest
type GetBundleResponse types.Bundle

func (s *Server) GetBundle(inp GetBundleRequest) (*GetBundleResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	inpReq := bundle.GetBundleRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	defer func() {
	_ = conn.Close()
}()
	client := bundle.NewBundleClient(conn)

	bundle, err := client.GetBundle(context.Background(), &inpReq)
	if err != nil {
		return nil, err
	}

	return (*GetBundleResponse)(bundle), nil
}

type ListFederatedBundlesRequest bundle.ListFederatedBundlesRequest
type ListFederatedBundlesResponse bundle.ListFederatedBundlesResponse

func (s *Server) ListFederatedBundles(inp ListFederatedBundlesRequest) (*ListFederatedBundlesResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	inpReq := bundle.ListFederatedBundlesRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	defer func() {
	_ = conn.Close()
}()
	client := bundle.NewBundleClient(conn)

	bundle, err := client.ListFederatedBundles(context.Background(), &inpReq)
	if err != nil {
		return nil, err
	}

	return (*ListFederatedBundlesResponse)(bundle), nil
}

type CreateFederatedBundleRequest bundle.BatchCreateFederatedBundleRequest
type CreateFederatedBundleResponse bundle.BatchCreateFederatedBundleResponse

func (s *Server) CreateFederatedBundle(inp CreateFederatedBundleRequest) (*CreateFederatedBundleResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	inpReq := bundle.BatchCreateFederatedBundleRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	defer func() {
	_ = conn.Close()
}()
	client := bundle.NewBundleClient(conn)

	bundle, err := client.BatchCreateFederatedBundle(context.Background(), &inpReq)
	if err != nil {
		return nil, err
	}

	return (*CreateFederatedBundleResponse)(bundle), nil
}

type UpdateFederatedBundleRequest bundle.BatchUpdateFederatedBundleRequest
type UpdateFederatedBundleResponse bundle.BatchUpdateFederatedBundleResponse

func (s *Server) UpdateFederatedBundle(inp UpdateFederatedBundleRequest) (*UpdateFederatedBundleResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	inpReq := bundle.BatchUpdateFederatedBundleRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	defer func() {
	_ = conn.Close()
}()
	client := bundle.NewBundleClient(conn)

	bundle, err := client.BatchUpdateFederatedBundle(context.Background(), &inpReq)
	if err != nil {
		return nil, err
	}

	return (*UpdateFederatedBundleResponse)(bundle), nil
}

type DeleteFederatedBundleRequest bundle.BatchDeleteFederatedBundleRequest
type DeleteFederatedBundleResponse bundle.BatchDeleteFederatedBundleResponse

func (s *Server) DeleteFederatedBundle(inp DeleteFederatedBundleRequest) (*DeleteFederatedBundleResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	inpReq := bundle.BatchDeleteFederatedBundleRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	defer func() {
	_ = conn.Close()
}()
	client := bundle.NewBundleClient(conn)

	bundle, err := client.BatchDeleteFederatedBundle(context.Background(), &inpReq)
	if err != nil {
		return nil, err
	}

	return (*DeleteFederatedBundleResponse)(bundle), nil
}

// Federation APIs
type ListFederationRelationshipsRequest trustdomain.ListFederationRelationshipsRequest
type ListFederationRelationshipsResponse trustdomain.ListFederationRelationshipsResponse

func (s *Server) ListFederationRelationships(inp ListFederationRelationshipsRequest) (*ListFederationRelationshipsResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	inpReq := trustdomain.ListFederationRelationshipsRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	defer func() {
	_ = conn.Close()
}()
	client := trustdomain.NewTrustDomainClient(conn)

	bundle, err := client.ListFederationRelationships(context.Background(), &inpReq)
	if err != nil {
		return nil, err
	}

	return (*ListFederationRelationshipsResponse)(bundle), nil
}

type CreateFederationRelationshipRequest trustdomain.BatchCreateFederationRelationshipRequest
type CreateFederationRelationshipResponse trustdomain.BatchCreateFederationRelationshipResponse

func (s *Server) CreateFederationRelationship(inp CreateFederationRelationshipRequest) (*CreateFederationRelationshipResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	inpReq := trustdomain.BatchCreateFederationRelationshipRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	defer func() {
	_ = conn.Close()
}()
	client := trustdomain.NewTrustDomainClient(conn)

	bundle, err := client.BatchCreateFederationRelationship(context.Background(), &inpReq)
	if err != nil {
		return nil, err
	}

	return (*CreateFederationRelationshipResponse)(bundle), nil
}

type UpdateFederationRelationshipRequest trustdomain.BatchUpdateFederationRelationshipRequest
type UpdateFederationRelationshipResponse trustdomain.BatchUpdateFederationRelationshipResponse

func (s *Server) UpdateFederationRelationship(inp UpdateFederationRelationshipRequest) (*UpdateFederationRelationshipResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	inpReq := trustdomain.BatchUpdateFederationRelationshipRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	defer func() {
	_ = conn.Close()
}()
	client := trustdomain.NewTrustDomainClient(conn)

	bundle, err := client.BatchUpdateFederationRelationship(context.Background(), &inpReq)
	if err != nil {
		return nil, err
	}

	return (*UpdateFederationRelationshipResponse)(bundle), nil
}

type DeleteFederationRelationshipRequest trustdomain.BatchDeleteFederationRelationshipRequest
type DeleteFederationRelationshipResponse trustdomain.BatchDeleteFederationRelationshipResponse

func (s *Server) DeleteFederationRelationship(inp DeleteFederationRelationshipRequest) (*DeleteFederationRelationshipResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	inpReq := trustdomain.BatchDeleteFederationRelationshipRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		return nil, err
	}
	defer func() {
	_ = conn.Close()
}()
	client := trustdomain.NewTrustDomainClient(conn)

	bundle, err := client.BatchDeleteFederationRelationship(context.Background(), &inpReq)
	if err != nil {
		return nil, err
	}

	return (*DeleteFederationRelationshipResponse)(bundle), nil
}
