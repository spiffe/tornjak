package authenticator

import (
	"context"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	keyfunc "github.com/MicahParks/keyfunc/v2"
	backoff "github.com/cenkalti/backoff/v4"
	jwt "github.com/golang-jwt/jwt/v5"
	"github.com/pardot/oidc/discovery"
	"github.com/pkg/errors"

	"github.com/spiffe/tornjak/pkg/agent/authentication/user"
)

// oidcDiscoveryMaxElapsedTime bounds how long NewKeycloakAuthenticator will
// keep retrying OIDC discovery before giving up. Long enough to ride out a
// Keycloak container that's still starting (a common race in docker-compose
// and Kubernetes, where startup order isn't guaranteed), short enough that a
// genuinely misconfigured issuer still fails fast.
const oidcDiscoveryMaxElapsedTime = 30 * time.Second

type RealmAccessSubclaim struct {
	Roles []string `json:"roles"`
}

type KeycloakClaim struct {
	RealmAccess RealmAccessSubclaim `json:"realm_access"`
	jwt.RegisteredClaims
}

type KeycloakAuthenticator struct {
	jwks     *keyfunc.JWKS
	jwksURL  string
	audience string
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
func NewKeycloakAuthenticator(httpjwks bool, issuerURL string, audience string) (*KeycloakAuthenticator, error) {
	expBackoff := backoff.NewExponentialBackOff()
	expBackoff.MaxElapsedTime = oidcDiscoveryMaxElapsedTime
	return newKeycloakAuthenticator(httpjwks, issuerURL, audience, expBackoff)
}

// newKeycloakAuthenticator takes an explicit backoff.BackOff so tests can
// exercise the retry behavior without waiting out the real
// oidcDiscoveryMaxElapsedTime window.
func newKeycloakAuthenticator(httpjwks bool, issuerURL string, audience string, oidcBackoff backoff.BackOff) (*KeycloakAuthenticator, error) {
	// perform OIDC discovery, retrying with backoff since the IAM server may
	// still be starting up
	var oidcClient *discovery.Client
	err := backoff.Retry(func() error {
		var discoverErr error
		oidcClient, discoverErr = discovery.NewClient(context.Background(), issuerURL)
		return discoverErr
	}, oidcBackoff)
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
		jwks:     jwks,
		audience: audience,
		jwksURL:  jwksURL,
	}, nil
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
	claims := &KeycloakClaim{}
	parserOptions := jwt.WithAudience(a.audience)
	jwt_token, err := jwt.ParseWithClaims(token, claims, a.jwks.Keyfunc, parserOptions)
	if err != nil {
		return wrapAuthenticationError(errors.Errorf("Error parsing token :%s", err.Error()))
	}

	// check token validity
	if !jwt_token.Valid {
		return wrapAuthenticationError(errors.New("Token invalid"))
	}

	return &user.UserInfo{
		Roles: claims.RealmAccess.Roles,
	}
}
