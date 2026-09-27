package authenticator

import (
	"fmt"
	"net"
	"net/http"
	"net/http/httptest"
	"strings"
	"testing"
	"time"

	backoff "github.com/cenkalti/backoff/v4"
)

// testBackoff returns a fast exponential backoff so tests exercise real
// retry behavior without waiting out the production oidcDiscoveryMaxElapsedTime
// window (30s).
func testBackoff(maxElapsed time.Duration) backoff.BackOff {
	b := backoff.NewExponentialBackOff()
	b.InitialInterval = 20 * time.Millisecond
	b.MaxInterval = 100 * time.Millisecond
	b.MaxElapsedTime = maxElapsed
	return b
}

// freePort reserves a TCP port and immediately releases it, leaving nothing
// listening. Connections to it fail with a real "connection refused" until
// something else binds to it, which is exactly the condition we want to
// simulate an IAM server that isn't up yet.
func freePort(t *testing.T) int {
	t.Helper()
	ln, err := net.Listen("tcp", "127.0.0.1:0")
	if err != nil {
		t.Fatalf("ERROR: failed to reserve a port: %v", err)
	}
	port := ln.Addr().(*net.TCPAddr).Port
	if err := ln.Close(); err != nil {
		t.Fatalf("ERROR: failed to release reserved port: %v", err)
	}
	return port
}

// discoveryHandler serves the minimum OIDC discovery document and JWKS
// pardot/oidc/discovery.Client and keyfunc.Get need to succeed.
func discoveryHandler(baseURL string) http.Handler {
	mux := http.NewServeMux()
	mux.HandleFunc("/.well-known/openid-configuration", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprintf(w, `{"issuer": %q, "jwks_uri": %q}`, baseURL, baseURL+"/certs")
	})
	mux.HandleFunc("/certs", func(w http.ResponseWriter, r *http.Request) {
		fmt.Fprint(w, `{"keys": []}`)
	})
	return mux
}

// TestNewKeycloakAuthenticator_SucceedsImmediately is the control case: a
// reachable issuer from the first attempt must still succeed exactly like
// before this change, proving the retry wrapper didn't disturb the golden
// path.
func TestNewKeycloakAuthenticator_SucceedsImmediately(t *testing.T) {
	var server *httptest.Server
	server = httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		discoveryHandler(server.URL).ServeHTTP(w, r)
	}))
	defer server.Close()

	auth, err := newKeycloakAuthenticator(true, server.URL, "tornjak-backend", testBackoff(5*time.Second))
	if err != nil {
		t.Fatalf("ERROR: expected immediate success against a reachable issuer, got %v", err)
	}
	if auth.audience != "tornjak-backend" {
		t.Fatalf("ERROR: expected audience %q, got %q", "tornjak-backend", auth.audience)
	}
	if auth.jwksURL != server.URL+"/certs" {
		t.Fatalf("ERROR: expected jwksURL %q, got %q", server.URL+"/certs", auth.jwksURL)
	}
}

// TestNewKeycloakAuthenticator_RecoversFromTransientOIDCFailure reproduces
// the actual scenario behind #410: the IAM server isn't reachable yet when
// Tornjak starts, then comes up a moment later. Before this change, the
// first failed discovery attempt would have been fatal; now it must retry
// and succeed once the issuer becomes reachable.
func TestNewKeycloakAuthenticator_RecoversFromTransientOIDCFailure(t *testing.T) {
	port := freePort(t)
	issuerURL := fmt.Sprintf("http://127.0.0.1:%d", port)

	type result struct {
		auth *KeycloakAuthenticator
		err  error
	}
	resultCh := make(chan result, 1)
	go func() {
		auth, err := newKeycloakAuthenticator(true, issuerURL, "tornjak-backend", testBackoff(5*time.Second))
		resultCh <- result{auth, err}
	}()

	// give it a couple of real failed attempts against the refused port
	// before the issuer becomes reachable
	time.Sleep(150 * time.Millisecond)

	ln, err := net.Listen("tcp", fmt.Sprintf("127.0.0.1:%d", port))
	if err != nil {
		t.Fatalf("ERROR: failed to bind the now-available issuer on port %d: %v", port, err)
	}
	server := httptest.NewUnstartedServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		discoveryHandler(issuerURL).ServeHTTP(w, r)
	}))
	server.Listener = ln
	server.Start()
	defer server.Close()

	select {
	case res := <-resultCh:
		if res.err != nil {
			t.Fatalf("ERROR: expected recovery once the issuer became reachable, got %v", res.err)
		}
		if res.auth.jwksURL != issuerURL+"/certs" {
			t.Fatalf("ERROR: expected jwksURL %q, got %q", issuerURL+"/certs", res.auth.jwksURL)
		}
	case <-time.After(5 * time.Second):
		t.Fatal("ERROR: newKeycloakAuthenticator did not recover within the backoff window")
	}
}

// TestNewKeycloakAuthenticator_GivesUpAfterMaxElapsedTime ensures a
// permanently unreachable issuer still fails, and does so within roughly
// the configured backoff window rather than hanging indefinitely.
func TestNewKeycloakAuthenticator_GivesUpAfterMaxElapsedTime(t *testing.T) {
	port := freePort(t) // nothing ever listens on this port

	maxElapsed := 300 * time.Millisecond
	start := time.Now()
	_, err := newKeycloakAuthenticator(true, fmt.Sprintf("http://127.0.0.1:%d", port), "tornjak-backend", testBackoff(maxElapsed))
	elapsed := time.Since(start)

	if err == nil {
		t.Fatal("ERROR: expected an error for a permanently unreachable issuer, got nil")
	}
	if !strings.Contains(err.Error(), "connect: connection refused") && !strings.Contains(err.Error(), "connection refused") {
		t.Fatalf("ERROR: expected a connection-refused error, got %v", err)
	}
	// generous upper bound: should give up close to maxElapsed, not hang
	if elapsed > 3*time.Second {
		t.Fatalf("ERROR: expected to give up within a few seconds of maxElapsedTime (%v), took %v", maxElapsed, elapsed)
	}
}
