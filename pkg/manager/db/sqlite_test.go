package db

import (
	"fmt"
	"os"
	"testing"

	"github.com/spiffe/tornjak/pkg/manager/types"
)

func cleanup() {
	_ = os.Remove("./local-test-db")
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

func TestServerDelete(t *testing.T) {
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

	sinfo1 := types.ServerInfo{
		Name:    "my-server-1",
		Address: "http://localhost:10000",
	}

	sinfo2 := types.ServerInfo{
		Name:    "my-server-2",
		Address: "http://localhost:10000",
	}

	err = db.CreateServerEntry(types.ServerInfo{
		Name:    "my-server-1",
		Address: "http://localhost:10000",
	})
	if err != nil {
		t.Fatal(err)
	}

	err = db.CreateServerEntry(types.ServerInfo{
		Name:    "my-server-2",
		Address: "http://localhost:10000",
	})
	if err != nil {
		t.Fatal(err)
	}

	err = db.DeleteServer(fmt.Sprintf("%s-%s", sinfo1.Name, "server-does-not-exist-in-the-database"))
	if err == nil {
		t.Fatal("Deleting a server which does not exist in the database should throw an error")
	}

	err = db.DeleteServer(sinfo1.Name)
	if err != nil {
		t.Fatal(err)
	}

	sList, err = db.GetServers()
	if err != nil {
		t.Fatal(err)
	}

	if len(sList.Servers) > 1 || sList.Servers[0].Name != sinfo2.Name {
		t.Fatal("Deleting server failed")
	}
}
