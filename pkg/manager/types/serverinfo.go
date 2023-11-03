package types

import (
	"crypto/tls"
	"crypto/x509"
	"github.com/pkg/errors"
	"net/http"
)

func (s ServerInfo) HttpClient() (*http.Client, error) {
	if s.TLS || s.MTLS {
		// Create a CA certificate pool and add cert.pem to it
		caCert := s.CA

		// TODO: allow use of generic cert authorities
		if len(s.CA) == 0 {
			return nil, errors.New("Cannot configure TLS if CA is not provided")
		}
		caCertPool := x509.NewCertPool()
		caCertPool.AppendCertsFromPEM(caCert)

		var mTLSCerts []tls.Certificate = nil
		if s.MTLS {
			// TODO: Add ability to support different cert for mTLS
			if len(s.Cert) == 0 || len(s.Key) == 0 {
				return nil, errors.New("Cannot configure MTLS if not key or cert is provided")
			}
			cert, err := tls.X509KeyPair(s.Cert, s.Key)
			if err != nil {
				return nil, err
			}
			mTLSCerts = []tls.Certificate{cert}
		}

		// Create a HTTPS client and supply the created CA pool
		client := &http.Client{
			Transport: &http.Transport{
				TLSClientConfig: &tls.Config{
					RootCAs:      caCertPool,
					Certificates: mTLSCerts,
				},
			},
		}

		return client, nil
	}

	// default to no TLS
	return &http.Client{}, nil
}
