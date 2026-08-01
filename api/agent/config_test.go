package api

import (
	"path/filepath"
	"strings"
	"testing"

	"github.com/hashicorp/hcl"
)

// parseTestConfig decodes a Tornjak HCL config string the same way
// cmd/agent/main.go's parseTornjakConfig does, so tests exercise the same
// Plugins (*ast.Node) shape Configure() sees in production.
func parseTestConfig(t *testing.T, hclStr string) *TornjakConfig {
	t.Helper()
	c := &TornjakConfig{}
	if err := hcl.Decode(c, hclStr); err != nil {
		t.Fatalf("ERROR: failed to decode test HCL config: %v", err)
	}
	return c
}

// TestConfigure_DataStoreFailure ensures a DataStore failure surfaces as a
// single "failed to configure DataStore plugin" wrap around the
// constructor's own specific error (driver/filename), with no second
// generic wrap duplicating it.
func TestConfigure_DataStoreFailure(t *testing.T) {
	config := parseTestConfig(t, `
server {
  spire_socket_path = "unix:///tmp/spire-server/private/api.sock"
}
plugins {
  DataStore "sql" {
    plugin_data {
      drivername = "sqlite3"
      filename = "/nonexistent-dir-xyz/db.sqlite3"
    }
  }
}
`)
	s := &Server{TornjakConfig: config}
	err := s.Configure()
	if err == nil {
		t.Fatal("ERROR: expected Configure to fail for an unwritable DB path, got nil error")
	}
	msg := err.Error()
	if !strings.Contains(msg, "failed to configure DataStore plugin:") {
		t.Fatalf("ERROR: expected shared wrap %q in message, got %q", "failed to configure DataStore plugin:", msg)
	}
	if !strings.Contains(msg, "no such file or directory") {
		t.Fatalf("ERROR: expected constructor's specific detail preserved in message, got %q", msg)
	}
	if strings.Contains(msg, "Cannot configure datastore plugin") {
		t.Fatalf("ERROR: old redundant wrap text should no longer appear, got %q", msg)
	}
}

// TestConfigure_AuthenticatorFailure ensures an Authenticator failure (here,
// OIDC discovery against an unreachable issuer) surfaces as a single shared
// wrap around keycloak.go's own error, without the old
// "Couldn't configure Authenticator" duplicate layer in between.
func TestConfigure_AuthenticatorFailure(t *testing.T) {
	config := parseTestConfig(t, `
server {
  spire_socket_path = "unix:///tmp/spire-server/private/api.sock"
}
plugins {
  Authenticator "Keycloak" {
    plugin_data {
      issuer = "http://127.0.0.1:1/realms/test"
      audience = "tornjak-backend"
    }
  }
}
`)
	s := &Server{TornjakConfig: config}
	err := s.Configure()
	if err == nil {
		t.Fatal("ERROR: expected Configure to fail for an unreachable OIDC issuer, got nil error")
	}
	msg := err.Error()
	if !strings.Contains(msg, "failed to configure Authenticator plugin:") {
		t.Fatalf("ERROR: expected shared wrap %q in message, got %q", "failed to configure Authenticator plugin:", msg)
	}
	if !strings.Contains(msg, "Could not set up OIDC Discovery client with issuer") {
		t.Fatalf("ERROR: expected keycloak.go's specific detail preserved in message, got %q", msg)
	}
	if strings.Contains(msg, "Couldn't configure Authenticator:") {
		t.Fatalf("ERROR: old redundant wrap text should no longer appear, got %q", msg)
	}
}

// TestConfigure_AuthorizerFailure ensures an Authorizer failure (an
// allowed_roles entry referencing a role that was never defined) surfaces
// as a single shared wrap, without the old "Couldn't configure Authorizer"
// duplicate layer.
func TestConfigure_AuthorizerFailure(t *testing.T) {
	config := parseTestConfig(t, `
server {
  spire_socket_path = "unix:///tmp/spire-server/private/api.sock"
}
plugins {
  Authorizer "RBAC" {
    plugin_data {
      name = "Test Policy"
      role "admin" { desc = "admin person" }
      APIv1 "GET /api/v1/spire/serverinfo" { allowed_roles = ["nonexistent"] }
    }
  }
}
`)
	s := &Server{TornjakConfig: config}
	err := s.Configure()
	if err == nil {
		t.Fatal("ERROR: expected Configure to fail for an undefined allowed_roles entry, got nil error")
	}
	msg := err.Error()
	if !strings.Contains(msg, "failed to configure Authorizer plugin:") {
		t.Fatalf("ERROR: expected shared wrap %q in message, got %q", "failed to configure Authorizer plugin:", msg)
	}
	if !strings.Contains(msg, "lists undefined role") {
		t.Fatalf("ERROR: expected rbac.go's specific detail preserved in message, got %q", msg)
	}
	if strings.Contains(msg, "Couldn't configure Authorizer:") {
		t.Fatalf("ERROR: old redundant wrap text should no longer appear, got %q", msg)
	}
}

// TestConfigure_CRDManagerFailure ensures a SPIRECRDManager failure (real
// in-cluster config lookup failing because the test isn't running inside a
// Kubernetes pod) surfaces as a single shared wrap, without the old
// "Could not initialize CRD manager" duplicate layer.
func TestConfigure_CRDManagerFailure(t *testing.T) {
	config := parseTestConfig(t, `
server {
  spire_socket_path = "unix:///tmp/spire-server/private/api.sock"
}
plugins {
  SPIRECRDManager {
    plugin_data {
      classname = "spire-mgmt-spire"
    }
  }
}
`)
	s := &Server{TornjakConfig: config}
	err := s.Configure()
	if err == nil {
		t.Fatal("ERROR: expected Configure to fail outside a Kubernetes cluster, got nil error")
	}
	msg := err.Error()
	if !strings.Contains(msg, "failed to configure SPIRECRDManager plugin:") {
		t.Fatalf("ERROR: expected shared wrap %q in message, got %q", "failed to configure SPIRECRDManager plugin:", msg)
	}
	if !strings.Contains(msg, "in-cluster config") {
		t.Fatalf("ERROR: expected manager.go's specific detail preserved in message, got %q", msg)
	}
	if strings.Contains(msg, "Could not initialize CRD manager:") {
		t.Fatalf("ERROR: old redundant wrap text should no longer appear, got %q", msg)
	}
}

// TestConfigure_Success is the control case: a valid DataStore-only config
// (no Authenticator/Authorizer, which default to no-ops) must still
// configure successfully against a real, writable sqlite file, proving the
// refactor of Configure()'s plugin loop didn't touch the golden path.
func TestConfigure_Success(t *testing.T) {
	dbPath := filepath.Join(t.TempDir(), "tornjak-config-test.sqlite3")
	config := parseTestConfig(t, `
server {
  spire_socket_path = "unix:///tmp/spire-server/private/api.sock"
}
plugins {
  DataStore "sql" {
    plugin_data {
      drivername = "sqlite3"
      filename = "`+dbPath+`"
    }
  }
}
`)
	s := &Server{TornjakConfig: config}
	if err := s.Configure(); err != nil {
		t.Fatalf("ERROR: expected Configure to succeed for a valid config, got %v", err)
	}
	if s.Db == nil {
		t.Fatal("ERROR: expected s.Db to be set after a successful DataStore configuration")
	}
}
