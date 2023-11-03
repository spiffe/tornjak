package types

// AgentInfo contains the information about agents workload attestor plugin
type AgentInfo struct {
	Spiffeid string `json:"spiffeid"`
	Plugin   string `json:"plugin"`
	Cluster  string `json:"cluster"`
}

// AgentInfoList contains the information about agents workload attestor plugin
type AgentInfoList struct {
	Agents []AgentInfo `json:"agents"`
}

// AgentEntries contains agent spiffeid and list of spiffeids of Entries
type AgentEntries struct {
	Spiffeid    string   `json:"spiffeid"`
	EntriesList []string `json:"entries_list"`
}

// AllAgentEntries contains a list of agent entry spiffeids
type AllAgentEntries struct {
	Agents []AgentEntries `json:"agents"`
}

// AgentMetadataRequest contains a list of spiffeids
type AgentMetadataRequest struct {
	Agents []string `json:"agents"`
}
