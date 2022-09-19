package auth

import (
	"github.com/golang-jwt/jwt/v4"
)

type RealmAccessSubclaim struct {
	Roles []string `json:"roles"`
}

type KeycloakClaim struct {
	RealmAccess RealmAccessSubclaim `json:"realm_access"`
	jwt.StandardClaims
}
