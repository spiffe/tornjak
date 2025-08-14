package managerapi

import (
	"fmt"
	"io"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
)

// registerSpireAPI registers SPIRE endpoints
func registerSpireAPI(r *mux.Router, h *Handlers) {
	r.Handle("/spire/healthcheck/{server:.*}", CorsMiddleware(http.HandlerFunc(h.Srv.apiServerProxyFunc("/api/v1/spire/healthcheck", http.MethodGet)))).Methods(http.MethodGet, http.MethodOptions)
	r.Handle("/spire/serverinfo/{server:.*}", CorsMiddleware(http.HandlerFunc(h.Srv.apiServerProxyFunc("/api/v1/spire/serverinfo", http.MethodGet)))).Methods(http.MethodGet, http.MethodOptions)
	r.Handle("/entry/list/{server:.*}", CorsMiddleware(http.HandlerFunc(h.Srv.apiServerProxyFunc("/api/v1/spire/entries", http.MethodGet)))).Methods(http.MethodGet, http.MethodOptions)
	r.Handle("/entry/delete/{server:.*}", CorsMiddleware(http.HandlerFunc(h.Srv.apiServerProxyFunc("/api/v1/spire/entries", http.MethodDelete)))).Methods(http.MethodDelete, http.MethodOptions)
	r.Handle("/entry/create/{server:.*}", CorsMiddleware(http.HandlerFunc(h.Srv.apiServerProxyFunc("/api/v1/spire/entries", http.MethodPost)))).Methods(http.MethodPost, http.MethodOptions)
}

// apiServerProxyFunc proxies requests to SPIRE/Tornjak servers
func (s *Server) apiServerProxyFunc(apiPath string, apiMethod string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		serverName := vars["server"]
		sinfo, err := s.DB.GetServer(serverName)
		if err != nil {
			JSONError(w, fmt.Sprintf("Error getting server info: %v", err), http.StatusBadRequest)
			return
		}

		client, err := sinfo.HttpClient()
		if err != nil {
			JSONError(w, fmt.Sprintf("Error initializing client: %v", err), http.StatusBadRequest)
			return
		}

		req, err := http.NewRequest(apiMethod, strings.TrimSuffix(sinfo.Address, "/")+apiPath, r.Body)
		if err != nil {
			JSONError(w, fmt.Sprintf("Error creating request: %v", err), http.StatusBadRequest)
			return
		}

		resp, err := client.Do(req)
		if err != nil {
			JSONError(w, fmt.Sprintf("Error calling server: %v", err), http.StatusBadRequest)
			return
		}
		defer resp.Body.Close()

		CopyHeader(w.Header(), resp.Header)
		w.WriteHeader(resp.StatusCode)
		_, _ = io.Copy(w, resp.Body)
	}
}
