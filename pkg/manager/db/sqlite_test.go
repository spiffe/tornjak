package db

import (
	"os"
	"testing"

	"github.com/spiffe/tornjak/pkg/manager/types"
)

func cleanup() {
	os.Remove("./local-test-db")
}

func TestServerCreate(t *testing.T) {
	defer cleanup()
	db, err := NewLocalSqliteDB("./local-test-db")
	if err != nil {
		t.Fatal(err)
	}

	sList, err := db.GetServers()
	if err != nil {
		t.Fatal(err)
	}
	if len(sList.Servers) > 0 {
		t.Fatal("Server list should initially be empty")
	}

	sinfo := types.ServerInfo{
		Name:    "my-server",
		Address: "http://localhost:10000",
	}

	err = db.CreateServerEntry(types.ServerInfo{
		Name:    "my-server",
		Address: "http://localhost:10000",
	})
	if err != nil {
		t.Fatal(err)
	}

	sList, err = db.GetServers()
	if err != nil {
		t.Fatal(err)
	}
	if len(sList.Servers) != 1 || sList.Servers[0].Name != sinfo.Name {
		t.Fatal("Server list should initially be empty")
	}
}
