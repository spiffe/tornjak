package api

import (
	"encoding/json"
	"net/http"
	"strings"

	trustdomain "github.com/spiffe/spire-api-sdk/proto/spire/api/server/trustdomain/v1"
	"google.golang.org/protobuf/encoding/protojson"
)

// Federation APIs
func (s *Server) federationList(w http.ResponseWriter, r *http.Request) {
	var input ListFederationRelationshipsRequest
	buf := new(strings.Builder)

	n, err, data := copyIntoBuff(buf, w, r, "Error: ")
	if n == 0 && data == "err" { return }

	if n == 0 {
		input = ListFederationRelationshipsRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
        if (isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest)) {
            return
        }
	}

	ret, err := s.ListFederationRelationships(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
    if isHttpError(err, w, "Error: ", http.StatusInternalServerError) {
        return
    }

	cors(w, r)
	je := json.NewEncoder(w)
	err = je.Encode(ret)

    if isHttpError(err, w, "Error: ", http.StatusBadRequest) {
        return
    }
}

func (s *Server) federationCreate(w http.ResponseWriter, r *http.Request) {
	var input CreateFederationRelationshipRequest
	var rawInput trustdomain.BatchCreateFederationRelationshipRequest
	buf := new(strings.Builder)

	n, err, data := copyIntoBuff(buf, w, r, "Error parsing data: ")
	if n == 0 && data == "err" { return }

	if n == 0 {
		input = CreateFederationRelationshipRequest{}
	} else {
		// required to use protojson because of oneof field
		err := protojson.Unmarshal([]byte(data), &rawInput)
        if isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest) {
            return;
        }

		input = CreateFederationRelationshipRequest(rawInput) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	}

	ret, err := s.CreateFederationRelationship(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
    if isHttpError(err, w, "Error: ", http.StatusInternalServerError) {
        return
    }

	cors(w, r)
	je := json.NewEncoder(w)
	err = je.Encode(ret)
    if isHttpError(err, w, "Error: ", http.StatusBadRequest) {
        return
    }
}

func (s *Server) federationUpdate(w http.ResponseWriter, r *http.Request) {
	var input UpdateFederationRelationshipRequest
	var rawInput trustdomain.BatchUpdateFederationRelationshipRequest
	buf := new(strings.Builder)

	n, err, data := copyIntoBuff(buf, w, r, "Error parsing data: ")
	if n == 0 && data == "err" { return }

	if n == 0 {
		input = UpdateFederationRelationshipRequest{}
	} else {
		err := protojson.Unmarshal([]byte(data), &rawInput)
        if isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest) {
            return
        }
		input = UpdateFederationRelationshipRequest(rawInput) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet

	}

	ret, err := s.UpdateFederationRelationship(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
    if isHttpError(err, w, "Error: ", http.StatusInternalServerError) {
        return
    }

	cors(w, r)
	je := json.NewEncoder(w)
	err = je.Encode(ret)
    if isHttpError(err, w, "Error: ", http.StatusBadRequest) {
        return
    }
}

func (s *Server) federationDelete(w http.ResponseWriter, r *http.Request) {
	var input DeleteFederationRelationshipRequest
	buf := new(strings.Builder)

	n, err, data := copyIntoBuff(buf, w, r, "Error parsing data: ")
	if n == 0 && data == "err" { return }

	if n == 0 {
		input = DeleteFederationRelationshipRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
        if isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest) {
            return
        }
	}

	ret, err := s.DeleteFederationRelationship(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
    if isHttpError(err, w, "Error: ", http.StatusInternalServerError) {
        return
    }

	cors(w, r)
	je := json.NewEncoder(w)
	err = je.Encode(ret)
    if isHttpError(err, w, "Error: ", http.StatusBadRequest) {
        return
    }
}