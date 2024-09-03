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
	_, err = NewRBACAuthorizer(policyName, roleList_1, nil, apiV1Mapping_1)
	expectedErr := "Could not parse policy testPolicy: invalid mapping: API V1  /api/v1/spire/serverinfo lists undefined role viewer"
	if err == nil {
		t.Fatal("ERROR: successfully initialized RBAC without roles")
	} else if err.Error() != expectedErr {
		t.Fatalf("ERROR: expected %s, got %s", expectedErr, err.Error())
	}

	// pass when roles in apiMapping in roleList
	_, err = NewRBACAuthorizer(policyName, roleList_2, nil, apiV1Mapping_2)
	if err != nil {
		t.Fatalf("ERROR: failed to initialize RBAC: %s", err.Error())
	}

	// fail when typo in apiMapping
	_, err = NewRBACAuthorizer(policyName, roleList_3, nil, apiV1Mapping_3)
	expectedErr = "Could not parse policy testPolicy: invalid mapping: API V1  /api/v1/spire/serverinfo lists undefined role viewer"
	if err == nil {
		t.Fatal("ERROR: successfully initialized RBAC without roles")
	} else if err.Error() != expectedErr {
		t.Fatalf("ERROR: expected %s, got %s", expectedErr, err.Error())
	}

	// fail when apiV1Mapping has path not in staticAPIV1List
	_, err = NewRBACAuthorizer(policyName, roleList_4, nil, apiV1Mapping_4)
	expectedErr = "Could not parse policy testPolicy: invalid mapping: API V1 path /api/v1/unknown/serverinfo does not exist with method GET"
	if err == nil {
		t.Fatal("ERROR: successfully initialized RBAC without roles")
	} else if err.Error() != expectedErr {
		t.Fatalf("ERROR: expected %s, got %s", expectedErr, err.Error())
	}

	// fail when apiV1Mapping has method not in staticAPIV1List
	_, err = NewRBACAuthorizer(policyName, roleList_5, nil, apiV1Mapping_5)
	expectedErr = "Could not parse policy testPolicy: invalid mapping: API V1 path /api/v1/spire/serverinfo does not exist with method POST"
	if err == nil {
		t.Fatal("ERROR: successfully initialized RBAC without roles")
	} else if err.Error() != expectedErr {
		t.Fatalf("ERROR: expected %s, got %s", expectedErr, err.Error())
	}

}
// func TestAuthorizeRequest(t *testing.T) {