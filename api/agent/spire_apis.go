package api

import (
	"context"
	"errors"
	"log"

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
	log.Println("SPIREHealthcheck: Starting health check for SPIRE server")
	inpReq := grpc_health_v1.HealthCheckRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Printf("SPIREHealthcheck: Connecting to SPIRE server at %s", s.SpireServerAddr)
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("SPIREHealthcheck: Failed to connect to SPIRE server: %v", err)
		return nil, err
	}
	defer func() {
		if err := conn.Close(); err != nil {
			log.Printf("SPIREHealthcheck: Failed to close gRPC connection: %v", err)
		} else {
			log.Println("SPIREHealthcheck: gRPC connection closed")
		}
	}()
	client := grpc_health_v1.NewHealthClient(conn)

	log.Println("SPIREHealthcheck: Sending health check request")
	resp, err := client.Check(context.Background(), &inpReq)
	if err != nil {
		log.Printf("SPIREHealthcheck: Health check failed: %v", err)
		return nil, err
	}

	log.Println("SPIREHealthcheck: Health check completed")
	return (*HealthcheckResponse)(resp), nil
}

type DebugServerRequest debugServer.GetInfoRequest
type DebugServerResponse debugServer.GetInfoResponse

func (s *Server) DebugServer(inp DebugServerRequest) (*DebugServerResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Println("DebugServer: Establishing gRPC connection to", s.SpireServerAddr)
	inpReq := debugServer.GetInfoRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("DebugServer: Failed to connect to SPIRE server: %v", err)
		return nil, err
	}
	defer func() {
		if cerr := conn.Close(); cerr != nil {
			log.Printf("DebugServer: Error closing gRPC connection: %v", cerr)
		} else {
			log.Println("DebugServer: Closed gRPC connection")
		}
	}()

	client := debugServer.NewDebugClient(conn)
	log.Println("DebugServer: Sending GetInfo gRPC request")

	resp, err := client.GetInfo(context.Background(), &inpReq)
	if err != nil {
		log.Printf("DebugServer: GetInfo request failed: %v", err)
		return nil, err
	}
	log.Println("DebugServer: GetInfo request completed")
	return (*DebugServerResponse)(resp), nil
}

type ListAgentsRequest agent.ListAgentsRequest
type ListAgentsResponse agent.ListAgentsResponse

func (s *Server) ListAgents(inp ListAgentsRequest) (*ListAgentsResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Println("ListAgents: Establishing gRPC connection to", s.SpireServerAddr)
	inpReq := agent.ListAgentsRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("ListAgents: Failed to connect to SPIRE server: %v", err)
		return nil, err
	}
	defer func() {
		if err := conn.Close(); err != nil {
			log.Printf("ListAgents: Error closing connection: %v", err)
		} else {
			log.Println("ListAgents: Closed gRPC connection")
		}
	}()
	log.Println("ListAgents: Sending ListAgents request")
	client := agent.NewAgentClient(conn)

	resp, err := client.ListAgents(context.Background(), &inpReq)
	if err != nil {
		log.Printf("ListAgents: gRPC call failed: %v", err)
		return nil, err
	}
	log.Println("ListAgents: Request completed")
	return (*ListAgentsResponse)(resp), nil
}

type BanAgentRequest agent.BanAgentRequest

func (s *Server) BanAgent(inp BanAgentRequest) error { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Println("BanAgent: Preparing gRPC request to ban agent")
	inpReq := agent.BanAgentRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet

	log.Printf("BanAgent: Connecting to SPIRE server at %s", s.SpireServerAddr)
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("BanAgent: Failed to connect to SPIRE server: %v", err)
		return err
	}
	defer func() {
		if err := conn.Close(); err != nil {
			log.Printf("BanAgent: Failed to close gRPC connection: %v", err)
		} else {
			log.Println("BanAgent: gRPC connection closed")
		}
	}()

	client := agent.NewAgentClient(conn)
	log.Println("BanAgent: Sending ban agent request")
	_, err = client.BanAgent(context.Background(), &inpReq)
	if err != nil {
		log.Printf("BanAgent: Failed to ban agent: %v", err)
		return err
	}
	log.Println("BanAgent: Agent banned")
	return nil
}

type DeleteAgentRequest agent.DeleteAgentRequest

func (s *Server) DeleteAgent(inp DeleteAgentRequest) error { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Println("DeleteAgent: Preparing to delete agent")
	inpReq := agent.DeleteAgentRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet

	log.Printf("DeleteAgent: Connecting to SPIRE server at %s", s.SpireServerAddr)
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("DeleteAgent: Failed to connect to SPIRE server: %v", err)
		return err
	}
	defer func() {
		if err := conn.Close(); err != nil {
			log.Printf("DeleteAgent: Failed to close gRPC connection: %v", err)
		} else {
			log.Println("DeleteAgent: gRPC connection closed")
		}
	}()
	client := agent.NewAgentClient(conn)

	log.Println("DeleteAgent: Sending DeleteAgent request")
	_, err = client.DeleteAgent(context.Background(), &inpReq)
	if err != nil {
		log.Printf("DeleteAgent: Request failed: %v", err)
		return err
	}

	log.Println("DeleteAgent: Agent successfully deleted")
	return nil
}

type CreateJoinTokenRequest agent.CreateJoinTokenRequest
type CreateJoinTokenResponse types.JoinToken

func (s *Server) CreateJoinToken(inp CreateJoinTokenRequest) (*CreateJoinTokenResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Println("CreateJoinToken: Starting join token creation")
	inpReq := agent.CreateJoinTokenRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Printf("CreateJoinToken: Connecting to SPIRE server at %s", s.SpireServerAddr)
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("CreateJoinToken: Failed to connect to SPIRE server: %v", err)
		return nil, err
	}
	defer func() {
		if err := conn.Close(); err != nil {
			log.Printf("CreateJoinToken: Failed to close gRPC connection: %v", err)
		} else {
			log.Println("CreateJoinToken: gRPC connection closed")
		}
	}()

	client := agent.NewAgentClient(conn)
	log.Println("CreateJoinToken: Sending CreateJoinToken request")
	joinToken, err := client.CreateJoinToken(context.Background(), &inpReq)
	if err != nil {
		log.Printf("CreateJoinToken: Request failed: %v", err)
		return nil, err
	}

	log.Println("CreateJoinToken: Token created successfully")
	return (*CreateJoinTokenResponse)(joinToken), nil
}

// Entries

type ListEntriesRequest entry.ListEntriesRequest
type ListEntriesResponse entry.ListEntriesResponse

func (s *Server) ListEntries(inp ListEntriesRequest) (*ListEntriesResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Println("ListEntries: Initiating list entries request")
	inpReq := entry.ListEntriesRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet

	log.Printf("ListEntries: Connecting to SPIRE server at %s", s.SpireServerAddr)
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("ListEntries: Failed to connect to SPIRE server: %v", err)
		return nil, err
	}
	defer func() {
		if err := conn.Close(); err != nil {
			log.Printf("ListEntries: Failed to close gRPC connection: %v", err)
		} else {
			log.Println("ListEntries: gRPC connection closed")
		}
	}()

	client := entry.NewEntryClient(conn)
	log.Println("ListEntries: Sending ListEntries request")
	resp, err := client.ListEntries(context.Background(), &inpReq)
	if err != nil {
		log.Printf("ListEntries: Request failed: %v", err)
		return nil, err
	}

	log.Println("ListEntries: Entries retrieved successfully")
	return (*ListEntriesResponse)(resp), nil
}

type BatchCreateEntryRequest entry.BatchCreateEntryRequest
type BatchCreateEntryResponse entry.BatchCreateEntryResponse

func (s *Server) BatchCreateEntry(inp BatchCreateEntryRequest) (*BatchCreateEntryResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Println("BatchCreateEntry: Starting batch creation of entries")

	inpReq := entry.BatchCreateEntryRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet

	log.Printf("BatchCreateEntry: Connecting to SPIRE server at %s", s.SpireServerAddr)
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("BatchCreateEntry: Failed to connect to SPIRE server: %v", err)
		return nil, err
	}
	defer func() {
		if err := conn.Close(); err != nil {
			log.Printf("BatchCreateEntry: Failed to close gRPC connection: %v", err)
		} else {
			log.Println("BatchCreateEntry: gRPC connection closed")
		}
	}()

	client := entry.NewEntryClient(conn)
	log.Println("BatchCreateEntry: Sending BatchCreateEntry request")
	resp, err := client.BatchCreateEntry(context.Background(), &inpReq)
	if err != nil {
		log.Printf("BatchCreateEntry: Request failed: %v", err)
		return nil, err
	}

	log.Println("BatchCreateEntry: Entries created successfully")
	return (*BatchCreateEntryResponse)(resp), nil
}

type BatchDeleteEntryRequest entry.BatchDeleteEntryRequest
type BatchDeleteEntryResponse entry.BatchDeleteEntryResponse

func (s *Server) BatchDeleteEntry(inp BatchDeleteEntryRequest) (*BatchDeleteEntryResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Println("BatchDeleteEntry: Starting batch deletion of entries")
	inpReq := entry.BatchDeleteEntryRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Printf("BatchDeleteEntry: Connecting to SPIRE server at %s", s.SpireServerAddr)
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("BatchDeleteEntry: Failed to connect to SPIRE server: %v", err)
		return nil, err
	}
	defer func() {
		if err := conn.Close(); err != nil {
			log.Printf("BatchDeleteEntry: Failed to close gRPC connection: %v", err)
		} else {
			log.Println("BatchDeleteEntry: gRPC connection closed")
		}
	}()
	client := entry.NewEntryClient(conn)

	log.Println("BatchDeleteEntry: Sending BatchDeleteEntry request")
	resp, err := client.BatchDeleteEntry(context.Background(), &inpReq)
	if err != nil {
		log.Printf("BatchDeleteEntry: Request failed: %v", err)
		return nil, err
	}

	log.Println("BatchDeleteEntry: Entries deleted successfully")
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
	log.Println("GetBundle: Starting bundle retrieval")
	inpReq := bundle.GetBundleRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet

	log.Printf("GetBundle: Connecting to SPIRE server at %s", s.SpireServerAddr)
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("GetBundle: Failed to connect to SPIRE server: %v", err)
		return nil, err
	}
	defer func() {
		if err := conn.Close(); err != nil {
			log.Printf("GetBundle: Failed to close gRPC connection: %v", err)
		} else {
			log.Println("GetBundle: gRPC connection closed")
		}
	}()
	client := bundle.NewBundleClient(conn)

	log.Println("GetBundle: Sending GetBundle request")
	bundle, err := client.GetBundle(context.Background(), &inpReq)
	if err != nil {
		log.Printf("GetBundle: Request failed: %v", err)
		return nil, err
	}

	log.Println("GetBundle: Bundle retrieved successfully")
	return (*GetBundleResponse)(bundle), nil
}

type ListFederatedBundlesRequest bundle.ListFederatedBundlesRequest
type ListFederatedBundlesResponse bundle.ListFederatedBundlesResponse

func (s *Server) ListFederatedBundles(inp ListFederatedBundlesRequest) (*ListFederatedBundlesResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Println("ListFederatedBundles: Starting federated bundles listing")
	inpReq := bundle.ListFederatedBundlesRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet

	log.Printf("ListFederatedBundles: Connecting to SPIRE server at %s", s.SpireServerAddr)
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("ListFederatedBundles: Failed to connect to SPIRE server: %v", err)
		return nil, err
	}
	defer func() {
		if err := conn.Close(); err != nil {
			log.Printf("ListFederatedBundles: Failed to close gRPC connection: %v", err)
		} else {
			log.Println("ListFederatedBundles: gRPC connection closed")
		}
	}()
	client := bundle.NewBundleClient(conn)
	log.Println("ListFederatedBundles: Sending ListFederatedBundles request")
	bundle, err := client.ListFederatedBundles(context.Background(), &inpReq)
	if err != nil {
		log.Printf("ListFederatedBundles: Request failed: %v", err)
		return nil, err
	}
	log.Println("ListFederatedBundles: Retrieved federated bundles successfully")
	return (*ListFederatedBundlesResponse)(bundle), nil
}

type CreateFederatedBundleRequest bundle.BatchCreateFederatedBundleRequest
type CreateFederatedBundleResponse bundle.BatchCreateFederatedBundleResponse

func (s *Server) CreateFederatedBundle(inp CreateFederatedBundleRequest) (*CreateFederatedBundleResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Println("CreateFederatedBundle: Starting creation of federated bundle")
	inpReq := bundle.BatchCreateFederatedBundleRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Printf("CreateFederatedBundle: Connecting to SPIRE server at %s", s.SpireServerAddr)
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("CreateFederatedBundle: Failed to connect to SPIRE server: %v", err)
		return nil, err
	}
	defer func() {
		if err := conn.Close(); err != nil {
			log.Printf("CreateFederatedBundle: Failed to close gRPC connection: %v", err)
		} else {
			log.Println("CreateFederatedBundle: gRPC connection closed")
		}
	}()
	client := bundle.NewBundleClient(conn)
	log.Println("CreateFederatedBundle: Sending BatchCreateFederatedBundle request")
	bundle, err := client.BatchCreateFederatedBundle(context.Background(), &inpReq)
	if err != nil {
		log.Printf("CreateFederatedBundle: Request failed: %v", err)
		return nil, err
	}
	log.Println("CreateFederatedBundle: Federated bundle created successfully")
	return (*CreateFederatedBundleResponse)(bundle), nil
}

type UpdateFederatedBundleRequest bundle.BatchUpdateFederatedBundleRequest
type UpdateFederatedBundleResponse bundle.BatchUpdateFederatedBundleResponse

func (s *Server) UpdateFederatedBundle(inp UpdateFederatedBundleRequest) (*UpdateFederatedBundleResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Println("UpdateFederatedBundle: Starting update of federated bundle")
	inpReq := bundle.BatchUpdateFederatedBundleRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet

	log.Printf("UpdateFederatedBundle: Connecting to SPIRE server at %s", s.SpireServerAddr)
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("UpdateFederatedBundle: Failed to connect to SPIRE server: %v", err)
		return nil, err
	}
	defer func() {
		if err := conn.Close(); err != nil {
			log.Printf("UpdateFederatedBundle: Failed to close gRPC connection: %v", err)
		} else {
			log.Println("UpdateFederatedBundle: gRPC connection closed")
		}
	}()
	client := bundle.NewBundleClient(conn)

	bundle, err := client.BatchUpdateFederatedBundle(context.Background(), &inpReq)
	if err != nil {
		log.Printf("UpdateFederatedBundle: Request failed: %v", err)
		return nil, err
	}
	log.Println("UpdateFederatedBundle: Federated bundle updated successfully")
	return (*UpdateFederatedBundleResponse)(bundle), nil
}

type DeleteFederatedBundleRequest bundle.BatchDeleteFederatedBundleRequest
type DeleteFederatedBundleResponse bundle.BatchDeleteFederatedBundleResponse

func (s *Server) DeleteFederatedBundle(inp DeleteFederatedBundleRequest) (*DeleteFederatedBundleResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Println("DeleteFederatedBundle: Starting deletion of federated bundle")
	inpReq := bundle.BatchDeleteFederatedBundleRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Printf("DeleteFederatedBundle: Connecting to SPIRE server at %s", s.SpireServerAddr)
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("DeleteFederatedBundle: Failed to connect to SPIRE server: %v", err)
		return nil, err
	}
	defer func() {
		if err := conn.Close(); err != nil {
			log.Printf("DeleteFederatedBundle: Failed to close gRPC connection: %v", err)
		} else {
			log.Println("DeleteFederatedBundle: gRPC connection closed")
		}
	}()
	client := bundle.NewBundleClient(conn)
	log.Println("DeleteFederatedBundle: Sending BatchDeleteFederatedBundle request")

	bundle, err := client.BatchDeleteFederatedBundle(context.Background(), &inpReq)
	if err != nil {
		log.Printf("DeleteFederatedBundle: Request failed: %v", err)
		return nil, err
	}
	log.Println("DeleteFederatedBundle: Federated bundle deleted successfully")
	return (*DeleteFederatedBundleResponse)(bundle), nil
}

// Federation APIs
type ListFederationRelationshipsRequest trustdomain.ListFederationRelationshipsRequest
type ListFederationRelationshipsResponse trustdomain.ListFederationRelationshipsResponse

func (s *Server) ListFederationRelationships(inp ListFederationRelationshipsRequest) (*ListFederationRelationshipsResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Println("ListFederationRelationships: Starting to list federation relationships")
	inpReq := trustdomain.ListFederationRelationshipsRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Printf("ListFederationRelationships: Connecting to SPIRE server at %s", s.SpireServerAddr)
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("ListFederationRelationships: Failed to connect to SPIRE server: %v", err)
		return nil, err
	}
	defer func() {
		if err := conn.Close(); err != nil {
			log.Printf("ListFederationRelationships: Failed to close gRPC connection: %v", err)
		} else {
			log.Println("ListFederationRelationships: gRPC connection closed")
		}
	}()
	client := trustdomain.NewTrustDomainClient(conn)

	log.Println("ListFederationRelationships: Sending ListFederationRelationships request")
	bundle, err := client.ListFederationRelationships(context.Background(), &inpReq)
	if err != nil {
		log.Printf("ListFederationRelationships: Request failed: %v", err)
		return nil, err
	}
	log.Println("ListFederationRelationships: Federation relationships listed successfully")
	return (*ListFederationRelationshipsResponse)(bundle), nil
}

type CreateFederationRelationshipRequest trustdomain.BatchCreateFederationRelationshipRequest
type CreateFederationRelationshipResponse trustdomain.BatchCreateFederationRelationshipResponse

func (s *Server) CreateFederationRelationship(inp CreateFederationRelationshipRequest) (*CreateFederationRelationshipResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Println("CreateFederationRelationship: Starting creation of federation relationship")
	inpReq := trustdomain.BatchCreateFederationRelationshipRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Printf("CreateFederationRelationship: Connecting to SPIRE server at %s", s.SpireServerAddr)
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("CreateFederationRelationship: Failed to connect to SPIRE server: %v", err)
		return nil, err
	}
	defer func() {
		if err := conn.Close(); err != nil {
			log.Printf("CreateFederationRelationship: Failed to close gRPC connection: %v", err)
		} else {
			log.Println("CreateFederationRelationship: gRPC connection closed")
		}
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
	log.Println("CreateFederationRelationship: Sending BatchCreateFederationRelationship request")
	bundle, err := client.BatchUpdateFederationRelationship(context.Background(), &inpReq)
	if err != nil {
		log.Printf("CreateFederationRelationship: Request failed: %v", err)
		return nil, err
	}
	log.Println("CreateFederationRelationship: Federation relationship created successfully")
	return (*UpdateFederationRelationshipResponse)(bundle), nil
}

type DeleteFederationRelationshipRequest trustdomain.BatchDeleteFederationRelationshipRequest
type DeleteFederationRelationshipResponse trustdomain.BatchDeleteFederationRelationshipResponse

func (s *Server) DeleteFederationRelationship(inp DeleteFederationRelationshipRequest) (*DeleteFederationRelationshipResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Println("DeleteFederationRelationship: Starting deletion of federation relationship")
	inpReq := trustdomain.BatchDeleteFederationRelationshipRequest(inp) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	log.Printf("DeleteFederationRelationship: Connecting to SPIRE server at %s", s.SpireServerAddr)
	var conn *grpc.ClientConn
	conn, err := grpc.NewClient(s.SpireServerAddr, grpc.WithTransportCredentials(insecure.NewCredentials()))
	if err != nil {
		log.Printf("DeleteFederationRelationship: Failed to connect to SPIRE server: %v", err)
		return nil, err
	}
	defer func() {
		if err := conn.Close(); err != nil {
			log.Printf("DeleteFederationRelationship: Failed to close gRPC connection: %v", err)
		} else {
			log.Println("DeleteFederationRelationship: gRPC connection closed")
		}
	}()
	client := trustdomain.NewTrustDomainClient(conn)

	log.Println("DeleteFederationRelationship: Sending BatchDeleteFederationRelationship request")
	bundle, err := client.BatchDeleteFederationRelationship(context.Background(), &inpReq)
	if err != nil {
		log.Printf("DeleteFederationRelationship: Request failed: %v", err)
		return nil, err
	}
	log.Println("DeleteFederationRelationship: Federation relationship deleted successfully")
	return (*DeleteFederationRelationshipResponse)(bundle), nil
}
