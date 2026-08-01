package authenticator

import (
	"reflect"
	"testing"

	jwt "github.com/golang-jwt/jwt/v5"
)

// sampleClaims mirrors the shape of a real Keycloak access token: realm
// roles under realm_access.roles, and client roles under
// resource_access.<clientId>.roles.
func sampleClaims() jwt.MapClaims {
	return jwt.MapClaims{
		"preferred_username": "admin",
		"realm_access": map[string]interface{}{
			"roles": []interface{}{"tornjak-admin-realm-role", "offline_access"},
		},
		"resource_access": map[string]interface{}{
			"account": map[string]interface{}{
				"roles": []interface{}{"manage-account", "view-profile"},
			},
		},
	}
}

// TestExtractRoles_DefaultClaim is the control case: the default claim path
// (realm_access.roles) must keep extracting roles exactly as the old
// hardcoded implementation did.
func TestExtractRoles_DefaultClaim(t *testing.T) {
	roles := extractRoles(sampleClaims(), defaultRoleClaim)
	expected := []string{"tornjak-admin-realm-role", "offline_access"}
	if !reflect.DeepEqual(roles, expected) {
		t.Fatalf("ERROR: expected %v, got %v", expected, roles)
	}
}

// TestExtractRoles_ArbitraryClaim covers the actual feature request: an
// arbitrary, nested claim path should now be readable, not just
// realm_access.roles.
func TestExtractRoles_ArbitraryClaim(t *testing.T) {
	roles := extractRoles(sampleClaims(), "resource_access.account.roles")
	expected := []string{"manage-account", "view-profile"}
	if !reflect.DeepEqual(roles, expected) {
		t.Fatalf("ERROR: expected %v, got %v", expected, roles)
	}
}

// TestExtractRoles_SingleLevelClaim covers a flat (non-nested) claim path.
func TestExtractRoles_SingleLevelClaim(t *testing.T) {
	claims := jwt.MapClaims{
		"roles": []interface{}{"viewer"},
	}
	roles := extractRoles(claims, "roles")
	expected := []string{"viewer"}
	if !reflect.DeepEqual(roles, expected) {
		t.Fatalf("ERROR: expected %v, got %v", expected, roles)
	}
}

// TestExtractRoles_MissingClaim ensures an unconfigured/missing path fails
// closed (no roles) instead of panicking.
func TestExtractRoles_MissingClaim(t *testing.T) {
	roles := extractRoles(sampleClaims(), "resource_access.nonexistent-client.roles")
	if roles != nil {
		t.Fatalf("ERROR: expected nil for missing claim, got %v", roles)
	}
}

// TestExtractRoles_WrongShape ensures a path that resolves to something
// other than a list of strings fails closed instead of panicking.
func TestExtractRoles_WrongShape(t *testing.T) {
	roles := extractRoles(sampleClaims(), "preferred_username")
	if roles != nil {
		t.Fatalf("ERROR: expected nil for non-list claim, got %v", roles)
	}

	roles = extractRoles(sampleClaims(), "realm_access")
	if roles != nil {
		t.Fatalf("ERROR: expected nil when path resolves to an object, got %v", roles)
	}
}

// TestResolveRoleClaim_Default is the backward-compat contract: an
// unconfigured roleclaim must resolve to realm_access.roles, matching the
// pre-existing hardcoded behavior for every deployment that doesn't set the
// new option.
func TestResolveRoleClaim_Default(t *testing.T) {
	got := resolveRoleClaim("")
	if got != "realm_access.roles" {
		t.Fatalf("ERROR: expected default %q, got %q", "realm_access.roles", got)
	}
}

// TestResolveRoleClaim_Configured ensures an explicitly configured roleclaim
// is used as-is, not overridden by the default.
func TestResolveRoleClaim_Configured(t *testing.T) {
	got := resolveRoleClaim("resource_access.tornjak-backend.roles")
	if got != "resource_access.tornjak-backend.roles" {
		t.Fatalf("ERROR: expected configured value to be preserved, got %q", got)
	}
}
