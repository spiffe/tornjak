package auth

import (
	"os"
	"fmt"
	"strings"
	"net/http"
	"time"

	"github.com/pkg/errors"
	"github.com/golang-jwt/jwt/v4"
	"github.com/MicahParks/keyfunc"
)

type KeycloakVerifier struct {
	jwks *keyfunc.JWKS
	redirect string
	api_permissions map[string][]string
}

func getApiPermissions() map[string][]string {
	// api call matches to list of strings, representing disjunction of requirements
	api_permissions := map[string][]string {
		// viewer
		"/api/agent/list": []string{"admin", "viewer"},
		"/api/entry/list": []string{"admin", "viewer"},
		"/api/tornjak/serverinfo": []string{"admin", "viewer"},
		"/api/tornjak/selectors/list": []string{"admin", "viewer"},
		"/api/tornjak/agents/list": []string{"admin", "viewer"},
		"/api/tornjak/clusters/list": []string{"admin", "viewer"},
		// admin
		"/api/agent/ban": []string{"admin"},
		"/api/agent/delete": []string{"admin"},
		"/api/agent/createjointoken": []string{"admin"},
		"/api/entry/create": []string{"admin"},
		"/api/entry/delete": []string{"admin"},
		"/api/tornjak/selectors/register": []string{"admin"},
		"/api/tornjak/clusters/create": []string{"admin"},
		"/api/tornjak/clusters/edit": []string{"admin"},
		"/api/tornjak/clusters/delete": []string{"admin"},

	}
	return api_permissions
}

func NewKeycloakVerifier(jwksURL string, redirectURL string) (*KeycloakVerifier) {
	opts := keyfunc.Options{ // TODO add options to config file
		RefreshErrorHandler: func(err error) {
			fmt.Fprintf(os.Stdout, "error with jwt.Keyfunc: %v", err)
		},
		RefreshInterval:   time.Hour,
		RefreshRateLimit:  time.Minute * 5,
		RefreshTimeout:    time.Second * 10,
		RefreshUnknownKID: true,
	}
	jwks, err := keyfunc.Get(jwksURL, opts)
	if err != nil {
		return nil
	}
	return &KeycloakVerifier {
		jwks:            jwks,
		redirect:        redirectURL,
		api_permissions: getApiPermissions(),
	}
}

func get_token(r *http.Request, redirectURL string) (string, error) {
	// Authorization paramter from HTTP header
	auth_header := r.Header.Get("Authorization")
	if auth_header == "" {
		return "", errors.Errorf("Authorization header missing. Please obtain access token here: %s", redirectURL)
	}

	// get bearer token
	auth_fields := strings.Fields(auth_header)
	if len(auth_fields) != 2 || auth_fields[0] != "Bearer" {
		return "", errors.Errorf("Expected bearer token, got %s", auth_header)
	} else {
		return auth_fields[1], nil
	}

}

func getPermissions(roles []string) map[string]bool {
	permissions := make(map[string]bool)
	permissions["admin"] = false
	permissions["viewer"] = false

	for _, r := range roles {
		permissions["admin"] = permissions["admin"] || r == "tornjak-admin-realm-role"
		permissions["viewer"] = permissions["viewer"] || r == "tornjak-viewer-realm-role"
		permissions["viewer"] = permissions["viewer"] || r == "tornjak-admin-realm-role"
	}

	return permissions
}



func (v *KeycloakVerifier) requestPermissible(r *http.Request, permissions map[string]bool) bool {
	requires := v.api_permissions[r.URL.Path]
	for _, req := range requires {
		if permissions[req] {
			return true
		}
	}
	return false
	
}

func (v *KeycloakVerifier) isGoodRequest(r *http.Request, claims *KeycloakClaim) bool {
	roles := claims.RealmAccess.Roles
	
	permissions := getPermissions(roles)
	return v.requestPermissible(r, permissions)
}

func (v *KeycloakVerifier) Verify(r *http.Request) error {
	token, err := get_token(r, v.redirect)
	if err != nil {
		return err
	}
	
	// parse token
	claims := &KeycloakClaim{}
	jwt_token, err := jwt.ParseWithClaims(token, claims, v.jwks.Keyfunc)
	if err != nil {
		return errors.Errorf("Error parsing token: %s", err.Error())
	}

	// check token validity
	if !jwt_token.Valid {
		return errors.New("Token invalid")
	}

	// check roles
	if !v.isGoodRequest(r, claims) {
		return errors.New("Unauthorized request")
	}
	
	return nil
}
