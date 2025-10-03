package managerapi

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
)

// Handlers wraps Server for HTTP endpoints
type Handlers struct {
	Srv *Server
}

// ServerListHandler returns server list
func (h *Handlers) ServerListHandler(w http.ResponseWriter, r *http.Request) {
	var input ListServersRequest
	data, _ := io.ReadAll(r.Body)
	if len(data) > 0 {
		if err := json.Unmarshal(data, &input); err != nil {
			JSONError(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
			return
		}
	}

	ret, err := h.Srv.ListServers(r.Context(), &input)
	if err != nil {
		JSONError(w, fmt.Sprintf("Error: %v", err), http.StatusInternalServerError)
		return
	}
	JSONResponse(w, ret, http.StatusOK)
}

// ServerRegisterHandler registers a new server
func (h *Handlers) ServerRegisterHandler(w http.ResponseWriter, r *http.Request) {
	var input RegisterServerRequest
	data, _ := io.ReadAll(r.Body)
	if len(data) > 0 {
		if err := json.Unmarshal(data, &input); err != nil {
			JSONError(w, fmt.Sprintf("Invalid JSON: %v", err), http.StatusBadRequest)
			return
		}
	}

	if err := h.Srv.RegisterServer(input); err != nil {
		JSONError(w, fmt.Sprintf("Error: %v", err), http.StatusBadRequest)
		return
	}
	w.WriteHeader(http.StatusOK)
	_, _ = w.Write([]byte("SUCCESS"))
}
