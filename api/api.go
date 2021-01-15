package api


import (
    grpc "google.golang.org/grpc"
    "context"

    agent "github.com/spiffe/spire/proto/spire/api/server/agent/v1"
)

type ListAgentsRequest agent.ListAgentsRequest
type ListAgentsResponse agent.ListAgentsResponse

func (s *Server) ListAgents(inp ListAgentsRequest) (*ListAgentsResponse, error) {

    inpReq := agent.ListAgentsRequest(inp)
    var conn *grpc.ClientConn
	conn, err := grpc.Dial(s.SpireServerAddr, grpc.WithInsecure())
	if err != nil {
        return nil, err
	}
	defer conn.Close()
    client:= agent.NewAgentClient(conn)

    resp, err := client.ListAgents(context.Background(), &inpReq)
    if err != nil {
        return nil, err
    }

    return (*ListAgentsResponse)(resp), nil
}

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

// types

