package api

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net"
	"net/http"
	"os"
	"path/filepath"
	"strings"

	"github.com/gorilla/mux"
	"github.com/hashicorp/hcl/hcl/ast"

	"github.com/spiffe/tornjak/pkg/agent/authentication/authenticator"
	"github.com/spiffe/tornjak/pkg/agent/authorization"
	agentdb "github.com/spiffe/tornjak/pkg/agent/db"
)

type Server struct {
	// SPIRE socket location
	SpireServerAddr string

	// SpireServerInfo provides config info for the spire server
	SpireServerInfo TornjakSpireServerInfo

	// Information from Tornjak Config file passed in as argument
	TornjakConfig *TornjakConfig

	// Plugins
	Db            agentdb.AgentDB
	Authenticator authenticator.Authenticator
	Authorizer    authorization.Authorizer
}

// config type, as defined by SPIRE
// we mirror the SPIRE config as set in SPIRE v1.6.4
type hclPluginConfig struct {
	PluginCmd      string   `hcl:"plugin_cmd"`
	PluginArgs     []string `hcl:"plugin_args"`
	PluginChecksum string   `hcl:"plugin_checksum"`
	PluginData     ast.Node `hcl:"plugin_data"`
	Enabled        *bool    `hcl:"enabled"`
}

func cors(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json;charset=UTF-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PATCH")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, access-control-allow-origin, access-control-allow-headers, access-control-allow-credentials, Authorization, access-control-allow-methods")
	w.Header().Set("Access-Control-Expose-Headers", "*, Authorization")
	w.WriteHeader(http.StatusOK)
}

func retError(w http.ResponseWriter, emsg string, status int) {
	w.Header().Set("Content-Type", "application/json;charset=UTF-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS, DELETE, PATCH")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, access-control-allow-origin, access-control-allow-headers, access-control-allow-credentials, Authorization, access-control-allow-methods")
	w.Header().Set("Access-Control-Expose-Headers", "*, Authorization")
	http.Error(w, emsg, status)
}

// Handle preflight checks
func (s *Server) verificationMiddleware(next http.Handler) http.Handler {
	f := func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "OPTIONS" {
			cors(w, r)
			return
		}

		userInfo := s.Authenticator.AuthenticateRequest(r)

		err := s.Authorizer.AuthorizeRequest(r, userInfo)
		if err != nil {
			emsg := fmt.Sprintf("Error authorizing request: %v", err.Error())
			// error should be written already
			retError(w, emsg, http.StatusUnauthorized)
			return
		}

		next.ServeHTTP(w, r)
	}
	return http.HandlerFunc(f)
}

func (s *Server) tornjakGetServerInfo(w http.ResponseWriter, r *http.Request) {
	var input GetTornjakServerInfoRequest
	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	if n == 0 {
		input = GetTornjakServerInfoRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}

	ret, err := s.GetTornjakServerInfo(input)
	if err != nil {
		// The error occurs only when serverinfo is empty
		// This indicates --spire-config not passed
		// return 204 for no content
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusNoContent)
		return
	}

	cors(w, r)
	je := json.NewEncoder(w)
	err = je.Encode(ret)
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
}

// spaHandler implements the http.Handler interface, so we can use it
// to respond to HTTP requests. The path to the static directory and
// path to the index file within that static directory are used to
// serve the SPA in the given static directory.
type spaHandler struct {
	staticPath string
	indexPath  string
}

// ServeHTTP inspects the URL path to locate a file within the static dir
// on the SPA handler. If a file is found, it will be served. If not, the
// file located at the index path on the SPA handler will be served. This
// is suitable behavior for serving an SPA (single page application).
func (h spaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
  relPath := r.URL.Path
	// get the absolute path to prevent directory traversal
	absPath, err := filepath.Abs(filepath.Join(h.staticPath, relPath))
	if err != nil || !strings.HasPrefix(absPath, h.staticPath) {
		// if we failed to get the absolute path respond with a 400 bad request
		// and stop
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// check whether a file exists at the given path
	_, err = os.Stat(absPath)
	if os.IsNotExist(err) {
		// file does not exist, serve index.html
		http.ServeFile(w, r, filepath.Join(h.staticPath, h.indexPath))
		return
	} else if err != nil {
		// if we got an error (that wasn't that the file doesn't exist) stating the
		// file, return a 500 internal server error and stop
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	// otherwise, use http.FileServer to serve the static dir
	http.FileServer(http.Dir(h.staticPath)).ServeHTTP(w, r)
}

func (s *Server) GetRouter() http.Handler {
	rtr := mux.NewRouter()

	apiRtr := rtr.PathPrefix("/").Subrouter()
	healthRtr := rtr.PathPrefix("/healthz").Subrouter()

	// Healthcheck (never goes through authn/authz layers)
	healthRtr.HandleFunc("", s.health)

	// Home
	apiRtr.HandleFunc("/", s.home)

	// SPIRE server healthcheck
	apiRtr.HandleFunc("/api/debugserver", s.debugServer)
	apiRtr.HandleFunc("/api/healthcheck", s.healthcheck)

	// Agents
	apiRtr.HandleFunc("/api/agent/list", s.agentList)
	apiRtr.HandleFunc("/api/agent/ban", s.agentBan)
	apiRtr.HandleFunc("/api/agent/delete", s.agentDelete)
	apiRtr.HandleFunc("/api/agent/createjointoken", s.agentCreateJoinToken)

	// Entries
	apiRtr.HandleFunc("/api/entry/list", s.entryList)
	apiRtr.HandleFunc("/api/entry/create", s.entryCreate)
	apiRtr.HandleFunc("/api/entry/delete", s.entryDelete)

	// Tornjak specific
	apiRtr.HandleFunc("/api/tornjak/serverinfo", s.tornjakGetServerInfo)
	// Agents Selectors
	apiRtr.HandleFunc("/api/tornjak/selectors/register", s.tornjakPluginDefine)
	apiRtr.HandleFunc("/api/tornjak/selectors/list", s.tornjakSelectorsList)
	apiRtr.HandleFunc("/api/tornjak/agents/list", s.tornjakAgentsList)
	// Clusters
	apiRtr.HandleFunc("/api/tornjak/clusters/list", s.clusterList)
	apiRtr.HandleFunc("/api/tornjak/clusters/create", s.clusterCreate)
	apiRtr.HandleFunc("/api/tornjak/clusters/edit", s.clusterEdit)
	apiRtr.HandleFunc("/api/tornjak/clusters/delete", s.clusterDelete)

	// Spire APIs with versioning
	apiRtr.HandleFunc("/api/v1/spire/serverinfo", s.debugServer).Methods(http.MethodGet, http.MethodOptions)
	apiRtr.HandleFunc("/api/v1/spire/healthcheck", s.healthcheck).Methods(http.MethodGet, http.MethodOptions)
	apiRtr.HandleFunc("/api/v1/spire/agents", s.agentList).Methods(http.MethodGet, http.MethodOptions)
	apiRtr.HandleFunc("/api/v1/spire/agents/ban", s.agentBan).Methods(http.MethodPost, http.MethodOptions)
	apiRtr.HandleFunc("/api/v1/spire/agents", s.agentDelete).Methods(http.MethodDelete, http.MethodOptions)
	apiRtr.HandleFunc("/api/v1/spire/agents/jointoken", s.agentCreateJoinToken).Methods(http.MethodPost, http.MethodOptions)
	apiRtr.HandleFunc("/api/v1/spire/entries", s.entryList).Methods(http.MethodGet, http.MethodOptions)
	apiRtr.HandleFunc("/api/v1/spire/entries", s.entryCreate).Methods(http.MethodPost)
	apiRtr.HandleFunc("/api/v1/spire/entries", s.entryDelete).Methods(http.MethodDelete)
	apiRtr.HandleFunc("/api/v1/spire/bundle", s.bundleGet).Methods(http.MethodGet, http.MethodOptions)
	apiRtr.HandleFunc("/api/v1/spire/federations/bundles", s.federatedBundleList).Methods(http.MethodGet, http.MethodOptions)
	apiRtr.HandleFunc("/api/v1/spire/federations/bundles", s.federatedBundleCreate).Methods(http.MethodPost)
	apiRtr.HandleFunc("/api/v1/spire/federations/bundles", s.federatedBundleUpdate).Methods(http.MethodPatch)
	apiRtr.HandleFunc("/api/v1/spire/federations/bundles", s.federatedBundleDelete).Methods(http.MethodDelete)
	apiRtr.HandleFunc("/api/v1/spire/federations", s.federationList).Methods(http.MethodGet, http.MethodOptions)
	apiRtr.HandleFunc("/api/v1/spire/federations", s.federationCreate).Methods(http.MethodPost)
	apiRtr.HandleFunc("/api/v1/spire/federations", s.federationUpdate).Methods(http.MethodPatch)
	apiRtr.HandleFunc("/api/v1/spire/federations", s.federationDelete).Methods(http.MethodDelete)

	// Tornjak specific
	apiRtr.HandleFunc("/api/v1/tornjak/serverinfo", s.tornjakGetServerInfo).Methods(http.MethodGet, http.MethodOptions)
	// Agents Selectors
	apiRtr.HandleFunc("/api/v1/tornjak/selectors", s.tornjakPluginDefine).Methods(http.MethodPost, http.MethodOptions)
	apiRtr.HandleFunc("/api/v1/tornjak/selectors", s.tornjakSelectorsList).Methods(http.MethodGet)
	apiRtr.HandleFunc("/api/v1/tornjak/agents", s.tornjakAgentsList).Methods(http.MethodGet, http.MethodOptions)
	// Clusters
	apiRtr.HandleFunc("/api/v1/tornjak/clusters", s.clusterList).Methods(http.MethodGet, http.MethodOptions)
	apiRtr.HandleFunc("/api/v1/tornjak/clusters", s.clusterCreate).Methods(http.MethodPost)
	apiRtr.HandleFunc("/api/v1/tornjak/clusters", s.clusterEdit).Methods(http.MethodPatch)
	apiRtr.HandleFunc("/api/v1/tornjak/clusters", s.clusterDelete).Methods(http.MethodDelete)

	// Middleware
	apiRtr.Use(s.verificationMiddleware)

	// UI
	spa := spaHandler{staticPath: "ui-agent", indexPath: "index.html"}
	rtr.PathPrefix("/").Handler(spa)

	return rtr
}

func (s *Server) redirectHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet && r.Method != "HEAD" {
		http.Error(w, "Use HTTPS", http.StatusBadRequest)
		return
	}
	target := "https://" + s.stripPort(r.Host) + r.URL.RequestURI()
	http.Redirect(w, r, target, http.StatusFound)
}

func (s *Server) stripPort(hostport string) string {
	host, _, err := net.SplitHostPort(hostport)
	if err != nil {
		return hostport
	}
	addr := fmt.Sprintf("%d", s.TornjakConfig.Server.HTTPSConfig.ListenPort)
	return net.JoinHostPort(host, addr)
}

// HandleRequests connects api links with respective functions
// Functions currently handle the api calls all as post-requests
func (s *Server) HandleRequests() {
	err := s.Configure()
	if err != nil {
		log.Fatal("Cannot Configure: ", err)
	}

	// TODO: replace with workerGroup for thread safety
	errChannel := make(chan error, 2)

	serverConfig := s.TornjakConfig.Server
	if serverConfig.HTTPConfig == nil {
		err = fmt.Errorf("HTTP Config error: no port configured")
		errChannel <- err
		return
	}

	// default router does not redirect
	httpHandler := s.GetRouter()
	numPorts := 1

	if serverConfig.HTTPSConfig == nil { // warn when HTTPS not configured
		log.Print("WARNING: Please consider configuring HTTPS to ensure traffic is running on encrypted endpoint!")
	} else {
		numPorts += 1

		httpHandler = http.HandlerFunc(s.redirectHTTP)
		canStartHTTPS := true
		httpsConfig := serverConfig.HTTPSConfig
		var tlsConfig *tls.Config

		if serverConfig.HTTPSConfig.ListenPort == 0 {
			// Fail because this is required field in this section
			err = fmt.Errorf("HTTPS Config error: no port configured. Starting insecure HTTP connection at %d...", serverConfig.HTTPConfig.ListenPort)
			errChannel <- err
			httpHandler = s.GetRouter()
			canStartHTTPS = false
		} else {
			tlsConfig, err = httpsConfig.Parse()
			if err != nil {
				err = fmt.Errorf("failed parsing HTTPS config: %w. Starting insecure HTTP connection at %d...", err, serverConfig.HTTPConfig.ListenPort)
				errChannel <- err
				httpHandler = s.GetRouter()
				canStartHTTPS = false
			}
		}

		if canStartHTTPS {
			go func() {
				addr := fmt.Sprintf(":%d", serverConfig.HTTPSConfig.ListenPort)
				// Create a Server instance to listen on port 8443 with the TLS config
				server := &http.Server{
					Handler:   s.GetRouter(),
					Addr:      addr,
					TLSConfig: tlsConfig,
				}

				fmt.Printf("Starting https on %s...\n", addr)
				err = server.ListenAndServeTLS(httpsConfig.Cert, httpsConfig.Key)
				if err != nil {
					err = fmt.Errorf("server error serving on https: %w", err)
					errChannel <- err
				}
			}()
		}
	}

	go func() {
		addr := fmt.Sprintf(":%d", serverConfig.HTTPConfig.ListenPort)
		fmt.Printf("Starting to listen on %s...\n", addr)
		err := http.ListenAndServe(addr, httpHandler)
		if err != nil {
			errChannel <- err
		}
	}()

	// as errors come in, read them, and block
	for i := 0; i < numPorts; i++ {
		err := <-errChannel
		log.Printf("%v", err)
	}
}
