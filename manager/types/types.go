package types

// ServerInfo contains the information about servers
type ServerInfo struct {
    Name string `json:"name"`
    Address string `json:"address"`
}


// ServerInfo contains the information about servers
type ServerInfoList struct {
    Servers []ServerInfo `json:"servers"`
}
