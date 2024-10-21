package spirecrd

import (
	trustdomain "github.com/spiffe/spire-api-sdk/proto/spire/api/server/trustdomain/v1"
	"fmt"
	"context"

	"k8s.io/client-go/rest"
	"k8s.io/client-go/dynamic"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"

	spirev1alpha1 "github.com/spiffe/spire-controller-manager/api/v1alpha1"
)

var gvrFederation = schema.GroupVersionResource{
	Group:    "spire.spiffe.io",
	Version:  "v1alpha1",
	Resource: "clusterfederatedtrustdomains",
}


// CRDManager defines the interface for managing CRDs
type CRDManager interface {
	// TODO add List/Create/Update/Delete functions for Federation CRD
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

type ListFederationRelationshipsRequest trustdomain.ListFederationRelationshipsRequest
type ListFederationRelationshipsResponse trustdomain.ListFederationRelationshipsResponse

func (s *SPIRECRDManager) ListClusterFederatedTrustDomains(inp ListFederationRelationshipsRequest) (ListFederationRelationshipsResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet
	fmt.Println("list crd federation endpoint hit")

	trustDomainList, err := s.kubeClient.Resource(gvrFederation).Namespace("").List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return ListFederationRelationshipsResponse{}, fmt.Errorf("error listing trust domains: %v", err)
	}

	for _, trustDomain := range trustDomainList.Items {
		var clusterFederatedTrustDomain spirev1alpha1.ClusterFederatedTrustDomain
		err := runtime.DefaultUnstructuredConverter.FromUnstructured(trustDomain.Object, &clusterFederatedTrustDomain)
		if err != nil {
			return ListFederationRelationshipsResponse{}, fmt.Errorf("error parsing trustdomain: %v", err)
		}
		fmt.Printf("Federation CRD Name: %s, Trustdomain: %s, Spec: %+v\n", clusterFederatedTrustDomain.Name, clusterFederatedTrustDomain.Spec.TrustDomain, clusterFederatedTrustDomain.Spec)
	}

	return ListFederationRelationshipsResponse{}, nil 
}
