package api

import (
	"errors"

	"github.com/google/uuid"
	tornjakTypes "github.com/spiffe/tornjak/pkg/agent/types"
)

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

// DefineCluster registers cluster to local DB
// DefineCluster registers a cluster to the local DB
func (s *Server) DefineCluster(inp RegisterClusterRequest) error {
	cinfo := tornjakTypes.ClusterInfo(inp.ClusterInstance)

	// Validation for mandatory fields
	if len(cinfo.Name) == 0 {
		return errors.New("cluster definition missing mandatory field - Name")
	} else if len(cinfo.PlatformType) == 0 {
		return errors.New("cluster definition missing mandatory field - PlatformType")
	} else if len(cinfo.EditedName) > 0 {
		return errors.New("cluster definition attempts renaming on create cluster - EditedName")
	}

	// Generate UID for the cluster
	cinfo.UID = uuid.New().String()

	return s.Db.CreateClusterEntry(cinfo)
}

// EditCluster registers cluster to local DB
// EditCluster registers updates to a cluster in the local DB
func (s *Server) EditCluster(inp EditClusterRequest) error {
	cinfo := tornjakTypes.ClusterInfo(inp.ClusterInstance)

	// Validation for mandatory fields
	if len(cinfo.Name) == 0 {
		return errors.New("cluster definition missing mandatory field - Name")
	} else if len(cinfo.PlatformType) == 0 {
		return errors.New("cluster definition missing mandatory field - PlatformType")
	} else if len(cinfo.EditedName) == 0 {
		return errors.New("cluster definition missing mandatory field - EditedName")
	}

	// Retrieve existing cluster by UID to ensure it exists
	existingCluster, err := s.Db.GetClusterByUID(cinfo.UID)
	if err != nil {
		return errors.New("cluster not found in database")
	}

	// Update the cluster fields
	existingCluster.Name = cinfo.Name
	existingCluster.PlatformType = cinfo.PlatformType
	existingCluster.ManagedBy = cinfo.ManagedBy
	existingCluster.DomainName = cinfo.DomainName
	existingCluster.AgentsList = cinfo.AgentsList

	return s.Db.EditClusterEntry(existingCluster)
}

// DeleteCluster deletes cluster with name cinfo.Name and assignment to agents
func (s *Server) DeleteCluster(inp DeleteClusterRequest) error {
	cinfo := tornjakTypes.ClusterInfo(inp.ClusterInstance)
	if len(cinfo.Name) == 0 {
		return errors.New("input missing mandatory field - Name")
	}
	return s.Db.DeleteClusterEntry(cinfo.Name)
}
