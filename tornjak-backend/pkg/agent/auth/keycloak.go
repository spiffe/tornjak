package auth

import (
	"github.com/Nerzal/gocloak/v11"
	"net/http"
)

type KeycloakVerifier struct {
	gocloak      gocloak.GoCloak
	clientId     string
	clientSecret string
	realm        string
}

func NewKeycloakVerifier() (*KeycloakVerifier) {
	// SetAuth functions called until gocloak fixes links
	gocloak_client := gocloak.NewClient("http://localhost:8080", gocloak.SetAuthAdminRealms("admin/realms"), gocloak.SetAuthRealms("realms"))
	return &KeycloakVerifier {
		gocloak:      gocloak_client,
		clientId:     "tornjak",
 		clientSecret: "insert",
		realm:        "testrealm",
	}
}

func (verifier *KeycloakVerifier) Verify(r *http.Request) error {
	return nil
}
