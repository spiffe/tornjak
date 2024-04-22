package auth

import "net/http"

type NullAuthenticator struct{}

func NewNullAuthenticator() *NullAuthenticator {
	return &NullAuthenticator{}
}
func (a *NullAuthenticator) AuthenticateRequest(r *http.Request) (*UserInfo, error) {
	return nil, nil
}

type NullAuthorizer struct{}

func NewNullAuthorizer() *NullAuthorizer {
	return &NullAuthorizer{}
}
func (a *NullAuthorizer) AuthorizeRequest(r *http.Request, u *UserInfo) (error) {
	return nil
}