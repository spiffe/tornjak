package auth

import (
	"github.com/Nerzal/gocloak/v11"
	"net/http"
	"errors"
	"fmt"
	"strings"
	"context"
)

type KeycloakVerifier struct {
	gocloak      gocloak.GoCloak
	clientId     string
	clientSecret string
	realm        string
}

func NewKeycloakVerifier() (*KeycloakVerifier) {
	// SetAuth functions called until gocloak fixes links
	gocloak_client := gocloak.NewClient("http://host.minikube.internal:8080", gocloak.SetAuthAdminRealms("admin/realms"), gocloak.SetAuthRealms("realms"))
	return &KeycloakVerifier {
		gocloak:      gocloak_client,
		clientId:     "tornjak",
		clientSecret: "iFyE0uULf0jz81dEspL5XEimjHMJ9jyn",
		realm:        "tornjak",
	}
}

func (v *KeycloakVerifier) Verify(r *http.Request) error {
	authentication_err := v.authenticate(r)
	if authentication_err != nil {
		return authentication_err
	}
	
	return nil
}

func (v *KeycloakVerifier) authenticate(r *http.Request) error {
	// Authorization paramter from HTTP header
	auth_header := r.Header.Get("Authorization")
	if auth_header == "" {
		return errors.New("Authorization header missing")
	}

	// get bearer token
	token := strings.Replace(auth_header, "Bearer ", "", 1)
	if token == "" {
		return errors.New("Bearer token missing")
	}

	// decode token in Keycloak API
	_, _, err := v.gocloak.DecodeAccessToken(context.Background(), token, v.realm)
	if err != nil {
		return errors.New(fmt.Sprintf("Invalid or malformed token: %s", err.Error()))
	}

	// TODO check expiry
	return nil
}

// TODO perhaps make this separate
func (v *KeycloakVerifier) authorize(r *http.Request) error {
	return nil
}
