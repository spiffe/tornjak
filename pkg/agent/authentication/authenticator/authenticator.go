package authenticator

import (
	"net/http"

	"github.com/spiffe/tornjak/pkg/agent/authentication/user"
)

type Authenticator interface {
	// AuthenticateRequest takes request, verifies certain properties
	// and returns relevant UserInfo to be interpreted by the Authorizer
	// or error upon verification error
	AuthenticateRequest(r *http.Request) *user.UserInfo
}
