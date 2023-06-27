package api

import (
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/cenkalti/backoff/v4"
	"github.com/gorilla/mux"
	"github.com/hashicorp/hcl"
	"github.com/hashicorp/hcl/hcl/ast"
	"github.com/hashicorp/hcl/hcl/token"
	"github.com/pkg/errors"

	auth "github.com/spiffe/tornjak/tornjak-backend/pkg/agent/auth"
	agentdb "github.com/spiffe/tornjak/tornjak-backend/pkg/agent/db"
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
	Auth          auth.Auth
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

func (s *Server) healthcheck(w http.ResponseWriter, r *http.Request) {
	var input HealthcheckRequest
	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	if n == 0 {
		input = HealthcheckRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}

	ret, err := s.SPIREHealthcheck(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
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

func (s *Server) debugServer(w http.ResponseWriter, r *http.Request) {
	input := DebugServerRequest{} // HARDCODED INPUT because there are no fields to DebugServerRequest

	ret, err := s.DebugServer(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
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


func (s *Server) agentList(w http.ResponseWriter, r *http.Request) {
	var input ListAgentsRequest
	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	if n == 0 {
		input = ListAgentsRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}

	ret, err := s.ListAgents(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
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

func (s *Server) agentBan(w http.ResponseWriter, r *http.Request) {
	var input BanAgentRequest
	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	if n == 0 {
		emsg := "Error: no data provided"
		retError(w, emsg, http.StatusBadRequest)
		return
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}

	err = s.BanAgent(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	if err != nil {
		emsg := fmt.Sprintf("Error listing agents: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}

	cors(w, r)
	_, err = w.Write([]byte("SUCCESS"))

	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}

}

func (s *Server) agentDelete(w http.ResponseWriter, r *http.Request) {
	// TODO update backend to also delete agent metadata

	var input DeleteAgentRequest
	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	if n == 0 {
		emsg := "Error: no data provided"
		retError(w, emsg, http.StatusBadRequest)
		return
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}

	err = s.DeleteAgent(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	if err != nil {
		emsg := fmt.Sprintf("Error listing agents: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}

	cors(w, r)
	_, err = w.Write([]byte("SUCCESS"))

	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}

}

func (s *Server) agentCreateJoinToken(w http.ResponseWriter, r *http.Request) {
	var input CreateJoinTokenRequest
	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	if n == 0 {
		input = CreateJoinTokenRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}

	ret, err := s.CreateJoinToken(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
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

func (s *Server) entryList(w http.ResponseWriter, r *http.Request) {
	var input ListEntriesRequest
	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	if n == 0 {
		input = ListEntriesRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}

	ret, err := s.ListEntries(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
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

func (s *Server) entryCreate(w http.ResponseWriter, r *http.Request) {
	var input BatchCreateEntryRequest
	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	if n == 0 {
		input = BatchCreateEntryRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}

	ret, err := s.BatchCreateEntry(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
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

func (s *Server) entryDelete(w http.ResponseWriter, r *http.Request) {
	var input BatchDeleteEntryRequest
	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	if n == 0 {
		input = BatchDeleteEntryRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}

	ret, err := s.BatchDeleteEntry(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
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

func cors(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "application/json;charset=UTF-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type, access-control-allow-origin, access-control-allow-headers, access-control-allow-credentials, Authorization, access-control-allow-methods")
	w.Header().Set("Access-Control-Expose-Headers", "*, Authorization")
	w.WriteHeader(http.StatusOK)
}

func retError(w http.ResponseWriter, emsg string, status int) {
	w.Header().Set("Content-Type", "application/json;charset=UTF-8")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
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
		err := s.Auth.Verify(r)
		if err != nil {
			emsg := fmt.Sprintf("Error authorizing request: %v", err.Error())
			// error should be written already
			retError(w, emsg, http.StatusUnauthorized)
			return
		} else {
			next.ServeHTTP(w, r)
		}
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
	// get the absolute path to prevent directory traversal
	path, err := filepath.Abs(r.URL.Path)
	if err != nil {
		// if we failed to get the absolute path respond with a 400 bad request
		// and stop
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	// prepend the path with the path to the static directory
	path = filepath.Join(h.staticPath, path)

	// check whether a file exists at the given path
	_, err = os.Stat(path)
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

func (s *Server) home(w http.ResponseWriter, r *http.Request) {
	var ret = "Welcome to the Tornjak Backend!"

	cors(w, r)
	je := json.NewEncoder(w)

	var err = je.Encode(ret)
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
	}
}

func (s *Server) GetRouter() (*mux.Router) {
	rtr := mux.NewRouter()

	// Home
	rtr.HandleFunc("/", s.home)

	// SPIRE server healthcheck
	rtr.HandleFunc("/api/debugserver", s.debugServer)
	rtr.HandleFunc("/api/healthcheck", s.healthcheck)

	// Agents
	rtr.HandleFunc("/api/agent/list", s.agentList)
	rtr.HandleFunc("/api/agent/ban", s.agentBan)
	rtr.HandleFunc("/api/agent/delete", s.agentDelete)
	rtr.HandleFunc("/api/agent/createjointoken", s.agentCreateJoinToken)

	// Entries
	rtr.HandleFunc("/api/entry/list", s.entryList)
	rtr.HandleFunc("/api/entry/create", s.entryCreate)
	rtr.HandleFunc("/api/entry/delete", s.entryDelete)

	// Tornjak specific
	rtr.HandleFunc("/api/tornjak/serverinfo", s.tornjakGetServerInfo)
	// Agents Selectors
	rtr.HandleFunc("/api/tornjak/selectors/register", s.tornjakPluginDefine)
	rtr.HandleFunc("/api/tornjak/selectors/list", s.tornjakSelectorsList)
	rtr.HandleFunc("/api/tornjak/agents/list", s.tornjakAgentsList)
	// Clusters
	rtr.HandleFunc("/api/tornjak/clusters/list", s.clusterList)
	rtr.HandleFunc("/api/tornjak/clusters/create", s.clusterCreate)
	rtr.HandleFunc("/api/tornjak/clusters/edit", s.clusterEdit)
	rtr.HandleFunc("/api/tornjak/clusters/delete", s.clusterDelete)

	// Middleware
	rtr.Use(s.verificationMiddleware)

	// UI
	spa := spaHandler{staticPath: "ui-agent", indexPath: "index.html"}
	rtr.PathPrefix("/").Handler(spa)

	return rtr
}

// HandleRequests connects api links with respective functions
// Functions currently handle the api calls all as post-requests
func (s *Server) HandleRequests() {
	err := s.Configure()
	if err != nil {
		log.Fatal("Cannot Configure: ", err)
	}
	
	numPorts := 0
	errChannel := make(chan error, 3)
	rtr := s.GetRouter()

	// TLS Stack handling
	serverConfig := s.TornjakConfig.Server

	if serverConfig.HttpConfig != nil && serverConfig.HttpConfig.Enabled {
		numPorts += 1
		listenPort := serverConfig.HttpConfig.ListenPort
		tlsType := "HTTP"
		go func() {
			if listenPort == 0 {
				err := errors.Errorf("%s server: Cannot have empty port: %d", tlsType, listenPort)
				errChannel <- err
				return
			}
			addr := fmt.Sprintf(":%d", listenPort)
			fmt.Printf("Starting to listen on %s...\n", addr)
			err := http.ListenAndServe(addr, rtr)
			err = errors.Errorf("%s server: Error serving: %v", tlsType, err)
			errChannel <- err
			// log.Printf("HTTP serve error: %v", err)
		}()
	}

	if serverConfig.TlsConfig != nil && serverConfig.TlsConfig.Enabled {
		numPorts += 1
		listenPort := serverConfig.TlsConfig.ListenPort
		certPath := serverConfig.TlsConfig.Cert
		keyPath := serverConfig.TlsConfig.Key
		tlsType := "TLS"

		go func() {
			if listenPort == 0 {
				err := errors.Errorf("%s server: Cannot have empty port: %d", tlsType, listenPort)
				errChannel <- err
				return
			}
			addr := fmt.Sprintf(":%d", listenPort)
			// Create a CA certificate pool and add cert.pem to it
			caCert, err := os.ReadFile(certPath)
			if err != nil {
				err = errors.Errorf("%s server: CA pool error: %v", tlsType, err)
				errChannel <- err
				return
			}
			caCertPool := x509.NewCertPool()
			caCertPool.AppendCertsFromPEM(caCert)

			// Create the TLS Config with the CA pool and enable Client certificate validation
			tlsConfig := &tls.Config{
				ClientCAs: caCertPool,
			}
			//tlsConfig.BuildNameToCertificate()

			// Create a Server instance to listen on port 8443 with the TLS config
			server := &http.Server{
				Handler:   rtr,
				Addr:      addr,
				TLSConfig: tlsConfig,
			}

			fmt.Printf("Starting to listen with %s on %s...\n", tlsType, addr)
			if _, err := os.Stat(certPath); os.IsNotExist(err) {
				err = errors.Errorf("%s server: File does not exist %s", tlsType, certPath)
				errChannel <- err
				return
			}
			if _, err := os.Stat(keyPath); os.IsNotExist(err) {
				err = errors.Errorf("%s server: File does not exist %s", tlsType, keyPath)
				errChannel <- err
				return
			}
			
			err = server.ListenAndServeTLS(certPath, keyPath)
			err = errors.Errorf("%s server: Error serving: %v", tlsType, err)
			errChannel <- err
		}()
	}

	if serverConfig.MtlsConfig != nil && serverConfig.MtlsConfig.Enabled {
		numPorts += 1
		listenPort := serverConfig.MtlsConfig.ListenPort
		certPath := serverConfig.MtlsConfig.Cert
		keyPath := serverConfig.MtlsConfig.Key
		caPath := serverConfig.MtlsConfig.Ca
		tlsType := "mTLS"

		go func() {
			if listenPort == 0 {
				err := errors.Errorf("%s server: Cannot have empty port: %d", tlsType, listenPort)
				errChannel <- err
				return
			}
			addr := fmt.Sprintf(":%d", listenPort)
			// Create a CA certificate pool and add cert.pem to it
			caCert, err := os.ReadFile(certPath)
			if err != nil {
				err = errors.Errorf("%s server: CA pool error: %v", tlsType, err)
				errChannel <- err
				return
			}
			caCertPool := x509.NewCertPool()
			caCertPool.AppendCertsFromPEM(caCert)

			// add mTLS CA path to cert pool as well
			if _, err := os.Stat(caPath); os.IsNotExist(err) {
				err = errors.Errorf("%s server: File does not exist %s", tlsType, caPath)
				errChannel <- err
				return
			}
			mTLSCaCert, err := os.ReadFile(caPath)
			if err != nil {
				err = errors.Errorf("%s server: Could not read file %s: %v", tlsType, caPath, err)
				errChannel <- err
				return
			}
			caCertPool.AppendCertsFromPEM(mTLSCaCert)

			// Create the TLS Config with the CA pool and enable Client certificate validation

			mtlsConfig := &tls.Config{
				ClientCAs: caCertPool,
			}
			mtlsConfig.ClientAuth = tls.RequireAndVerifyClientCert
			//mtlsConfig.BuildNameToCertificate()

			// Create a Server instance to listen on port 8443 with the TLS config
			server := &http.Server{
				Handler:   rtr,
				Addr:      addr,
				TLSConfig: mtlsConfig,
			}

			fmt.Printf("Starting to listen with %s on %s...\n", tlsType, addr)
			if _, err := os.Stat(certPath); os.IsNotExist(err) {
				err = errors.Errorf("%s server: File does not exist %s", tlsType, certPath)
				errChannel <- err
				return
			}
			if _, err := os.Stat(keyPath); os.IsNotExist(err) {
				log.Fatalf("File does not exist %s", keyPath)
			}
			err = server.ListenAndServeTLS(certPath, keyPath)
			err = errors.Errorf("%s server: Error serving: %v", tlsType, err)
			errChannel <- err
		}()
	}

	// no ports opened
	if numPorts == 0 {
		log.Printf("No connections opened. HINT: at least one HTTP, TLS, or MTLS must be enabled in Tornjak config")
	}

	// as errors come in, read them, and block
	for i := 0; i < numPorts; i++ {
		err := <- errChannel
		log.Printf("%v", err)
	}
	
}

func stringFromToken(keyToken token.Token) (string, error) {
	switch keyToken.Type {
	case token.STRING, token.IDENT:
	default:
		return "", fmt.Errorf("expected STRING or IDENT but got %s", keyToken.Type)
	}
	value := keyToken.Value()
	stringValue, ok := value.(string)
	if !ok {
		// purely defensive
		return "", fmt.Errorf("expected %T but got %T", stringValue, value)
	}
	return stringValue, nil
}

// getPluginConfig returns first plugin configuration
func getPluginConfig(plugin *ast.ObjectItem) (string, ast.Node, error) {
	// extract plugin name and value
	pluginName, err := stringFromToken(plugin.Keys[1].Token)
	if err != nil {
		return "", nil, fmt.Errorf("invalid plugin type name %q: %w", plugin.Keys[1].Token.Text, err)
	}
	// extract data
	var hclPluginConfig hclPluginConfig
	if err := hcl.DecodeObject(&hclPluginConfig, plugin.Val); err != nil {
		return "", nil, fmt.Errorf("failed to decode plugin config for %q: %w", pluginName, err)
	}
	return pluginName, hclPluginConfig.PluginData, nil
}

// NewAgentsDB returns a new agents DB, given a DB connection string
func NewAgentsDB(dbPlugin *ast.ObjectItem) (agentdb.AgentDB, error) {
	key, data, err := getPluginConfig(dbPlugin)
	if err != nil { // db is required config
		return nil, errors.New("Required DataStore plugin not configured")
	}

	fmt.Printf("DATASTORE KEY AND DATA: %s ,  %+v\n", key, data)

	switch key {
	case "sql":
		// check if data is defined
		if data == nil {
			return nil, errors.New("SQL DataStore plugin ('config > plugins > DataStore sql > plugin_data') not populated")
		}
		fmt.Printf("SQL DATASTORE DATA: %+v\n", data)

		// TODO can probably add this to config
		expBackoff := backoff.NewExponentialBackOff()
		expBackoff.MaxElapsedTime = time.Second

		// decode config to struct
		var config pluginDataStoreSQL
		if err := hcl.DecodeObject(&config, data); err != nil {
			return nil, errors.Errorf("Couldn't parse DB config: %v", err)
		}

		// create db
		drivername := config.Drivername
		dbfile := config.Filename

		db, err := agentdb.NewLocalSqliteDB(drivername, dbfile, expBackoff)
		if err != nil {
			return nil, errors.Errorf("Could not start DB driver %s, filename: %s: %v", drivername, dbfile, err)
		}
		return db, nil
	default:
		return nil, errors.Errorf("Couldn't create datastore")
	}
}

// NewAuth returns a new Auth
func NewAuth(authPlugin *ast.ObjectItem) (auth.Auth, error) {
	key, data, _ := getPluginConfig(authPlugin)
	/*if err != nil { // default used, no error
		verifier := auth.NewNullVerifier()
		return verifier, nil
	}*/

	switch key {
	case "KeycloakAuth":
		// decode config to struct
		var config pluginAuthKeycloak
		if err := hcl.DecodeObject(&config, data); err != nil {
			return nil, errors.Errorf("Couldn't parse Auth config: %v", err)
		}

		// create verifier TODO make json an option?
		verifier, err := auth.NewKeycloakVerifier(true, config.JwksURL, config.RedirectURL)
		if err != nil {
			return nil, errors.Errorf("Couldn't configure Auth: %v", err)
		}
		return verifier, nil
	default:
		return nil, errors.Errorf("Invalid option for UserManagement named %s", key)
	}
}

func (s *Server) VerifyConfiguration() error {
	if s.TornjakConfig == nil {
		return errors.New("config not given")
	}

	/*  Verify server  */
	if s.TornjakConfig.Server == nil { // must be defined
		return errors.New("'config > server' field not defined")
	}
	if s.TornjakConfig.Server.SPIRESocket == "" {
		return errors.New("'config > server > spire_socket_path' field not defined")
	}

	serverConfig := s.TornjakConfig.Server
	if (serverConfig.HttpConfig == nil && serverConfig.TlsConfig == nil && serverConfig.MtlsConfig == nil) {
		return errors.New("'config > server' must have at least one of HTTP, TLS, or mTLS sections defined")
	}

	/*  Verify Plugins  */
	if s.TornjakConfig.Plugins == nil {
		return errors.New("'config > plugins' field not defined")
	}
	return nil
}

func (s *Server) ConfigureDefaults() error {
	// no authorization is a default
	s.Auth = auth.NewNullVerifier()
	return nil
}

func (s *Server) Configure() error {
	// Verify Config
	err := s.VerifyConfiguration()
	if err != nil {
		return errors.Errorf("Tornjak Config error: %v", err)
	}

	/*  Configure Server  */
	serverConfig := s.TornjakConfig.Server
	s.SpireServerAddr = serverConfig.SPIRESocket // for convenience
	
	/*  Configure Plugins  */
	// configure defaults for optional plugins, reconfigured if given
	// TODO maybe we should not have this step at all
	// This is a temporary work around for optional plugin configs
	err = s.ConfigureDefaults()
	if err != nil {
		return errors.Errorf("Tornjak Config error: %v", err)
	}

	pluginConfigs := *s.TornjakConfig.Plugins
	pluginList, ok := pluginConfigs.(*ast.ObjectList)
	if !ok {
		return fmt.Errorf("expected plugins node type %T but got %T", pluginList, pluginConfigs)
	}

	// iterate over plugin list

	fmt.Printf("pluginlist: %+v\n", pluginList.Items)

	for _, pluginObject := range pluginList.Items {
		fmt.Printf("pluginItem: %+v\n", pluginObject)

		if len(pluginObject.Keys) != 2 {
			return fmt.Errorf("plugin item expected to have two keys (type then name)")
		}

		pluginType, err := stringFromToken(pluginObject.Keys[0].Token)
		if err != nil {
			return fmt.Errorf("invalid plugin type key %q: %w", pluginObject.Keys[0].Token.Text, err)
		}

		fmt.Printf("pluginType: %s\n", pluginType)

		// create plugin component based on type
		switch pluginType {
			// configure datastore
			case "DataStore":
				s.Db, err = NewAgentsDB(pluginObject)
				if err != nil {
					return errors.Errorf("Cannot configure datastore plugin: %v", err)
				}
			// configure auth
			case "UserManagement":
				s.Auth, err = NewAuth(pluginObject)
				if err != nil {
					return errors.Errorf("Cannot configure auth plugin: %v", err)
				}
		}
		// TODO Handle when multiple plugins configured
	}

	return nil
}

func (s *Server) tornjakSelectorsList(w http.ResponseWriter, r *http.Request) {
	buf := new(strings.Builder)
	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()
	var input ListSelectorsRequest
	if n == 0 {
		input = ListSelectorsRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}
	ret, err := s.ListSelectors(input)
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
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

func (s *Server) tornjakPluginDefine(w http.ResponseWriter, r *http.Request) {
	buf := new(strings.Builder)
	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()
	var input RegisterSelectorRequest
	if n == 0 {
		input = RegisterSelectorRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}
	err = s.DefineSelectors(input)
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	cors(w, r)
	_, err = w.Write([]byte("SUCCESS"))
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
}

func (s *Server) tornjakAgentsList(w http.ResponseWriter, r *http.Request) {
	buf := new(strings.Builder)
	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()
	var input ListAgentMetadataRequest
	if n == 0 {
		input = ListAgentMetadataRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}
	ret, err := s.ListAgentMetadata(input)
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
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

/********* CLUSTER *********/

func (s *Server) clusterList(w http.ResponseWriter, r *http.Request) {
	var input ListClustersRequest
	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	if n == 0 {
		input = ListClustersRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}

	ret, err := s.ListClusters(input)
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
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

func (s *Server) clusterCreate(w http.ResponseWriter, r *http.Request) {
	buf := new(strings.Builder)
	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()
	var input RegisterClusterRequest
	if n == 0 {
		input = RegisterClusterRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}
	err = s.DefineCluster(input)
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	cors(w, r)
	_, err = w.Write([]byte("SUCCESS"))
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
}

func (s *Server) clusterEdit(w http.ResponseWriter, r *http.Request) {
	buf := new(strings.Builder)
	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()
	var input EditClusterRequest
	if n == 0 {
		input = EditClusterRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}
	err = s.EditCluster(input)
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	cors(w, r)
	_, err = w.Write([]byte("SUCCESS"))
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
}

func (s *Server) clusterDelete(w http.ResponseWriter, r *http.Request) {
	buf := new(strings.Builder)
	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()
	var input DeleteClusterRequest
	if n == 0 {
		input = DeleteClusterRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}
	err = s.DeleteCluster(input)
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	cors(w, r)
	_, err = w.Write([]byte("SUCCESS"))
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}

}

/********* END CLUSTER *********/
