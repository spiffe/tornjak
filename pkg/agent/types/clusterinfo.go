package types

// ClusterInfo contains the meta-information about clusters
// TODO include details field for extra info/tags in json format (probably a byte array)
type ClusterInfo struct {
	UID          string   `json:"uid"`
	Name         string   `json:"name"`
	EditedName   string   `json:"edited_name"` // Add this field for the edited cluster name
	CreationTime string   `json:"created_time"`
	DomainName   string   `json:"domain_name"`
	ManagedBy    string   `json:"managed_by"`
	PlatformType string   `json:"platform_type"`
	AgentsList   []string `json:"agents_list"`
}

type ClusterInput struct {
	ClusterInstance ClusterInfo `json:"cluster"`
}

// ClusterInfoList contains the meta-information about clusters
type ClusterInfoList struct {
	Clusters []ClusterInfo `json:"clusters"`
}
