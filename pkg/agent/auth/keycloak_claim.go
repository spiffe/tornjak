package auth

import (
	jwt "github.com/golang-jwt/jwt/v5"
)

type RealmAccessSubclaim struct {
	Roles []string `json:"roles"`
}

type KeycloakClaim struct {
	RealmAccess RealmAccessSubclaim `json:"realm_access"`
	jwt.RegisteredClaims
}
