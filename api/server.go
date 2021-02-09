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
    cors(w,r)
}

func (s *Server) agentList (w http.ResponseWriter, r *http.Request) {
    fmt.Println("Endpoint Hit: Agent List")

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

    ret, err := s.ListAgents(input)
    if err != nil {
        emsg := fmt.Sprintf("Error: %v", err.Error())
        retError(w, emsg, http.StatusBadRequest)
        return
    }

    cors(w,r)
    je := json.NewEncoder(w)
    // Shouldn't error here
    je.Encode(ret)
}



func (s *Server) agentBan (w http.ResponseWriter, r *http.Request) {
    fmt.Println("Endpoint Hit: Agent Ban")

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
        emsg := fmt.Sprintf("Error: no data provided")
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

    err = s.BanAgent(input)
    if err != nil {
        emsg := fmt.Sprintf("Error listing agents: %v", err.Error())
        retError(w, emsg, http.StatusBadRequest)
        return
    }

    cors(w,r)
    w.Write([]byte("SUCCESS"))
}

func (s *Server) agentDelete (w http.ResponseWriter, r *http.Request) {
    fmt.Println("Endpoint Hit: Agent Delete")

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
        emsg := fmt.Sprintf("Error: no data provided")
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

    err = s.DeleteAgent(input)
    if err != nil {
        emsg := fmt.Sprintf("Error listing agents: %v", err.Error())
        retError(w, emsg, http.StatusBadRequest)
        return
    }

    cors(w,r)
    w.Write([]byte("SUCCESS"))
}

func (s *Server) agentCreateJoinToken (w http.ResponseWriter, r *http.Request) {
    fmt.Println("Endpoint Hit: Agent Create Join Token")

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

    ret, err := s.CreateJoinToken(input)
    if err != nil {
        emsg := fmt.Sprintf("Error: %v", err.Error())
        retError(w, emsg, http.StatusBadRequest)
        return
    }

    cors(w,r)
    je := json.NewEncoder(w)
    // Shouldn't error here
    je.Encode(ret)
}

func (s *Server) entryList (w http.ResponseWriter, r *http.Request) {
    fmt.Println("Endpoint Hit: Entry List")

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

    ret, err := s.ListEntries(input)
    if err != nil {
        emsg := fmt.Sprintf("Error: %v", err.Error())
        retError(w, emsg, http.StatusBadRequest)
        return
    }

    cors(w,r)
    je := json.NewEncoder(w)
    // Shouldn't error here
    je.Encode(ret)
}

func (s *Server) entryCreate (w http.ResponseWriter, r *http.Request) {
    fmt.Println("Endpoint Hit: Entry BatchCreate")

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

    ret, err := s.BatchCreateEntry(input)
    if err != nil {
        emsg := fmt.Sprintf("Error: %v", err.Error())
        retError(w, emsg, http.StatusBadRequest)
        return
    }


    cors(w,r)
    je := json.NewEncoder(w)
    // Shouldn't error here
    je.Encode(ret)
}



func (s *Server) entryDelete (w http.ResponseWriter, r *http.Request) {
    fmt.Println("Endpoint Hit: Entry BatchDelete")

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

    ret, err := s.BatchDeleteEntry(input)
    if err != nil {
        emsg := fmt.Sprintf("Error: %v", err.Error())
        retError(w, emsg, http.StatusBadRequest)
        return
    }


    cors(w,r)
    je := json.NewEncoder(w)
    // Shouldn't error here
    je.Encode(ret)
}




func cors(w http.ResponseWriter, _ *http.Request) {
  w.Header().Set("Content-Type", "text/html; charset=ascii")
  w.Header().Set("Access-Control-Allow-Origin", "*")
  w.Header().Set("Access-Control-Allow-Headers","Content-Type,access-control-allow-origin, access-control-allow-headers")
  w.WriteHeader(http.StatusOK)
}

func retError(w http.ResponseWriter, emsg string, status int) {
  w.Header().Set("Content-Type", "text/html; charset=ascii")
  w.Header().Set("Access-Control-Allow-Origin", "*")
  w.Header().Set("Access-Control-Allow-Headers","Content-Type,access-control-allow-origin, access-control-allow-headers")
  http.Error(w, emsg, status)
}



// Handle preflight checks
func corsHandler(f func(w http.ResponseWriter, r *http.Request)) http.HandlerFunc {
  return func(w http.ResponseWriter, r *http.Request) {
    if (r.Method == "OPTIONS") {
        cors(w,r)
        return
    } else {
      f(w,r)
    }
  }
}

func (s *Server) HandleRequests() {

    // Agents
    http.HandleFunc("/api/agent/list", corsHandler(s.agentList))
    http.HandleFunc("/api/agent/ban", corsHandler(s.agentBan))
    http.HandleFunc("/api/agent/delete", corsHandler(s.agentDelete))
    http.HandleFunc("/api/agent/createjointoken", corsHandler(s.agentCreateJoinToken))
    
    // Entries
    http.HandleFunc("/api/entry/list", corsHandler(s.entryList))
    http.HandleFunc("/api/entry/create", corsHandler(s.entryCreate))
    http.HandleFunc("/api/entry/delete", corsHandler(s.entryDelete))

    // UI
    //http.HandleFunc("/", s.homePage)
    http.Handle("/", http.FileServer(http.Dir("./ui-agent")))

    fmt.Println("Starting to listen...")
    log.Fatal(http.ListenAndServe(":10000", nil))
}
