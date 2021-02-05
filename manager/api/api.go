package managerapi


import (
    managertypes "github.com/lumjjb/tornjak/manager/types"
    "github.com/pkg/errors"
	//types "github.com/spiffe/spire/proto/spire/types"
    //agent "github.com/spiffe/spire/proto/spire/api/server/agent/v1"
    //entry "github.com/spiffe/spire/proto/spire/api/server/entry/v1"
)

var tmpString="DUMMY"

type ListServersRequest struct {}
type ListServersResponse managertypes.ServerInfoList

func (s *Server) ListServers (inp ListServersRequest) (*ListServersResponse, error) {

    resp, err := s.db.GetServers()
    if err != nil {
        return nil, err
    }

    return (*ListServersResponse)(&resp), nil
}

type RegisterServerRequest managertypes.ServerInfo

func (s *Server) RegisterServer (inp RegisterServerRequest) error {
    sinfo := managertypes.ServerInfo(inp)
    if len(sinfo.Name) == 0 || len(sinfo.Address) == 0 {
        return errors.New("Server info missing mandatory fields")
    }

    return s.db.CreateServerEntry(sinfo)
}
