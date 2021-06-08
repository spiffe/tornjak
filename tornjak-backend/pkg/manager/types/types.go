package types

// ServerInfo contains the information about servers
type ServerInfo struct {
	Name    string `json:"name"`
	Address string `json:"address"`
	TLS     bool   `json:"tls"`
	MTLS    bool   `json:"mtls"`
	CA      []byte `json:"ca,omitempty"`
	Cert    []byte `json:"cert,omitempty"`
	Key     []byte `json:"key,omitempty"`
}

// ServerInfo contains the information about servers
type ServerInfoList struct {
	Servers []ServerInfo `json:"servers"`
}
