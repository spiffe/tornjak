package managerapi

import (
	managertypes "github.com/spiffe/tornjak/pkg/manager/types"
)

// API request/response types
type ListServersRequest struct{}
type ListServersResponse managertypes.ServerInfoList
type RegisterServerRequest managertypes.ServerInfo
