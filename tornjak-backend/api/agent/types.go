package api

import (
	"github.com/hashicorp/hcl/hcl/ast"
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
	Server  *serverConfig `hcl:"server"`
	Plugins *ast.Node     `hcl:"plugins"`
}

/* Server configuration*/

type serverConfig struct {
	SPIRESocket	string		`hcl:"spire_socket_path"`
	HttpConfig	*httpConfig	`hcl:"http"`
	TlsConfig 	*tlsConfig	`hcl:"tls"`
	MtlsConfig	*mtlsConfig	`hcl:"mtls"`
}

type httpConfig struct {
	Enabled		bool	`hcl:"enabled"`
	ListenPort	int	`hcl:"port"`
}

type tlsConfig struct {
	Enabled		bool	`hcl:"enabled"`
	ListenPort	int	`hcl:"port"`
	Cert		string	`hcl:"cert"`
	Key		string	`hcl:"key"`
}

type mtlsConfig struct {
	Enabled		bool	`hcl:"enabled"`
	ListenPort	int	`hcl:"port"`
	Cert		string	`hcl:"cert"`
	Key		string	`hcl:"key"`
	Ca		string	`hcl:"ca"`
}

/* Plugin types */
type pluginDataStoreSQL struct {
	Drivername string `json:"drivername"`
	Filename   string `json:"filename"`
}

type pluginAuthKeycloak struct {
	JwksURL     string
	RedirectURL string
}

