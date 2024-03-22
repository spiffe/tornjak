package auth

import "net/http"

type NullVerifier struct{}

func NewNullVerifier() *NullVerifier {
	return &NullVerifier{}
}

func (v *NullVerifier) Verify(r *http.Request) error {
	return nil
}
