package db

import (
	"github.com/lumjjb/tornjak/tornjak-backend/pkg/agent/types"
)

type AgentDB interface {
	CreateAgentEntry(sinfo types.AgentInfo) error
	GetAgents() (types.AgentInfoList, error)
	GetAgentPluginInfo(name string) (types.AgentInfo, error)
}
