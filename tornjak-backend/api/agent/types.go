package api

// TornjakServerInfo provides insight into the configuration of the SPIRE server
// where the Tornjak Agent resides
type TornjakServerInfo struct {
	// Plugins is a map from plugin types to respective names of plugins configured
	Plugins map[string][]string `json:"plugins"`
	// TrustDomain specifies the trust domain of the SPIRE server configured with tornjak
	TrustDomain string `json:"trustDomain"`
	// Verbose config contains unstructure information on the config on the agent
	VerboseConfig string `json:"verboseConfig"`
}

/*type Config struct {
	SQLDriver   string `json:"sqldriver"`
	SQLFilename string `json:"sqlfilename"`

	AuthEnabled bool   `json:"authenabled"`
	JWKSUrl     string `json:"authjwks"`
	RedirectURL string `json:"authredirect"`
}*/

type TornjakConfig struct {
	SQLDriver   string         `hcl:"sqldriver"`
	SQLFilename string         `hcl:"sqlfilename"`

	Plugins     []PluginConfig `hcl:"plugins"`
}

type PluginConfig struct {
	PluginType string            `hcl:"plugin_type"`
	PluginName string            `hcl:"plugin_name"`
	PluginData map[string]string `hcl:"plugin_data"`
}
