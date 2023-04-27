package api

import (
	"crypto/tls"
	"crypto/x509"
	"encoding/json"
	"fmt"
	"io"
	"io/ioutil"
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
	"github.com/pkg/errors"

	"github.com/spiffe/spire/pkg/common/catalog"
	auth "github.com/spiffe/tornjak/tornjak-backend/pkg/agent/auth"
	agentdb "github.com/spiffe/tornjak/tornjak-backend/pkg/agent/db"
)

type Server struct {
	ListenAddr      string
	SpireServerAddr string
	CertPath        string
	KeyPath         string
	MTlsCaPath      string
	TlsEnabled      bool
	MTlsEnabled     bool

	// SpireServerInfo provides config info for the spire server
	SpireServerInfo TornjakSpireServerInfo

	// AgentDB for storing Workload Attestor Plugin Info of agents
	TornjakConfig *TornjakConfig
	Db            agentdb.AgentDB
	Auth          auth.Auth
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

// HandleRequests connects api links with respective functions
// Functions currently handle the api calls all as post-requests
func (s *Server) HandleRequests() {
	err := s.Configure()
	if err != nil {
		log.Fatal("Cannot Configure: ", err)
	}
	rtr := mux.NewRouter()

	// Home
	rtr.HandleFunc("/", s.home)

	// SPIRE server healthcheck
	rtr.HandleFunc("/api/debugserver", s.debugServer)
	rtr.HandleFunc("/api/healthcheck", s.healthcheck)
	rtr.HandleFunc("/api/debugserver", s.debugServer)

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

	// TLS Stack handling
	if s.TlsEnabled || s.MTlsEnabled {

		// Create a CA certificate pool and add cert.pem to it
		caCert, err := ioutil.ReadFile(s.CertPath)
		if err != nil {
			log.Fatal(err)
		}
		caCertPool := x509.NewCertPool()
		caCertPool.AppendCertsFromPEM(caCert)

		tlsType := "TLS"
		// If mTLS is enabled, add mTLS CA path to cert pool as well
		if s.MTlsCaPath != "" {
			if _, err := os.Stat(s.MTlsCaPath); os.IsNotExist(err) {
				log.Fatalf("File does not exist %s", s.MTlsCaPath)
			}
			mTLSCaCert, err := ioutil.ReadFile(s.MTlsCaPath)
			if err != nil {
				log.Fatal(err)
			}
			caCertPool.AppendCertsFromPEM(mTLSCaCert)
			tlsType = "mTLS"
		}

		// Create the TLS Config with the CA pool and enable Client certificate validation

		tlsConfig := &tls.Config{
			ClientCAs: caCertPool,
		}
		if s.MTlsEnabled {
			tlsConfig.ClientAuth = tls.RequireAndVerifyClientCert
		}
		tlsConfig.BuildNameToCertificate()

		// Create a Server instance to listen on port 8443 with the TLS config
		server := &http.Server{
			Handler:   rtr,
			Addr:      s.ListenAddr,
			TLSConfig: tlsConfig,
		}

		fmt.Printf("Starting to listen with %s on %s...\n", tlsType, s.ListenAddr)
		if _, err := os.Stat(s.CertPath); os.IsNotExist(err) {
			log.Fatalf("File does not exist %s", s.CertPath)
		}
		if _, err := os.Stat(s.KeyPath); os.IsNotExist(err) {
			log.Fatalf("File does not exist %s", s.KeyPath)
		}
		log.Fatal(server.ListenAndServeTLS(s.CertPath, s.KeyPath))
		return
	} else {
		fmt.Printf("Starting to listen on %s...\n", s.ListenAddr)
		log.Fatal(http.ListenAndServe(s.ListenAddr, rtr))
	}
}

// TODO map[string]catalog. type
func getPluginConfig(plugin map[string]catalog.HCLPluginConfig) (string, ast.Node, error) {
	for k, d := range plugin {
		return k, d.PluginData, nil
	}
	return "", nil, errors.New("No plugin data found")
}

// NewAgentsDB returns a new agents DB, given a DB connection string
func NewAgentsDB(dbPlugin map[string]catalog.HCLPluginConfig) (agentdb.AgentDB, error) {
	key, data, err := getPluginConfig(dbPlugin)
	if err != nil { // error if no config
		return nil, errors.Errorf("No DataStore plugin found")
	}

	switch key {
	case "sql":
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
func NewAuth(authPlugin map[string]catalog.HCLPluginConfig) (auth.Auth, error) {
	key, data, err := getPluginConfig(authPlugin)
	if err != nil { // default used, no error
		verifier := auth.NewNullVerifier()
		return verifier, nil
	}

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

func (s *Server) ConfigureDefaults() error {
	var err error
	expBackoff := backoff.NewExponentialBackOff()
	expBackoff.MaxElapsedTime = time.Second

	s.Db, err = agentdb.NewLocalSqliteDB("sqlite3", "./tornjak.sqlite3", expBackoff)
	if err != nil {
		return errors.Errorf("Cannot configure default datastore plugin: %v", err)
	}
	s.Auth = auth.NewNullVerifier()
	return nil
}

func (s *Server) Configure() error {
	var err error
	//configs := map[string]map[string]catalog.HCLPluginConfig(*s.TornjakConfig.Plugins)
	if s.TornjakConfig == nil {
		err = s.ConfigureDefaults()
		return err
	}
	serverConfig := *s.TornjakConfig.Server
	fmt.Printf("http listen port.... %s", serverConfig.HttpConfig.ListenPort)
	pluginConfigs := *s.TornjakConfig.Plugins
	// configure datastore
	s.Db, err = NewAgentsDB(pluginConfigs["DataStore"])
	if err != nil {
		return errors.Errorf("Cannot configure datastore plugin: %v", err)
	}
	// configure auth
	s.Auth, err = NewAuth(pluginConfigs["UserManagement"])
	if err != nil {
		return errors.Errorf("Cannot configure auth plugin: %v", err)
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
