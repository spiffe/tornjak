package managerapi

import (
	"context"
	"errors"
	"log"
	"net/http"
	"os"
	"path/filepath"

	"github.com/gorilla/mux"
	managerdb "github.com/spiffe/tornjak/pkg/manager/db"
	managertypes "github.com/spiffe/tornjak/pkg/manager/types"
)

// Server is the main manager API server
type Server struct {
	listenAddr string
	DB         managerdb.ManagerDB
	Router     *mux.Router
}

// NewManagerServer creates a new Server with DB injected
func NewManagerServer(listenAddr, dbString string) (*Server, error) {
	db, err := managerdb.NewLocalSqliteDB(dbString)
	if err != nil {
		return nil, err
	}

	s := &Server{
		listenAddr: listenAddr,
		DB:         db,
		Router:     mux.NewRouter(),
	}
	s.registerRoutes()
	return s, nil
}

// registerRoutes registers versioned routes
func (s *Server) registerRoutes() {
	h := &Handlers{Srv: s}

	apiV1 := s.Router.PathPrefix("/manager-api/v1").Subrouter()
	registerSpireAPI(apiV1, h)
	registerTornjakAPI(apiV1, h)

	spa := spaHandler{staticPath: "ui-manager", indexPath: "index.html"}
	s.Router.PathPrefix("/").Handler(spa)
}

// Start runs the HTTP server
func (s *Server) Start() error {
	log.Printf("Manager backend listening on %s", s.listenAddr)
	return http.ListenAndServe(s.listenAddr, s.Router)
}

// spaHandler serves SPA files
type spaHandler struct {
	staticPath string
	indexPath  string
}

func (h spaHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	path, err := filepath.Abs(r.URL.Path)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}
	path = filepath.Join(h.staticPath, path)
	_, err = os.Stat(path)
	if os.IsNotExist(err) {
		http.ServeFile(w, r, filepath.Join(h.staticPath, h.indexPath))
		return
	} else if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}
	http.FileServer(http.Dir(h.staticPath)).ServeHTTP(w, r)
}
func (s *Server) ListServers(ctx context.Context, inp *ListServersRequest) (*ListServersResponse, error) {
	resp, err := s.DB.GetServers()
	if err != nil {
		return nil, err
	}

	// Clear sensitive fields
	for i := range resp.Servers {
		resp.Servers[i].Key = nil
		resp.Servers[i].Cert = nil
	}

	return (*ListServersResponse)(&resp), nil
}

// RegisterServer adds a new server entry to the database.
func (s *Server) RegisterServer(inp RegisterServerRequest) error {
	sinfo := managertypes.ServerInfo(inp)
	// Validate mandatory fields
	if len(sinfo.Name) == 0 || len(sinfo.Address) == 0 {
		return errors.New("server info missing mandatory fields")
	}

	// Create the server entry in the database
	return s.DB.CreateServerEntry(sinfo)
}
