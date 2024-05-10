package authorization

import (
	"net/http"

	"github.com/spiffe/tornjak/pkg/agent/authentication/user"
)

type Authorizer interface {
	// Authorize Request
	AuthorizeRequest(r *http.Request, u *user.UserInfo) error
}