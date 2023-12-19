package auth

import (
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"
	//"encoding/json"

	"github.com/MicahParks/keyfunc"
	"github.com/golang-jwt/jwt/v4"
	"github.com/pkg/errors"
)

type KeycloakVerifier struct {
	jwks            *keyfunc.JWKS
	redirect        string
	api_permissions map[string][]string
	role_mappings   map[string][]string
}

func getAuthLogic() (map[string][]string, map[string][]string) {
	// api call matches to list of strings, representing disjunction of requirements
	api_permissions := map[string][]string{
		// no auth token needed
		"/": []string{},

		// viewer
		"/api/healthcheck":            []string{"admin", "viewer"},
		"/api/debugserver":            []string{"admin", "viewer"},
		"/api/agent/list":             []string{"admin", "viewer"},
		"/api/entry/list":             []string{"admin", "viewer"},
		"/api/tornjak/serverinfo":     []string{"admin", "viewer"},
		"/api/tornjak/selectors/list": []string{"admin", "viewer"},
		"/api/tornjak/agents/list":    []string{"admin", "viewer"},
		"/api/tornjak/clusters/list":  []string{"admin", "viewer"},
		// admin
		"/api/agent/ban":                  []string{"admin"},
		"/api/agent/delete":               []string{"admin"},
		"/api/agent/createjointoken":      []string{"admin"},
		"/api/entry/create":               []string{"admin"},
		"/api/entry/delete":               []string{"admin"},
		"/api/tornjak/selectors/register": []string{"admin"},
		"/api/tornjak/clusters/create":    []string{"admin"},
		"/api/tornjak/clusters/edit":      []string{"admin"},
		"/api/tornjak/clusters/delete":    []string{"admin"},
	}
	role_mappings := map[string][]string{
		"tornjak-viewer-realm-role": []string{"viewer"},
		"tornjak-admin-realm-role":  []string{"admin"},
	}
	return api_permissions, role_mappings
}

// newKeycloakVerifier (https bool, jwks string, redirect string)
//   get keyfunc based on https

func getKeyFunc(httpjwks bool, jwksInfo string) (*keyfunc.JWKS, error) {
	if httpjwks {
		opts := keyfunc.Options{ // TODO add options to config file
			RefreshErrorHandler: func(err error) {
				fmt.Fprintf(os.Stdout, "error with jwt.Keyfunc: %v", err)
			},
			RefreshInterval:   time.Hour,
			RefreshRateLimit:  time.Minute * 5,
			RefreshTimeout:    time.Second * 10,
			RefreshUnknownKID: true,
		}
		jwks, err := keyfunc.Get(jwksInfo, opts)
		if err != nil {
			return nil, errors.Errorf("Could not create Keyfunc for url %s: %v", jwksInfo, err)
		}
		return jwks, nil
	} else {
		jwks, err := keyfunc.NewJSON([]byte(jwksInfo))
		if err != nil {
			return nil, errors.Errorf("Could not create Keyfunc for json %s: %v", jwksInfo, err)
		}
		return jwks, nil
	}
}

func NewKeycloakVerifier(httpjwks bool, jwksURL string, redirectURL string) (*KeycloakVerifier, error) {
	jwks, err := getKeyFunc(httpjwks, jwksURL)
	if err != nil {
		return nil, err
	}
	api_permissions, role_mappings := getAuthLogic()
	return &KeycloakVerifier{
		jwks:            jwks,
		redirect:        redirectURL,
		api_permissions: api_permissions,
		role_mappings:   role_mappings,
	}, nil
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

func (v *KeycloakVerifier) getPermissions(jwt_roles []string) map[string]bool {
	permissions := make(map[string]bool)

	for _, r := range jwt_roles {
		for _, m := range v.role_mappings[r] {
			permissions[m] = true
		}
	}

	return permissions
}

func (v *KeycloakVerifier) requestPermissible(r *http.Request, permissions map[string]bool) bool {
	requires := v.api_permissions[r.URL.Path]
	for _, req := range requires {
		if _, ok := permissions[req]; ok {
			return true
		}
	}
	return false

}

func (v *KeycloakVerifier) isGoodRequest(r *http.Request, claims *KeycloakClaim) bool {
	roles := claims.RealmAccess.Roles

	permissions := v.getPermissions(roles)
	return v.requestPermissible(r, permissions)
}

func (v *KeycloakVerifier) needsAuthToken(r *http.Request) bool {
	requires := v.api_permissions[r.URL.Path]
	return len(requires) > 0
}

func (v *KeycloakVerifier) Verify(r *http.Request) error {
	// first check if is request does not need auth in our default policy
	needs_auth := v.needsAuthToken(r)
	if !needs_auth {
		return nil
	}

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
