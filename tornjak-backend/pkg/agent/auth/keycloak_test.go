package auth

import (
	//"github.com/pkg/errors"
	"bytes"
	"encoding/json"
	"flag"
	"fmt"
	"net/http"
	"testing"
	//"github.com/spiffe/tornjak/tornjak-backend/pkg/agent/types"
)

var jwksURL string

func init() {
	flag.StringVar(&jwksURL, "jwksURL", "", "JWKS Url")
}

// TODO tests for Verify - currently AUTH logic too integrated to make general unit tests

// TestNewKecyloakVerifier checks correctness of functions dealing with Agent Selector table
// Uses functions NewKeycloakVerfier
func TestNewKeycloakVerifier(t *testing.T) {
	// INIT failures
	_, err := NewKeycloakVerifier(true, "", "testredirect")
	if err == nil {
		t.Fatal("ERROR: successfully initialized keyfunc for empty url")
	}
	_, err = NewKeycloakVerifier(true, "invalideurl", "testredirect")
	if err == nil {
		t.Fatal("ERROR: successfully initialized keyfunc for invalid url")
	}

	_, err = NewKeycloakVerifier(false, "", "testredirect")
	if err == nil {
		t.Fatal("ERROR: successfully initialized keyfunc for empty jwks json")
	}
	// INIT success JSON
	sample_json := `{"keys":[{"kty":"RSA","e":"AQAB","use":"sig","kid":"MjhhMDk2N2M2NGEwMzgzYjk2OTI3YzdmMGVhOGYxNjI2OTc5Y2Y2MQ","alg":"RS256","n":"zZU9xSgK77PbtkjJgD2Vmmv6_QNe8B54eyOV0k5K2UwuSnhv9RyRA3aL7gDN-qkANemHw3H_4Tc5SKIMltVIYdWlOMW_2m3gDBOODjc1bE-WXEWX6nQkLAOkoFrGW3bgW8TFxfuwgZVTlb6cYkSyiwc5ueFV2xNqo96Qf7nm5E7KZ2QDTkSlNMdW-jIVHMKjuEsy_gtYMaEYrwk5N7VoiYwePaF3I0_g4G2tIrKTLb8DvHApsN1h-s7jMCQFBrY4vCf3RBlYULr4Nz7u8G2NL_L9vURSCU2V2A8rYRkoZoZwk3a3AyJiqeC4T_1rmb8XdrgeFHB5bzXZ7EI0TObhlw"}]}`
	_, err = NewKeycloakVerifier(false, sample_json, "testredirect")
	if err != nil {
		t.Fatalf("ERROR: could not create keyfunc from json: %v", err)
	}

	if jwksURL != "" {
		_, err = NewKeycloakVerifier(true, jwksURL, "testredirect")
		if err != nil {
			t.Fatalf("ERROR: could not create keyfunc from HTTP: %v", err)
		}
	} else {
		fmt.Printf("WARNING: not testing http jwks")
	}
}

func TestGetToken(t *testing.T) {
	// sample request with token
	request_body, err := json.Marshal(map[string]string{
		"name": "nobody",
	})
	if err != nil {
		t.Fatalf("ERROR: could not create request body")
	}

	// test with no Authorization header
	request, err := http.NewRequest("GET", "some/url", bytes.NewBuffer(request_body))
	if err != nil {
		t.Fatalf("ERROR: could not create request")
	}
	token, err := get_token(request, "redirecturl")
	if err == nil {
		t.Fatalf("ERROR: successfully obtained access token from request with no auth header: %s", token)
	}

	// test with Authorization header but no Bearer token
	request.Header.Set("Authorization", "something else")
	token, err = get_token(request, "redirecturl")
	if err == nil {
		t.Fatalf("ERROR: successfully obtained access token from request with no bearer token: %s", token)
	}

	// test with Authorization header but empty Bearer token
	request.Header.Set("Authorization", "Bearer ")
	token, err = get_token(request, "redirecturl")
	if err == nil {
		t.Fatalf("ERROR: successfully obtained access token from request with empty bearer token: %s", token)
	}

	// test with good Authorization header and bearer token
	request.Header.Set("Authorization", "Bearer <access_token>")
	token, err = get_token(request, "redirecturl")
	if err != nil {
		t.Fatalf("ERROR: could not obtain access token from request with bearer token: %s", token)
	}
}
