package db

import (
	"github.com/lumjjb/tornjak/manager/types"
)

type ManagerDB interface {
	CreateServerEntry(sinfo types.ServerInfo) error
	GetServers() (types.ServerInfoList, error)
	GetServer(name string) (types.ServerInfo, error)
}
