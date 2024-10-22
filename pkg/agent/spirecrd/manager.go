package spirecrd

import (
	"fmt"
	"k8s.io/client-go/rest"
	"k8s.io/client-go/dynamic"
)

// CRDManager defines the interface for managing CRDs
type CRDManager interface {
	// TODO add Create/Update/Delete functions for Federation CRD
	// ListClusterFederatedTrustDomain has the same signature as spire api
	ListClusterFederatedTrustDomains(ListFederationRelationshipsRequest) (ListFederationRelationshipsResponse, error)
}

type SPIRECRDManager struct {
	className string
	kubeClient *dynamic.DynamicClient
}

// NewSPIRECRDManager initializes new SPIRECRDManager
func NewSPIRECRDManager(className string) (*SPIRECRDManager, error) {
	// assume in-cluster
	config, err := rest.InClusterConfig()
	if err != nil {
		return nil, fmt.Errorf("error with in-cluster config: %v", err)
	}
	// create client
	kubeClient, err := dynamic.NewForConfig(config)
	if err != nil {
		return nil, fmt.Errorf("error creating kube client: %v", err)
	}

	return &SPIRECRDManager{
		className: className,
		kubeClient: kubeClient,
	}, nil
}

