package authenticator

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	keyfunc "github.com/MicahParks/keyfunc/v2"
	jwt "github.com/golang-jwt/jwt/v5"
	"github.com/pardot/oidc/discovery"
	"github.com/pkg/errors"

	"github.com/spiffe/tornjak/pkg/agent/authentication/user"
)

// defaultRoleClaim is the claim path used when no roleclaim is configured,
// preserving the pre-existing hardcoded behavior.
const defaultRoleClaim = "realm_access.roles"

type KeycloakAuthenticator struct {
	jwks      *keyfunc.JWKS
	jwksURL   string
	audience  string
	roleClaim string
}

func getJWKeyFunc(httpjwks bool, jwksInfo string) (*keyfunc.JWKS, error) {
	if httpjwks {
		opts := keyfunc.Options{ // TODO add options to config file
			RefreshErrorHandler: func(err error) {
				_, _ = fmt.Fprintf(os.Stdout, "error with jwt.Keyfunc: %v", err)
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

// newKeycloakAuthenticator (https bool, jwks string, redirect string)
//
//	get keyfunc based on https
func NewKeycloakAuthenticator(httpjwks bool, issuerURL string, audience string, roleClaim string) (*KeycloakAuthenticator, error) {
	// perform OIDC discovery
	oidcClient, err := discovery.NewClient(context.Background(), issuerURL)
	if err != nil {
		return nil, errors.Errorf("Could not set up OIDC Discovery client with issuer = '%s': %v", issuerURL, err)
	}
	oidcClientMetadata := oidcClient.Metadata()
	jwksURL := oidcClientMetadata.JWKSURI

	// watch JWKS
	jwks, err := getJWKeyFunc(httpjwks, jwksURL)
	if err != nil {
		return nil, err
	}

	return &KeycloakAuthenticator{
		jwks:      jwks,
		audience:  audience,
		jwksURL:   jwksURL,
		roleClaim: resolveRoleClaim(roleClaim),
	}, nil
}

// resolveRoleClaim falls back to defaultRoleClaim when no roleclaim is
// configured, so existing deployments keep working unmodified.
func resolveRoleClaim(configured string) string {
	if configured == "" {
		return defaultRoleClaim
	}
	return configured
}

// extractRoles walks a dot-separated claim path (e.g. "realm_access.roles" or
// "resource_access.tornjak-backend.roles") through a parsed JWT claim set and
// returns the role list found there. Returns nil if the path doesn't resolve
// to a list of strings (missing claim, wrong shape, etc.).
func extractRoles(claims jwt.MapClaims, path string) []string {
	fields := strings.Split(path, ".")
	current := map[string]interface{}(claims)

	for i, field := range fields {
		value, ok := current[field]
		if !ok {
			return nil
		}
		if i == len(fields)-1 {
			list, ok := value.([]interface{})
			if !ok {
				return nil
			}
			roles := make([]string, 0, len(list))
			for _, item := range list {
				if str, ok := item.(string); ok {
					roles = append(roles, str)
				}
			}
			return roles
		}
		next, ok := value.(map[string]interface{})
		if !ok {
			return nil
		}
		current = next
	}
	return nil
}

func getToken(r *http.Request, redirectURL string) (string, error) {
	// Authorization parameter from HTTP header
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

func wrapAuthenticationError(err error) *user.UserInfo {
	return &user.UserInfo{
		AuthenticationError: err,
	}
}

func (a *KeycloakAuthenticator) AuthenticateRequest(r *http.Request) *user.UserInfo {
	token, err := getToken(r, a.jwksURL)
	if err != nil {
		return wrapAuthenticationError(err)
	}

	// parse token
	parserOptions := jwt.WithAudience(a.audience)
	jwt_token, err := jwt.Parse(token, a.jwks.Keyfunc, parserOptions)
	if err != nil {
		return wrapAuthenticationError(errors.Errorf("Error parsing token :%s", err.Error()))
	}

	// check token validity
	if !jwt_token.Valid {
		return wrapAuthenticationError(errors.New("Token invalid"))
	}

	claims, ok := jwt_token.Claims.(jwt.MapClaims)
	if !ok {
		return wrapAuthenticationError(errors.New("Could not parse token claims"))
	}

	return &user.UserInfo{
		Roles: extractRoles(claims, a.roleClaim),
	}
}
