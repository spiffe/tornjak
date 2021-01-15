package api

import (
    "fmt"
    "log"
    "net/http"
    "encoding/json"
    "strings"
    "io"
)

type Server struct {
    SpireServerAddr string
}

func (_ *Server) homePage(w http.ResponseWriter, r *http.Request){
    fmt.Fprintf(w, "Welcome to the HomePage!")
    fmt.Println("Endpoint Hit: homePage")
}

func (s *Server) agentList (w http.ResponseWriter, r *http.Request) {
    var input ListAgentsRequest
    buf := new(strings.Builder)

    n, err := io.Copy(buf, r.Body)
    if err != nil {
        emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
        http.Error(w, emsg, http.StatusBadRequest)
        return
    }
    data := buf.String()

    if n == 0 {
        input = ListAgentsRequest{}
    } else {
        err := json.Unmarshal([]byte(data), &input)
        if err != nil {
            emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
            http.Error(w, emsg, http.StatusBadRequest)
            return
        }
    }

    ret, err := s.ListAgents(input)
    if err != nil {
        emsg := fmt.Sprintf("Error listing agents: %v", err.Error())
        http.Error(w, emsg, http.StatusBadRequest)
        return
    }

    je := json.NewEncoder(w)
    err = je.Encode(ret)
    if err != nil {
        emsg := fmt.Sprintf("Error encoding output: %v", err.Error())
        http.Error(w, emsg, http.StatusBadRequest)
        return
    }

    fmt.Println("Endpoint Hit: Agent List")
}

func (s *Server) HandleRequests() {
    http.HandleFunc("/", s.homePage)
    http.HandleFunc("/agent/list", s.agentList)
    log.Fatal(http.ListenAndServe(":10000", nil))
}
