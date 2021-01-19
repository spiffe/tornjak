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
    w.Header().Set("Access-Control-Allow-Origin", "*")
    fmt.Fprintf(w, "Welcome to the HomePage!")
    fmt.Println("Endpoint Hit: homePage")
}

func (s *Server) agentList (w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    fmt.Println("Endpoint Hit: Agent List")

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
        emsg := fmt.Sprintf("Error: %v", err.Error())
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

}



func (s *Server) agentBan (w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    fmt.Println("Endpoint Hit: Agent Ban")

    var input BanAgentRequest
    buf := new(strings.Builder)

    n, err := io.Copy(buf, r.Body)
    if err != nil {
        emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
        http.Error(w, emsg, http.StatusBadRequest)
        return
    }
    data := buf.String()

    if n == 0 {
        emsg := fmt.Sprintf("Error: no data provided")
        http.Error(w, emsg, http.StatusBadRequest)
        return
    } else {
        err := json.Unmarshal([]byte(data), &input)
        if err != nil {
            emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
            http.Error(w, emsg, http.StatusBadRequest)
            return
        }
    }

    err = s.BanAgent(input)
    if err != nil {
        emsg := fmt.Sprintf("Error listing agents: %v", err.Error())
        http.Error(w, emsg, http.StatusBadRequest)
        return
    }

    w.Write([]byte("SUCCESS"))
}

func (s *Server) agentDelete (w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    fmt.Println("Endpoint Hit: Agent Delete")

    var input DeleteAgentRequest
    buf := new(strings.Builder)

    n, err := io.Copy(buf, r.Body)
    if err != nil {
        emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
        http.Error(w, emsg, http.StatusBadRequest)
        return
    }
    data := buf.String()

    if n == 0 {
        emsg := fmt.Sprintf("Error: no data provided")
        http.Error(w, emsg, http.StatusBadRequest)
        return
    } else {
        err := json.Unmarshal([]byte(data), &input)
        if err != nil {
            emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
            http.Error(w, emsg, http.StatusBadRequest)
            return
        }
    }

    err = s.DeleteAgent(input)
    if err != nil {
        emsg := fmt.Sprintf("Error listing agents: %v", err.Error())
        http.Error(w, emsg, http.StatusBadRequest)
        return
    }

    w.Write([]byte("SUCCESS"))
}

func (s *Server) agentCreateJoinToken (w http.ResponseWriter, r *http.Request) {
    w.Header().Set("Access-Control-Allow-Origin", "*")
    fmt.Println("Endpoint Hit: Agent Create Join Token")

    var input CreateJoinTokenRequest
    buf := new(strings.Builder)

    n, err := io.Copy(buf, r.Body)
    if err != nil {
        emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
        http.Error(w, emsg, http.StatusBadRequest)
        return
    }
    data := buf.String()

    if n == 0 {
        input = CreateJoinTokenRequest{}
    } else {
        err := json.Unmarshal([]byte(data), &input)
        if err != nil {
            emsg := fmt.Sprintf("Error parsing data: %v", err.Error())
            http.Error(w, emsg, http.StatusBadRequest)
            return
        }
    }

    ret, err := s.CreateJoinToken(input)
    if err != nil {
        emsg := fmt.Sprintf("Error: %v", err.Error())
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

}

func Cors(w http.ResponseWriter, r *http.Request) {
  w.Header().Set("Access-Control-Allow-Origin", "*")
}


func (s *Server) HandleRequests() {
    http.HandleFunc("/", s.homePage)
    http.HandleFunc("/agent/list", s.agentList)
    http.HandleFunc("/agent/ban", s.agentBan)
    http.HandleFunc("/agent/delete", s.agentDelete)
    http.HandleFunc("/agent/createjointoken", s.agentCreateJoinToken)
    log.Fatal(http.ListenAndServe(":10000", nil))
}
