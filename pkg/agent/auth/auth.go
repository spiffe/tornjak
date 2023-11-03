package auth

import (
	"net/http"
)

type Auth interface {
	// Verify takes request and returns nil if allowed, err otherwise
	Verify(r *http.Request) error
}
