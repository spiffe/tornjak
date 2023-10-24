package managerapi

import (
	managertypes "github.com/spiffe/tornjak/pkg/manager/types"

	"github.com/pkg/errors"
	//types "github.com/spiffe/spire/proto/spire/types"
	//agent "github.com/spiffe/spire/proto/spire/api/server/agent/v1"
	//entry "github.com/spiffe/spire/proto/spire/api/server/entry/v1"
)

type ListServersRequest struct{}
type ListServersResponse managertypes.ServerInfoList

func (s *Server) ListServers(inp ListServersRequest) (*ListServersResponse, error) {

	resp, err := s.db.GetServers()
	if err != nil {
		return nil, err
	}
	for i := range resp.Servers {
		resp.Servers[i].Key = []byte{}
		resp.Servers[i].Cert = []byte{}
	}

	return (*ListServersResponse)(&resp), nil
}

type RegisterServerRequest managertypes.ServerInfo

func (s *Server) RegisterServer(inp RegisterServerRequest) error {
	sinfo := managertypes.ServerInfo(inp)
	if len(sinfo.Name) == 0 || len(sinfo.Address) == 0 {
		return errors.New("Server info missing mandatory fields")
	}

	return s.db.CreateServerEntry(sinfo)
}
