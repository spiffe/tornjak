package db

import (
	"github.com/lumjjb/tornjak/manager/types"
)

type ManagerDB interface {
	CreateServerEntry(sinfo types.ServerInfo) error
}
