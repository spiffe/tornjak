package db

import (
	"os"
	"testing"

	"github.com/lumjjb/tornjak/pkg/agent/types"
)

func cleanup() {
	os.Remove("./local-agentstest-db")
}

func TestServerCreate(t *testing.T) {
	defer cleanup()
	db, err := NewLocalSqliteDB("./local-agentstest-db")
	if err != nil {
		t.Fatal(err)
	}

	sList, err := db.GetAgents()
	if err != nil {
		t.Fatal(err)
	}
	if len(sList.Agents) > 0 {
		t.Fatal("Agents list should initially be empty")
	}

	sinfo := types.AgentInfo{
		Spiffeid: "spiffe://example.org/spire/agent/",
		Plugin:   "Docker",
	}

	err = db.CreateAgentEntry(types.AgentInfo{
		Spiffeid: "spiffe://example.org/spire/agent/",
		Plugin:   "Docker",
	})
	if err != nil {
		t.Fatal(err)
	}

	sList, err = db.GetAgents()
	if err != nil {
		t.Fatal(err)
	}
	if len(sList.Agents) != 1 || sList.Agents[0] != sinfo {
		t.Fatal("Agents list should initially be empty")
	}
}
