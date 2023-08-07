package api

import (
	"crypto/tls"
	"crypto/x509"
	"fmt"
	"os"

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
	SPIRESocket string       `hcl:"spire_socket_path"`
	HTTPConfig  *HTTPConfig  `hcl:"http"`
	HTTPSConfig *HTTPSConfig `hcl:"https"`
}

type HTTPConfig struct {
	ListenPort int `hcl:"port"`
}

type HTTPSConfig struct {
	ListenPort int `hcl:"port"`
	Cert	   string `hcl:"cert"`
	Key 	   string `hcl:"key"`
	ClientCA   string `hcl:"client_ca"`
}

func (h HTTPSConfig) Parse() (*tls.Config, error) {
	serverCertPath := h.Cert
	serverKeyPath := h.Key
	clientCAPath := h.ClientCA

	mtls := (clientCAPath != "")

	if _, err := os.Stat(serverCertPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("server cert path '%s': %w", serverCertPath, err)
	}
	if _, err := os.Stat(serverKeyPath); os.IsNotExist(err) {
		return nil, fmt.Errorf("server key path '%s': %w", serverKeyPath, err)
	}

	// Create a CA certificate pool and add cert.pem to it
	serverCert, err := os.ReadFile(serverCertPath)
	if err != nil {
		return nil, fmt.Errorf("server ca pool error: %w", err)
	}
	caCertPool := x509.NewCertPool()
	caCertPool.AppendCertsFromPEM(serverCert)

	if mtls {
		// add mTLS CA path to cert pool as well
		if _, err := os.Stat(clientCAPath); os.IsNotExist(err) {
			return nil, fmt.Errorf("server file does not exist %s", clientCAPath)
		}
		clientCA, err := os.ReadFile(clientCAPath)
		if err != nil {
			return nil, fmt.Errorf("server: could not read file %s: %w", clientCAPath, err)
		}
		caCertPool.AppendCertsFromPEM(clientCA)
	}

	// Create the TLS Config with the CA pool and enable Client certificate validation
	tlsConfig := &tls.Config{
		ClientCAs: caCertPool,
	}

	if mtls {
		tlsConfig.ClientAuth = tls.RequireAndVerifyClientCert
	}
	//tlsConfig.BuildNameToCertificate()

	return tlsConfig, nil
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
