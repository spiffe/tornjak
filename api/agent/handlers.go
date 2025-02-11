package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"strings"
)

// Checks for httpError; meant to replace the (about) 4 chunks of error checking code run per function
/* @param status can be: 
	1 -> http.StatusBadRequest
	2 -> http.StatusInternalServerError

   @param emsg can be one of three:
	1 -> "Error parsing data: %v", err.Error()
	2 -> "Error: %v", err.Error()
	3 -> "Error listing agents: %v", err.Error()
	NOTE: Error message 1 ONLY returns with http.StatusBadRequest. Messages 2 and 3 can return with either
*/
func isHttpError(err error, w http.ResponseWriter, emsg string, status int) (bool){
	if err != nil {
        retError(w, emsg + fmt.Sprintf("%v",err.Error()), status);
		return true
	}
	return false
}

// meant to replace the 4 lines of code repeated throughout most functions
	// that copies the body of http.Request into buf and returns results in n and err
/* @param emsg can be one of three:
	1 -> "Error parsing data: %v", err.Error()
	2 -> "Error: %v", err.Error()
	3 -> "Error listing agents: %v", err.Error()
*/
func copyIntoBuff(buf *strings.Builder, w http.ResponseWriter, r *http.Request, emsg string) (int64, error, string){
	fmt.Print("made it 2")
	n, err := io.Copy(buf, r.Body)
	isErr := isHttpError(err, w, emsg + fmt.Sprintf("%v", err.Error()), http.StatusBadRequest)
	if isErr {return 0, err, "err"}
	data := buf.String()

	return n, err, data
}

// Gets called from GetRouter func in server.go
// http is a type of command that the server can take that starts the server
// Gives an explicit return only if an error is countered
	// otherwise, since no return is outlined, no return is necessary
func (s *Server) healthcheck(w http.ResponseWriter, r *http.Request) {

	// To store the HealthcheckRequest we get from grpc
	var input HealthcheckRequest
	buf := new(strings.Builder)

	// copies body of http.Request into buf
	// and then puts the # of bytes of type int64 into n and an error into err
	// err is nil if there was no error
	// n is 0 and data is "err" if err was not nil inside of copyIntoBuff
	fmt.Print("made it 1")
	n, err, data := copyIntoBuff(buf, w, r, "Error parsing data: ")
	fmt.Print("made it 3")
	if n == 0 && data == "err" { return }

	// if the body of the request was empty
	if n == 0 {
		input = HealthcheckRequest{}

	// else if the body was NOT empty
	// unmarshal the JSON and check for errors
	} else {
		err := json.Unmarshal([]byte(data), &input)
		isErr := isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest)
		if isErr {return}
	}

	// ret gets the address to the HealthcheckReponse response
		// the HealthcheckResponse is actually the response of the server "input" as returned by grpc's HealthClient.Check()
	ret, err := s.SPIREHealthcheck(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	isErr := isHttpError(err, w, "Error: ", http.StatusInternalServerError)
	if isErr {return}

	// Sets the headers associated with the request to specific values
	/*
		"Content-Type" --> "application/json;charset=UTF-8"
		"Access-Control-Allow-Origin" --> "*"
		"Access-Control-Allow-Methods" --> "POST, GET, OPTIONS, DELETE, PATCH"
		"Access-Control-Allow-Headers" --> "Content-Type, access-control-allow-origin, access-control-allow-headers, access-control-allow-credentials, Authorization, access-control-allow-methods"
		"Access-Control-Expose-Headers" --> "*, Authorization"
	*/
	cors(w, r)

	// Creates an Encoder object pointer that will be writing to http.ResponseWriter w
	je := json.NewEncoder(w)

	// writing the JSON encoing of ret 
		// (address to the HealtheckResponse of whatever server we're checking) 
		// to http.ResponseWriter w
	err = je.Encode(ret)
	
	// if the Encode failed
	isErr = isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}

	// if we never return an error, then all is well!
}

func (s *Server) debugServer(w http.ResponseWriter, r *http.Request) {
	input := DebugServerRequest{} // HARDCODED INPUT because there are no fields to DebugServerRequest

	ret, err := s.DebugServer(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	isErr := isHttpError(err, w, "Error: ", http.StatusInternalServerError)
	if isErr {return}

	cors(w, r)
	je := json.NewEncoder(w)

	err = je.Encode(ret)
	isErr = isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}
}

func (s *Server) agentList(w http.ResponseWriter, r *http.Request) {
	var input ListAgentsRequest
	buf := new(strings.Builder)

	n, err, data := copyIntoBuff(buf, w, r, "Error parsing data: ")
	if n == 0 && data == "err" { return }

	if n == 0 {
		input = ListAgentsRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		isErr := isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest)
		if isErr {return}
	}

	ret, err := s.ListAgents(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	isErr := isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}

	cors(w, r)
	je := json.NewEncoder(w)

	err = je.Encode(ret)
	isErr = isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}

}

func (s *Server) agentBan(w http.ResponseWriter, r *http.Request) {
	var input BanAgentRequest
	buf := new(strings.Builder)

	n, err, data := copyIntoBuff(buf, w, r, "Error parsing data: ")
	if n == 0 && data == "err" { return }

	if n == 0 {
		emsg := "Error: no data provided"
		retError(w, emsg, http.StatusBadRequest)
		return
	} else {
		err := json.Unmarshal([]byte(data), &input)
		isErr := isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest)
		if isErr {return}
	}

	err = s.BanAgent(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	isErr := isHttpError(err, w, "Error listing agents: ", http.StatusInternalServerError)
	if isErr {return}

	cors(w, r)
	_, err = w.Write([]byte("SUCCESS"))

	isErr = isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}

}

func (s *Server) agentDelete(w http.ResponseWriter, r *http.Request) {
	// TODO update backend to also delete agent metadata

	var input DeleteAgentRequest
	buf := new(strings.Builder)

	n, err, data := copyIntoBuff(buf, w, r, "Error parsing data: ")
	if n == 0 && data == "err" { return }

	if n == 0 {
		emsg := "Error: no data provided"
		retError(w, emsg, http.StatusBadRequest)
		return
	} else {
		err := json.Unmarshal([]byte(data), &input)
		isErr := isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest)
		if isErr {return}
	}

	err = s.DeleteAgent(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	isErr := isHttpError(err, w, "Error listing agents: ", http.StatusInternalServerError)
	if isErr {return}

	cors(w, r)
	_, err = w.Write([]byte("SUCCESS"))

	isErr = isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}

}

func (s *Server) agentCreateJoinToken(w http.ResponseWriter, r *http.Request) {
	var input CreateJoinTokenRequest
	buf := new(strings.Builder)

	n, err, data := copyIntoBuff(buf, w, r, "Error parsing data: ")
	if n == 0 && data == "err" { return }

	if n == 0 {
		input = CreateJoinTokenRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		isErr := isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest)
		if isErr {return}
	}

	ret, err := s.CreateJoinToken(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	isErr := isHttpError(err, w, "Error: ", http.StatusInternalServerError)
	if isErr {return}

	cors(w, r)
	je := json.NewEncoder(w)
	err = je.Encode(ret)
	isErr = isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}

}

func (s *Server) entryList(w http.ResponseWriter, r *http.Request) {
	var input ListEntriesRequest
	buf := new(strings.Builder)

	n, err, data := copyIntoBuff(buf, w, r, "Error parsing data: ")
	if n == 0 && data == "err" { return }

	if n == 0 {
		input = ListEntriesRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		isErr := isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest)
		if isErr {return}
	}

	ret, err := s.ListEntries(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	isErr := isHttpError(err, w, "Error: ", http.StatusInternalServerError)
	if isErr {return}

	cors(w, r)
	je := json.NewEncoder(w)
	err = je.Encode(ret)
	isErr = isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}

}

func (s *Server) entryCreate(w http.ResponseWriter, r *http.Request) {
	var input BatchCreateEntryRequest
	buf := new(strings.Builder)

	n, err, data := copyIntoBuff(buf, w, r, "Error parsing data: ")
	if n == 0 && data == "err" { return }

	if n == 0 {
		input = BatchCreateEntryRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		isErr := isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest)
		if isErr {return}
	}

	ret, err := s.BatchCreateEntry(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	isErr := isHttpError(err, w, "Error: ", http.StatusInternalServerError)
	if isErr {return}

	cors(w, r)
	je := json.NewEncoder(w)
	err = je.Encode(ret)
	isErr = isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}

}

func (s *Server) entryDelete(w http.ResponseWriter, r *http.Request) {
	var input BatchDeleteEntryRequest
	buf := new(strings.Builder)

	n, err, data := copyIntoBuff(buf, w, r, "Error parsing data: ")
	if n == 0 && data == "err" { return }

	if n == 0 {
		input = BatchDeleteEntryRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		isErr := isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest)
		if isErr {return}
	}

	ret, err := s.BatchDeleteEntry(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	isErr := isHttpError(err, w, "Error: ", http.StatusInternalServerError)
	if isErr {return}

	cors(w, r)
	je := json.NewEncoder(w)
	err = je.Encode(ret)
	isErr = isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}
}

// Bundle APIs
func (s *Server) bundleGet(w http.ResponseWriter, r *http.Request) {
	var input GetBundleRequest
	buf := new(strings.Builder)

	n, err, data := copyIntoBuff(buf, w, r, "Error parsing data: ")
	if n == 0 && data == "err" { return }

	if n == 0 {
		input = GetBundleRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		isErr := isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest)
		if isErr {return}
	}

	ret, err := s.GetBundle(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	isErr := isHttpError(err, w, "Error: ", http.StatusInternalServerError)
	if isErr {return}

	cors(w, r)
	je := json.NewEncoder(w)
	err = je.Encode(ret)
	isErr = isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}
}

func (s *Server) federatedBundleList(w http.ResponseWriter, r *http.Request) {
	var input ListFederatedBundlesRequest
	buf := new(strings.Builder)

	n, err, data := copyIntoBuff(buf, w, r, "Error parsing data: ")
	if n == 0 && data == "err" { return }

	if n == 0 {
		input = ListFederatedBundlesRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		isErr := isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest)
		if isErr {return}
	}

	ret, err := s.ListFederatedBundles(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	isErr := isHttpError(err, w, "Error: ", http.StatusInternalServerError)
	if isErr {return}

	cors(w, r)
	je := json.NewEncoder(w)
	err = je.Encode(ret)
	isErr = isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}
}

func (s *Server) federatedBundleCreate(w http.ResponseWriter, r *http.Request) {
	var input CreateFederatedBundleRequest
	buf := new(strings.Builder)

	n, err, data := copyIntoBuff(buf, w, r, "Error parsing data: ")
	if n == 0 && data == "err" { return }

	if n == 0 {
		input = CreateFederatedBundleRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		isErr := isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest)
		if isErr {return}
	}

	ret, err := s.CreateFederatedBundle(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	isErr := isHttpError(err, w, "Error: ", http.StatusInternalServerError)
	if isErr {return}

	cors(w, r)
	je := json.NewEncoder(w)
	err = je.Encode(ret)
	isErr = isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}
}

func (s *Server) federatedBundleUpdate(w http.ResponseWriter, r *http.Request) {
	var input UpdateFederatedBundleRequest
	buf := new(strings.Builder)

	n, err, data := copyIntoBuff(buf, w, r, "Error parsing data: ")
	if n == 0 && data == "err" { return }

	if n == 0 {
		input = UpdateFederatedBundleRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		isErr := isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest)
		if isErr {return}
	}

	ret, err := s.UpdateFederatedBundle(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	isErr := isHttpError(err, w, "Error: ", http.StatusInternalServerError)
	if isErr {return}

	cors(w, r)
	je := json.NewEncoder(w)
	err = je.Encode(ret)
	isErr = isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}
}

func (s *Server) federatedBundleDelete(w http.ResponseWriter, r *http.Request) {
	var input DeleteFederatedBundleRequest
	buf := new(strings.Builder)

	n, err, data := copyIntoBuff(buf, w, r, "Error parsing data: ")
	if n == 0 && data == "err" { return }
	if n == 0 {
		input = DeleteFederatedBundleRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		isErr := isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest)
		if isErr {return}
	}

	ret, err := s.DeleteFederatedBundle(input) //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	isErr := isHttpError(err, w, "Error: ", http.StatusInternalServerError)
	if isErr {return}

	cors(w, r)
	je := json.NewEncoder(w)
	err = je.Encode(ret)
	isErr = isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}
}

// Tornjak Handlers
func (s *Server) home(w http.ResponseWriter, r *http.Request) {
	var ret = "Welcome to the Tornjak Backend!"

	cors(w, r)
	je := json.NewEncoder(w)

	var err = je.Encode(ret)
	isErr := isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}
}

func (s *Server) health(w http.ResponseWriter, r *http.Request) {
	var ret = "Endpoint is healthy."

	cors(w, r)
	je := json.NewEncoder(w)

	var err = je.Encode(ret)
	isErr := isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}
}

func (s *Server) tornjakSelectorsList(w http.ResponseWriter, r *http.Request) {
	buf := new(strings.Builder)

	n, err, data := copyIntoBuff(buf, w, r, "Error parsing data: ")
	if n == 0 && data == "err" { return }

	var input ListSelectorsRequest

	if n == 0 {
		input = ListSelectorsRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		isErr := isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest)
		if isErr {return}
	}

	ret, err := s.ListSelectors(input)
	isErr := isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}

	cors(w, r)

	je := json.NewEncoder(w)
	err = je.Encode(ret)
	isErr = isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}
}

func (s *Server) tornjakPluginDefine(w http.ResponseWriter, r *http.Request) {
	buf := new(strings.Builder)

	n, err, data := copyIntoBuff(buf, w, r, "Error parsing data: ")
	if n == 0 && data == "err" { return }

	var input RegisterSelectorRequest

	if n == 0 {
		input = RegisterSelectorRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		isErr := isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest)
		if isErr {return}
	}

	err = s.DefineSelectors(input)
	isErr := isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}

	cors(w, r)

	_, err = w.Write([]byte("SUCCESS"))
	isErr = isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}
}

func (s *Server) tornjakAgentsList(w http.ResponseWriter, r *http.Request) {
	buf := new(strings.Builder)

	n, err, data := copyIntoBuff(buf, w, r, "Error parsing data: ")
	if n == 0 && data == "err" { return }
	
	var input ListAgentMetadataRequest

	if n == 0 {
		input = ListAgentMetadataRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		isErr := isHttpError(err, w, "Error parsing data: ", http.StatusBadRequest)
		if isErr {return}
	}

	ret, err := s.ListAgentMetadata(input)
	isErr := isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}

	cors(w, r)

	je := json.NewEncoder(w)
	err = je.Encode(ret)
	isErr = isHttpError(err, w, "Error: ", http.StatusBadRequest)
	if isErr {return}
}
