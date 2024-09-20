package authorization

import (
	"net/http"

	"github.com/spiffe/tornjak/pkg/agent/authentication/user"
)

type NullAuthorizer struct{}

func NewNullAuthorizer() *NullAuthorizer {
	return &NullAuthorizer{}
}
func (a *NullAuthorizer) AuthorizeRequest(r *http.Request, u *user.UserInfo) error {
	return nil
}
