package auth

import (
	"errors"
	"log"
	"fmt"
	"strings"
	"net/http"
	"time"

	"github.com/golang-jwt/jwt/v4"
	"github.com/MicahParks/keyfunc"
)

type KeycloakVerifier struct {
	jwks *keyfunc.JWKS
}

func NewKeycloakVerifier(jwksURL string) (*KeycloakVerifier) {
	opts := keyfunc.Options{
		RefreshErrorHandler: func(err error) {
			log.Printf("error with jwt.Keyfunc: %s", err.Error)
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
		jwks: jwks,
	} // TODO cleanup?
}

func get_token(r *http.Request) (string, error) {
	// Authorization paramter from HTTP header
	auth_header := r.Header.Get("Authorization")
	if auth_header == "" {
		return "", errors.New("Authorization header missing")
	}

	// get bearer token
	token := strings.Replace(auth_header, "Bearer ", "", 1)
	if token == "" {
		return "", errors.New("Bearer token missing")
	}
	return token, nil
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

func requestPermissible(r *http.Request, permissions map[string]bool) bool {
	// TODO make this evaluate once
	// api call matches to list of strings, representing disjunction of requirements
	api_permissions := make(map[string][]string)
	api_permissions["/api/agent/list"] = []string{"admin", "viewer"}
	api_permissions["/api/entry/list"] = []string{"admin", "viewer"}
	api_permissions["/api/tornjak/serverinfo"] = []string{"admin", "viewer"}
	api_permissions["/api/tornjak/selectors/list"] = []string{"admin", "viewer"}
	api_permissions["/api/tornjak/agents/list"] = []string{"admin", "viewer"}
	api_permissions["/api/tornjak/clusters/list"] = []string{"admin", "viewer"}
	api_permissions["/api/agent/ban"] = []string{"admin"}
	api_permissions["/api/agent/delete"] = []string{"admin"}
	api_permissions["/api/agent/createjointoken"] = []string{"admin"}
	api_permissions["/api/entry/create"] = []string{"admin"}
	api_permissions["/api/entry/delete"] = []string{"admin"}
	api_permissions["/api/tornjak/selectors/register"] = []string{"admin"}
	api_permissions["/api/tornjak/clusters/create"] = []string{"admin"}
	api_permissions["/api/tornjak/clusters/edit"] = []string{"admin"}
	api_permissions["/api/tornjak/clusters/delete"] = []string{"admin"}

	requires := api_permissions[r.URL.Path]
	for _, req := range requires {
		if permissions[req] {
			return true
		}
	}
	return false
	
}

func isGoodRequest(r *http.Request, claims *KeycloakClaim) bool {
	roles := claims.RealmAccess.Roles
	
	permissions := getPermissions(roles)
	return requestPermissible(r, permissions)
}

func (v *KeycloakVerifier) Verify(r *http.Request) error {
	token, err := get_token(r)
	if err != nil {
		return err
	}
	
	// parse token
	claims := KeycloakClaim{}
	jwt_token, err := jwt.ParseWithClaims(token, &claims, v.jwks.Keyfunc)
	if err != nil {
		return errors.New(fmt.Sprintf("Error parsing token: %s", err.Error()))
	}

	// check token validity
	if !jwt_token.Valid {
		return errors.New("Token invalid")
	}

	// check roles
	if !isGoodRequest(r, &claims) {
		return errors.New("Unauthorized request")
	}
	
	return nil
}
