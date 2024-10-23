package spirecrd

import (
	apitypes "github.com/spiffe/spire-api-sdk/proto/spire/api/types"
	trustdomain "github.com/spiffe/spire-api-sdk/proto/spire/api/server/trustdomain/v1"
	"fmt"
	"context"

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

type ListFederationRelationshipsRequest trustdomain.ListFederationRelationshipsRequest
type ListFederationRelationshipsResponse trustdomain.ListFederationRelationshipsResponse

func (s *SPIRECRDManager) ListClusterFederatedTrustDomains(inp ListFederationRelationshipsRequest) (ListFederationRelationshipsResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet

	trustDomainList, err := s.kubeClient.Resource(gvrFederation).Namespace("").List(context.TODO(), metav1.ListOptions{})
	if err != nil {
		return ListFederationRelationshipsResponse{}, fmt.Errorf("error listing trust domains: %v", err)
	}

	var result []*apitypes.FederationRelationship
	for _, trustDomain := range trustDomainList.Items {
		// parse TrustDomain into ClusterFederatedTrustDomain object
		var clusterFederatedTrustDomain spirev1alpha1.ClusterFederatedTrustDomain
		err := runtime.DefaultUnstructuredConverter.FromUnstructured(trustDomain.Object, &clusterFederatedTrustDomain)
		if err != nil {
			return ListFederationRelationshipsResponse{}, fmt.Errorf("error parsing trustdomain: %v", err)
		}
		// parse ClusterFederatedTrustDomain object into Federation object
		federation, err := spirev1alpha1.ParseClusterFederatedTrustDomainSpec(&clusterFederatedTrustDomain.Spec)
		if err != nil {
			return ListFederationRelationshipsResponse{}, fmt.Errorf("error parsing crd spec: %v", err)
		}

		// parse Federation object into spire API object
		spireAPIFederation, err := federationRelationshipToAPI(*federation)
		if err != nil {
			return ListFederationRelationshipsResponse{}, fmt.Errorf("error parsing into spire API object: %v", err)
		}

		// place SPIRE API object into result
		result = append(result, spireAPIFederation)
	}

	return ListFederationRelationshipsResponse{
		FederationRelationships: result,
	}, nil 
}

type BatchCreateFederationRelationshipsRequest trustdomain.BatchCreateFederationRelationshipRequest
type BatchCreateFederationRelationshipsResponse trustdomain.BatchCreateFederationRelationshipResponse

func (s *SPIRECRDManager) BatchCreateClusterFederatedTrustDomains(inp BatchCreateFederationRelationshipsRequest) (BatchCreateFederationRelationshipsResponse, error) { //nolint:govet //Ignoring mutex (not being used) - sync.Mutex by value is unused for linter govet

	apiFederationList := inp.FederationRelationships
	for _, apiFederation := range apiFederationList {

		fmt.Printf("apiFederation object: %+v\n", apiFederation)

		// parse into federation object
		federation, err := federationRelationshipFromAPI(apiFederation)
		if err != nil {
			return BatchCreateFederationRelationshipsResponse{}, fmt.Errorf("error parsing into federation object: %v", err)
		}
		fmt.Printf("federation object: %+v\n", federation)

		// parse into ClusterFederatedTrustDomain object
		clusterFederatedTrustDomain, err := s.parseToClusterFederatedTrustDomain(&federation)
		if err != nil {
			return BatchCreateFederationRelationshipsResponse{}, fmt.Errorf("error parsing into clusterFederatedTrustDomain object: %v", err)
		}
		fmt.Printf("crd object: %+v\n", clusterFederatedTrustDomain)
		
	}

	return BatchCreateFederationRelationshipsResponse{}, nil 
}
