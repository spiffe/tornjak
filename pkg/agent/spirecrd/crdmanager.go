package spirecrd

import (
	trustdomain "github.com/spiffe/spire-api-sdk/proto/spire/api/server/trustdomain/v1"
	"fmt"
	"context"

	"k8s.io/client-go/rest"
	"k8s.io/client-go/dynamic"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
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

	// assume in-cluster
	config, err := rest.InClusterConfig()
	if err != nil {
		return ListFederationRelationshipsResponse{}, fmt.Errorf("error with in-cluster config: %v", err)
	}
	// create client
	kubeClient, err := dynamic.NewForConfig(config)
	if err != nil {
		return ListFederationRelationshipsResponse{}, fmt.Errorf("error creating kube client: %v", err)
	}

	// define CRD's Group Version Resource
	gvr :=schema.GroupVersionResource {
		Group: "spire.spiffe.io",
		Version: "v1alpha1",
		Resource: "ClusterFederatedTrustDomains",
	}

	trustDomainList, err := kubeClient.Resource(gvr).Namespace("").List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return ListFederationRelationshipsResponse{}, fmt.Errorf("error listing trust domains: %v", err)
	}

	fmt.Printf("Listed trust domains: %v \n", trustDomainList)
	return ListFederationRelationshipsResponse{}, nil 
}
