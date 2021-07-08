package db

import (
	"github.com/lumjjb/tornjak/tornjak-backend/pkg/agent/types"
)

type AgentDB interface {
	// AGENT - SELECTOR/PLUGIN interface
	CreateAgentEntry(sinfo types.AgentInfo) error
	GetAgents() (types.AgentInfoList, error)
	GetAgentPluginInfo(name string) (types.AgentInfo, error)

	// CLUSTER interface
	GetClusters() (types.ClusterInfoList, error)
	CreateClusterEntry(cinfo types.ClusterInfo) error
	EditClusterEntry(cinfo types.ClusterInfo) error
	DeleteClusterEntry(name string) error

	// AGENT - CLUSTER Get interface (for testing)e
	GetAgentClusterName(spiffeid string) (string, error)
	GetClusterAgents(name string) ([]string, error)
}
