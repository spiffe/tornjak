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

func isGoodRequest(r *http.Request, claims *KeycloakClaim) bool {
	//claims := jwt_token.Claims.(jwt.MapClaims)
	//realm := claims["realm_access"].(map[string]interface{})
	//roles := realm["roles"].([]string)
	return len(claims.RealmAccess.Roles) > 0
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
