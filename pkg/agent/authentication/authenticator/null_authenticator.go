package authenticator

import (
	"net/http"

	"github.com/spiffe/tornjak/pkg/agent/authentication/user"
)

type NullAuthenticator struct{}

func NewNullAuthenticator() *NullAuthenticator {
	return &NullAuthenticator{}
}
func (a *NullAuthenticator) AuthenticateRequest(r *http.Request) (*user.UserInfo, error) {
	return nil, nil
}