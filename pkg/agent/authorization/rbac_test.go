package authorization

import (
	"testing"
	"strings"
	//"github.com/spiffe/tornjak/pkg/agent/authentication/user"
)

func TestNewRBACAuthorizer(t *testing.T) {
	// INIT failures
	// fail when no roles defined
	_, err := NewRBACAuthorizer("", nil, nil)
	if err == nil {
		t.Fatal("ERROR: successfully initialized RBAC without roles")
	}

	// constants for 4 parameters
	policyName := "testPolicy"
	roleList_1 := map[string]string{"admin": "admin"}
	apiV1Mapping_1 := map[string]map[string][]string{"/api/v1/spire/serverinfo": {"GET": {"admin", "viewer"}}}

	roleList_2 := map[string]string{"admin": "admin", "viewer": "viewer"}
	apiV1Mapping_2 := apiV1Mapping_1

	roleList_3 := map[string]string{"admin": "admin", "user": "user"}
	apiV1Mapping_3 := apiV1Mapping_1

	roleList_4 := roleList_2
	apiV1Mapping_4 := map[string]map[string][]string{"/api/v1/unknown/serverinfo": {"GET": {"admin", "viewer"}}}

	roleList_5 := roleList_2
	apiV1Mapping_5 := map[string]map[string][]string{"/api/v1/spire/serverinfo": {"POST": {"admin", "viewer"}}}

	// fail when roles in apiMapping not in roleList
	_, err = NewRBACAuthorizer(policyName, roleList_1, apiV1Mapping_1)
	expectedErr := "Could not parse policy testPolicy: invalid mapping: API V1  /api/v1/spire/serverinfo lists undefined role viewer"
	if err == nil {
		t.Fatal("ERROR: successfully initialized RBAC without roles")
	} else if err.Error() != expectedErr {
		t.Fatalf("ERROR: expected %s, got %s", expectedErr, err.Error())
	}

	// pass when roles in apiMapping in roleList
	_, err = NewRBACAuthorizer(policyName, roleList_2, apiV1Mapping_2)
	if err != nil {
		t.Fatalf("ERROR: failed to initialize RBAC: %s", err.Error())
	}

	// fail when typo in apiMapping
	_, err = NewRBACAuthorizer(policyName, roleList_3, apiV1Mapping_3)
	if err == nil {
        t.Fatalf("expected an error but got nil")
    }
    expectedPhrase := "undefined role viewer"
    if !strings.Contains(err.Error(), expectedPhrase) {
        t.Fatalf("expected error to contain %q but got %q", expectedPhrase, err.Error())
    }

	// fail when apiV1Mapping has path not in staticAPIV1List
	_, err = NewRBACAuthorizer(policyName, roleList_4, apiV1Mapping_4)
    if err == nil {
        t.Fatal("ERROR: successfully initialized RBAC without roles")
    }
    expectedPhrase = "/api/v1/unknown/serverinfo does not exist"
    if !strings.Contains(err.Error(), expectedPhrase) {
        t.Fatalf("expected error to contain %q but got %q", expectedPhrase, err.Error())
    }

	// fail when apiV1Mapping has method not in staticAPIV1List
	_, err = NewRBACAuthorizer(policyName, roleList_5, apiV1Mapping_5)
	if err == nil {
        t.Fatal("ERROR: successfully initialized RBAC without roles")
    }
    expectedPhrase = "does not exist with method POST"
    if !strings.Contains(err.Error(), expectedPhrase) {
        t.Fatalf("expected error to contain %q but got %q", expectedPhrase, err.Error())
    }

}
// func TestAuthorizeRequest(t *testing.T) {
