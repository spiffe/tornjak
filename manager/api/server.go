package managerapi

import (
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"strings"

	"github.com/gorilla/mux"
	managerdb "github.com/lumjjb/tornjak/manager/db"
)

var (
	jsonContentType string = "application/json"
)

type Server struct {
	listenAddr string
	db         managerdb.ManagerDB
}

func (_ *Server) homePage(w http.ResponseWriter, r *http.Request) {
	fmt.Fprintf(w, "Welcome to the HomePage!")
	fmt.Println("Endpoint Hit: homePage")
	cors(w, r)
}

// Handle preflight checks
func corsHandler(f func(w http.ResponseWriter, r *http.Request)) http.HandlerFunc {
	return func(w http.ResponseWriter, r *http.Request) {
		if r.Method == "OPTIONS" {
			cors(w, r)
			return
		} else {
			f(w, r)
		}
	}
}

func cors(w http.ResponseWriter, _ *http.Request) {
	w.Header().Set("Content-Type", "text/html; charset=ascii")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type,access-control-allow-origin, access-control-allow-headers")
	w.WriteHeader(http.StatusOK)
}

func retError(w http.ResponseWriter, emsg string, status int) {
	w.Header().Set("Content-Type", "text/html; charset=ascii")
	w.Header().Set("Access-Control-Allow-Origin", "*")
	w.Header().Set("Access-Control-Allow-Headers", "Content-Type,access-control-allow-origin, access-control-allow-headers")
	http.Error(w, emsg, status)
}

func copyHeader(dst, src http.Header) {
	for k, vv := range src {
		for _, v := range vv {
			dst.Add(k, v)
		}
	}
}

// Returns a post proxy function for tornjak api, where path is the path from the base URL, i.e. "/api/entry/delete"
func (s *Server) apiServerProxyFunc(apiPath string) func(w http.ResponseWriter, r *http.Request) {
	return func(w http.ResponseWriter, r *http.Request) {
		vars := mux.Vars(r)
		serverName := vars["server"]

		fmt.Println(serverName)

		// Get server info
		sinfo, err := s.db.GetServer(serverName)
		if err != nil {
			emsg := fmt.Sprintf("Error getting server info: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
		fmt.Printf("%+v\n", sinfo)

		client, err := sinfo.HttpClient()
		if err != nil {
			emsg := fmt.Sprintf("Error initializing server client: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}

		resp, err := client.Post(strings.TrimSuffix(sinfo.Address, "/")+apiPath, jsonContentType, r.Body)
		if err != nil {
			emsg := fmt.Sprintf("Error making api call to server: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
		defer resp.Body.Close()
		copyHeader(w.Header(), resp.Header)
		w.WriteHeader(resp.StatusCode)
		io.Copy(w, resp.Body)
	}
}

func (s *Server) HandleRequests() {
	// TO implement
	rtr := mux.NewRouter()

	rtr.HandleFunc("/manager-api/server/list", corsHandler(s.serverList))
	rtr.HandleFunc("/manager-api/server/register", corsHandler(s.serverRegister))
	rtr.HandleFunc("/manager-api/entry/list/{server:.*}", corsHandler(s.apiServerProxyFunc("/api/entry/list")))
	rtr.HandleFunc("/manager-api/entry/delete/{server:.*}", corsHandler(s.apiServerProxyFunc("/api/entry/delete")))
	rtr.HandleFunc("/manager-api/entry/create/{server:.*}", corsHandler(s.apiServerProxyFunc("/api/entry/create")))
	rtr.HandleFunc("/manager-api/agent/list/{server:.*}", corsHandler(s.apiServerProxyFunc("/api/agent/list")))
	rtr.HandleFunc("/manager-api/agent/delete/{server:.*}", corsHandler(s.apiServerProxyFunc("/api/agent/delete")))
	rtr.HandleFunc("/manager-api/agent/ban/{server:.*}", corsHandler(s.apiServerProxyFunc("/api/agent/ban")))
	rtr.HandleFunc("/manager-api/agent/createjointoken/{server:.*}", corsHandler(s.apiServerProxyFunc("/api/agent/createjointoken")))
	rtr.HandleFunc("/manager-api/tornjak/serverinfo/{server:.*}", corsHandler(s.apiServerProxyFunc("/api/tornjak/serverinfo")))

	//http.HandleFunc("/manager-api/get-server-info", s.agentList)
	//http.HandleFunc("/manager-api/agent/list/:id", s.agentList)

	http.Handle("/manager-api/", rtr)
	http.Handle("/", http.FileServer(http.Dir("./ui-manager")))
	fmt.Println("Starting to listen...")
	log.Fatal(http.ListenAndServe(s.listenAddr, nil))
}

/*

func main() {
  rtr := mux.NewRouter()
  rtr.HandleFunc("/number/{id:[0-9]+}", pageHandler)
  http.Handle("/", rtr)
  http.ListenAndServe(PORT, nil)
}
*/

// NewManagerServer returns a new manager server, given a listening address for the
// server, and a DB connection string
func NewManagerServer(listenAddr, dbString string) (*Server, error) {
	db, err := managerdb.NewLocalSqliteDB(dbString)
	if err != nil {
		return nil, err
	}
	return &Server{
		listenAddr: listenAddr,
		db:         db,
	}, nil
}

func (s *Server) serverList(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint Hit: Server List")

	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	var input ListServersRequest
	if n == 0 {
		input = ListServersRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}

	ret, err := s.ListServers(input)
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	cors(w, r)

	je := json.NewEncoder(w)
	je.Encode(ret)
}

func (s *Server) serverRegister(w http.ResponseWriter, r *http.Request) {
	fmt.Println("Endpoint Hit: Server Create")

	buf := new(strings.Builder)

	n, err := io.Copy(buf, r.Body)
	if err != nil {
		emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}
	data := buf.String()

	var input RegisterServerRequest
	if n == 0 {
		input = RegisterServerRequest{}
	} else {
		err := json.Unmarshal([]byte(data), &input)
		if err != nil {
			emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
			retError(w, emsg, http.StatusBadRequest)
			return
		}
	}

	err = s.RegisterServer(input)
	if err != nil {
		emsg := fmt.Sprintf("Error: %v", err.Error())
		retError(w, emsg, http.StatusBadRequest)
		return
	}

	cors(w, r)
	w.Write([]byte("SUCCESS"))
}
