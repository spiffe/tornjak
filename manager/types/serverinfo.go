package types

import (
	"net/http"
)

func (s ServerInfo) HttpClient() *http.Client {
	// TODO: in the future, create client with TLS config
	return &http.Client{}
}
