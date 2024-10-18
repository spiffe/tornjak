package spirecrd

import (
	trustdomain "github.com/spiffe/spire-api-sdk/proto/spire/api/server/trustdomain/v1"
)

// CRDManager defines the interface for managing CRDs
type CRDManager interface {
	// TODO add List/Create/Update/Delete functions for Federation CRD
	// ListClusterFederatedTrustDomain has the same signature as spire api
	ListClusterFederatedTrustDomain(trustdomain.ListFederationRelationshipsRequest) (trustdomain.ListFederationRelationshipsResponse, error)
}

type SPIRECRDManager struct {
	className string
}

// NewSPIRECRDManager initializes new SPIRECRDManager
func NewSPIRECRDManager(className string) (*SPIRECRDManager, error) {
	return &SPIRECRDManager{
		className: className,
	}, nil
}

func (s *SPIRECRDManager) ListClusterFederatedTrustDomain(inp trustdomain.ListFederationRelationshipsRequest) (trustdomain.ListFederationRelationshipsResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	return trustdomain.ListFederationRelationshipsResponse{}, nil
}
