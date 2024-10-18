package spirecrd

import (
	trustdomain "github.com/spiffe/spire-api-sdk/proto/spire/api/server/trustdomain/v1"
	"fmt"
)

// CRDManager defines the interface for managing CRDs
type CRDManager interface {
	// TODO add List/Create/Update/Delete functions for Federation CRD
	// ListClusterFederatedTrustDomain has the same signature as spire api
	ListClusterFederatedTrustDomains(ListFederationRelationshipsRequest) (ListFederationRelationshipsResponse, error)
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

type ListFederationRelationshipsRequest trustdomain.ListFederationRelationshipsRequest
type ListFederationRelationshipsResponse trustdomain.ListFederationRelationshipsResponse

func (s *SPIRECRDManager) ListClusterFederatedTrustDomains(inp ListFederationRelationshipsRequest) (ListFederationRelationshipsResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	fmt.Println("list crd federation endpoint hit")
	return ListFederationRelationshipsResponse{}, nil 
}
