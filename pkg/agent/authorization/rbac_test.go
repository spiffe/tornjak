package authorization

import (
	"testing"
	//"github.com/spiffe/tornjak/pkg/agent/authentication/user"
)

func TestNewRBACAuthorizer(t *testing.T) {
	// INIT failures
	// fail when no roles defined
	_, err := NewRBACAuthorizer("", nil, nil, nil)
	if err == nil {
		t.Fatal("ERROR: successfully initialized RBAC without roles")
	}
}
