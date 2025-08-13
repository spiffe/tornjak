package managerapi

import (
	"net/http"

	"github.com/gorilla/mux"
)

// registerTornjakAPI registers Tornjak endpoints
func registerTornjakAPI(r *mux.Router, h *Handlers) {
	r.Handle("/server/list", CorsMiddleware(http.HandlerFunc(h.ServerListHandler))).Methods(http.MethodPost, http.MethodOptions)
	r.Handle("/server/register", CorsMiddleware(http.HandlerFunc(h.ServerRegisterHandler))).Methods(http.MethodPost, http.MethodOptions)
}
