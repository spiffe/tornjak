package api

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	trustdomain "github.com/spiffe/spire-api-sdk/proto/spire/api/server/trustdomain/v1"
	"google.golang.org/protobuf/encoding/protojson"
)

func (s *Server) healthcheck(w http.ResponseWriter, r *http.Request) {
	log.Printf("LOG is working")
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

// Federation APIs
func (s *Server) federationList(w http.ResponseWriter, r *http.Request) {
	var input ListFederationRelationshipsRequest
	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	if n == 0 {
		input = ListFederationRelationshipsRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}

	ret, err := s.ListFederationRelationships(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
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

func (s *Server) federationCreate(w http.ResponseWriter, r *http.Request) {
	var input CreateFederationRelationshipRequest
	var rawInput trustdomain.BatchCreateFederationRelationshipRequest
	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	if n == 0 {
		input = CreateFederationRelationshipRequest{}
	} else {
		// required to use protojson because of oneof field
		err := protojson.Unmarshal([]byte(data), &rawInput)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
		input = CreateFederationRelationshipRequest(rawInput) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	}

	ret, err := s.CreateFederationRelationship(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
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

func (s *Server) federationUpdate(w http.ResponseWriter, r *http.Request) {
	var input UpdateFederationRelationshipRequest
	var rawInput trustdomain.BatchUpdateFederationRelationshipRequest
	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	if n == 0 {
		input = UpdateFederationRelationshipRequest{}
	} else {
		err := protojson.Unmarshal([]byte(data), &rawInput)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
		input = UpdateFederationRelationshipRequest(rawInput) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet

	}

	ret, err := s.UpdateFederationRelationship(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
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

func (s *Server) federationDelete(w http.ResponseWriter, r *http.Request) {
	var input DeleteFederationRelationshipRequest
	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	if n == 0 {
		input = DeleteFederationRelationshipRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}

	ret, err := s.DeleteFederationRelationship(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
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

// Tornjak Handlers
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
