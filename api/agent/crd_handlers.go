package api

import (
	"encoding/json"
	"net/http"
	"strings"

	crdmanager "github.com/spiffe/tornjak/pkg/agent/spirecrd"
)

func (s *Server) CRDFederationList(w http.ResponseWriter, r *http.Request) {
	// if CRD management not configured
	if s.CRDManager == nil {
		emsg := "Error: CRD Manager not configured on Tornjak."
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	// if CRD management is configured
	var input crdmanager.ListFederationRelationshipsRequest
	buf := new(strings.Builder)

	n, err, data := copyIntoBuff(buf, w, r, "Error parsing data: ")
	if n == 0 && data == "err" { return }

	if n == 0 {
		input = crdmanager.ListFederationRelationshipsRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest) {
			return
		}
	}

	ret, err := s.CRDManager.ListClusterFederatedTrustDomains(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	if isHttpError(err, w, "Error: ", http.StatusInternalServerError) {
		return
	}

	cors(w, r)
	je := json.NewEncoder(w)
	err = je.Encode(ret) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	if isHttpError(err, w, "Error: ", http.StatusBadRequest) {
		return
	}
}
