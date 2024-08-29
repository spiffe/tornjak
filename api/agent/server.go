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
	"time"

	backoff "github.com/cenkalti/backoff/v4"
	"github.com/gorilla/mux"
	"github.com/hashicorp/hcl"
	"github.com/hashicorp/hcl/hcl/ast"
	"github.com/hashicorp/hcl/hcl/token"
	"github.com/pkg/errors"

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
		retError(w, emsg, http.StatusInternalServerError)
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
		retError(w, emsg, http.StatusInternalServerError)
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
		retError(w, emsg, http.StatusInternalServerError)
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
		retError(w, emsg, http.StatusInternalServerError)
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
		retError(w, emsg, http.StatusInternalServerError)
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
		retError(w, emsg, http.StatusInternalServerError)
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
		retError(w, emsg, http.StatusInternalServerError)
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
		retError(w, emsg, http.StatusInternalServerError)
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
		retError(w, emsg, http.StatusInternalServerError)
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

// Bundle APIs
func (s *Server) bundleGet(w http.ResponseWriter, r *http.Request) {
	var input GetBundleRequest
	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	if n == 0 {
		input = GetBundleRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}

	ret, err := s.GetBundle(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusInternalServerError)
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

func (s *Server) federatedBundleList(w http.ResponseWriter, r *http.Request) {
	var input ListFederatedBundlesRequest
	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	if n == 0 {
		input = ListFederatedBundlesRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}

	ret, err := s.ListFederatedBundles(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusInternalServerError)
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

func (s *Server) federatedBundleCreate(w http.ResponseWriter, r *http.Request) {
	var input CreateFederatedBundleRequest
	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	if n == 0 {
		input = CreateFederatedBundleRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}

	ret, err := s.CreateFederatedBundle(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusInternalServerError)
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

func (s *Server) federatedBundleUpdate(w http.ResponseWriter, r *http.Request) {
	var input UpdateFederatedBundleRequest
	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	if n == 0 {
		input = UpdateFederatedBundleRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}

	ret, err := s.UpdateFederatedBundle(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusInternalServerError)
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

func (s *Server) federatedBundleDelete(w http.ResponseWriter, r *http.Request) {
	var input DeleteFederatedBundleRequest
	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	if n == 0 {
		input = DeleteFederatedBundleRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}

	ret, err := s.DeleteFederatedBundle(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusInternalServerError)
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

func (s *Server) health(w http.ResponseWriter, r *http.Request) {
	var ret = "Endpoint is healthy."

	cors(w, r)
	je := json.NewEncoder(w)

	var err = je.Encode(ret)
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
	}
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
	apiRtr.HandleFunc("/api/v1/spire/serverinfo", s.debugServer).Methods("GET")
	apiRtr.HandleFunc("/api/v1/spire/healthcheck", s.healthcheck).Methods("GET")
	apiRtr.HandleFunc("/api/v1/spire/agents", s.agentList).Methods("GET")
	apiRtr.HandleFunc("/api/v1/spire/agents/ban", s.agentBan).Methods("POST")
	apiRtr.HandleFunc("/api/v1/spire/agents", s.agentDelete).Methods("DELETE")
	apiRtr.HandleFunc("/api/v1/spire/agents/jointoken", s.agentCreateJoinToken).Methods("POST")
	apiRtr.HandleFunc("/api/v1/spire/entries", s.entryList).Methods("GET")
	apiRtr.HandleFunc("/api/v1/spire/entries", s.entryCreate).Methods("POST")
	apiRtr.HandleFunc("/api/v1/spire/entries", s.entryDelete).Methods("DELETE")
	apiRtr.HandleFunc("/api/v1/spire/bundle", s.bundleGet).Methods("GET")
	apiRtr.HandleFunc("/api/v1/spire/federations/bundles", s.federatedBundleList).Methods("GET")
	apiRtr.HandleFunc("/api/v1/spire/federations/bundles", s.federatedBundleCreate).Methods("POST")
	apiRtr.HandleFunc("/api/v1/spire/federations/bundles", s.federatedBundleUpdate).Methods("PATCH")
	apiRtr.HandleFunc("/api/v1/spire/federations/bundles", s.federatedBundleDelete).Methods("DELETE")

	// Tornjak specific
	apiRtr.HandleFunc("/api/v1/tornjak/serverinfo", s.tornjakGetServerInfo).Methods("GET")
	// Agents Selectors
	apiRtr.HandleFunc("/api/v1/tornjak/selectors", s.tornjakPluginDefine).Methods("POST")
	apiRtr.HandleFunc("/api/v1/tornjak/selectors", s.tornjakSelectorsList).Methods("GET")
	apiRtr.HandleFunc("/api/v1/tornjak/agents", s.tornjakAgentsList).Methods("GET")
	// Clusters
	apiRtr.HandleFunc("/api/v1/tornjak/clusters", s.clusterList).Methods("GET")
	apiRtr.HandleFunc("/api/v1/tornjak/clusters", s.clusterCreate).Methods("POST")
	apiRtr.HandleFunc("/api/v1/tornjak/clusters", s.clusterEdit).Methods("PATCH")
	apiRtr.HandleFunc("/api/v1/tornjak/clusters", s.clusterDelete).Methods("DELETE")

	// Middleware
	apiRtr.Use(s.verificationMiddleware)

	// UI
	spa := spaHandler{staticPath: "ui-agent", indexPath: "index.html"}
	rtr.PathPrefix("/").Handler(spa)

	return rtr
}

func (s *Server) redirectHTTP(w http.ResponseWriter, r *http.Request) {
	if r.Method != "GET" && r.Method != "HEAD" {
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

// NewAuthenticator returns a new Authenticator
func NewAuthenticator(authenticatorPlugin *ast.ObjectItem) (authenticator.Authenticator, error) {
	key, data, _ := getPluginConfig(authenticatorPlugin)

	switch key {
	case "Keycloak":
		// check if data is defined
		if data == nil {
			return nil, errors.New("Keycloak Authenticator plugin ('config > plugins > Authenticator Keycloak > plugin_data') not populated")
		}
		fmt.Printf("Authenticator Keycloak Plugin Data: %+v\n", data)
		// decode config to struct
		var config pluginAuthenticatorKeycloak
		if err := hcl.DecodeObject(&config, data); err != nil {
			return nil, errors.Errorf("Couldn't parse Authenticator config: %v", err)
		}

		// Log warning if audience is nil that aud claim is not checked
		if config.Audience == "" {
			fmt.Println("WARNING: Auth plugin has no expected audience configured - `aud` claim will not be checked (please populate 'config > plugins > UserManagement KeycloakAuth > plugin_data > audience')")
		}

		// create authenticator TODO make json an option?
		authenticator, err := authenticator.NewKeycloakAuthenticator(true, config.IssuerURL, config.Audience)
		if err != nil {
			return nil, errors.Errorf("Couldn't configure Authenticator: %v", err)
		}
		return authenticator, nil
	default:
		return nil, errors.Errorf("Invalid option for Authenticator named %s", key)
	}
}

// NewAuthorizer returns a new Authorizer
func NewAuthorizer(authorizerPlugin *ast.ObjectItem) (authorization.Authorizer, error) {
	key, data, _ := getPluginConfig(authorizerPlugin)

	switch key {
	case "RBAC":
		// check if data is defined
		if data == nil {
			return nil, errors.New("RBAC Authorizer plugin ('config > plugins > Authorizer RBAC > plugin_data') not populated")
		}
		fmt.Printf("Authorizer RBAC Plugin Data: %+v\n", data)

		// decode config to struct
		var config pluginAuthorizerRBAC
		if err := hcl.DecodeObject(&config, data); err != nil {
			return nil, errors.Errorf("Couldn't parse Authorizer config: %v", err)
		}

		// decode into role list and apiMapping
		roleList := make(map[string]string)
		apiMapping := make(map[string][]string)
		apiV1Mapping := make(map[string]map[string][]string)
		for _, role := range config.RoleList {
			roleList[role.Name] = role.Desc
			// print warning for empty string
			if role.Name == "" {
				fmt.Println("WARNING: using the empty string for an API enables access to all authenticated users")
			}
		}
		for _, api := range config.APIRoleMappings {
			apiMapping[api.Name] = api.AllowedRoles
			fmt.Printf("API name: %s, Allowed Roles: %s \n", api.Name, api.AllowedRoles)
		}
		for _, apiV1 := range config.APIv1RoleMappings{
			arr := strings.Split(apiV1.Name, " ")
			apiV1.Method = arr[0]
			apiV1.Path = arr[1]
			fmt.Printf("API V1 method: %s, API V1 path: %s, API V1 allowed roles: %s \n", apiV1.Method, apiV1.Path, apiV1.AllowedRoles)
			if _, ok := apiV1Mapping[apiV1.Path]; ok {
				apiV1Mapping[apiV1.Path][apiV1.Method] = apiV1.AllowedRoles
			} else {
				apiV1Mapping[apiV1.Path] = map[string][]string{apiV1.Method: apiV1.AllowedRoles}
			}
		}
		fmt.Printf("API V1 Mapping: %+v\n", apiV1Mapping)

		authorizer, err := authorization.NewRBACAuthorizer(config.Name, roleList, apiMapping, apiV1Mapping)
		if err != nil {
			return nil, errors.Errorf("Couldn't configure Authorizer: %v", err)
		}
		return authorizer, nil
	default:
		return nil, errors.Errorf("Invalid option for Authorizer named %s", key)
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

	/*  Verify Plugins  */
	if s.TornjakConfig.Plugins == nil {
		return errors.New("'config > plugins' field not defined")
	}
	return nil
}

func (s *Server) ConfigureDefaults() error {
	// no authorization is a default
	s.Authenticator = authenticator.NewNullAuthenticator()
	s.Authorizer = authorization.NewNullAuthorizer()
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

	for _, pluginObject := range pluginList.Items {
		if len(pluginObject.Keys) != 2 {
			return fmt.Errorf("plugin item expected to have two keys (type then name)")
		}

		pluginType, err := stringFromToken(pluginObject.Keys[0].Token)
		if err != nil {
			return fmt.Errorf("invalid plugin type key %q: %w", pluginObject.Keys[0].Token.Text, err)
		}

		// create plugin component based on type
		switch pluginType {
		// configure datastore
		case "DataStore":
			s.Db, err = NewAgentsDB(pluginObject)
			if err != nil {
				return errors.Errorf("Cannot configure datastore plugin: %v", err)
			}
		// configure Authenticator
		case "Authenticator":
			s.Authenticator, err = NewAuthenticator(pluginObject)
			if err != nil {
				return errors.Errorf("Cannot configure Authenticator plugin: %v", err)
			}
		// configure Authorizer
		case "Authorizer":
			s.Authorizer, err = NewAuthorizer(pluginObject)
			if err != nil {
				return errors.Errorf("Cannot configure Authorizer plugin: %v", err)
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
