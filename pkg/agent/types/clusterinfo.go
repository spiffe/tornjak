package types

// ClusterInfo contains the meta-information about clusters
// TODO include details field for extra info/tags in json format (probably a byte array)
type ClusterInfo struct {
	Name         string   `json:"name"`
	EditedName   string   `json:"editedName"`
	CreationTime string   `json:"creationTime"`
	DomainName   string   `json:"domainName"`
	ManagedBy    string   `json:"managedBy"`
	PlatformType string   `json:"platformType"`
	AgentsList   []string `json:"agentsList"`
}

type ClusterInput struct {
	ClusterInstance ClusterInfo `json:"cluster"`
}

// ClusterInfoList contains the meta-information about clusters
type ClusterInfoList struct {
	Clusters []ClusterInfo `json:"clusters"`
}
