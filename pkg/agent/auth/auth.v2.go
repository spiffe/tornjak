package auth

import (
	"net/http"
)

type UserInfo struct {
	Roles []string
}

type Authenticator interface {
	// AuthenticateRequest takes request, verifies certain properties
	// and returns relevant UserInfo to be interpreted by the Authorizer
	// or error upon verification error
	AuthenticateRequest(r *http.Request) (*UserInfo, error)
}

type Authorizer interface {
	// Authorize Request
	AuthorizeRequest(r *http.Request, u *UserInfo) error
}