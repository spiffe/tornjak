package api

import (
	"github.com/spiffe/spire/pkg/common/catalog"
)

// TornjakServerInfo provides insight into the configuration of the SPIRE server
// where the Tornjak Agent resides
type TornjakSpireServerInfo struct {
	// Plugins is a map from plugin types to respective names of plugins configured
	Plugins map[string][]string `json:"plugins"`
	// TrustDomain specifies the trust domain of the SPIRE server configured with tornjak
	TrustDomain string `json:"trustDomain"`
	// Verbose config contains unstructure information on the config on the agent
	VerboseConfig string `json:"verboseConfig"`
}

type TornjakConfig struct {
	Server  *serverConfig               `hcl:"server"`
	Plugins *catalog.HCLPluginConfigMap `hcl:"plugins"`
}

type serverConfig struct {
}

/* Plugin types */
type pluginAuth struct {
	jwksURL string     `hcl:"jwksURL"`
	redirectURL string `hcl:"redirectURL"`
}

