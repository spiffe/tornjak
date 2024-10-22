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
	fmt.Println("list crd federation endpoint hit")

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
		fmt.Printf("Federation CRD Name: %s, Trustdomain: %s, Spec: %+v\n", clusterFederatedTrustDomain.Name, clusterFederatedTrustDomain.Spec.TrustDomain, clusterFederatedTrustDomain.Spec)

		// parse ClusterFederatedTrustDomain object into Federation object
		federation, err := spirev1alpha1.ParseClusterFederatedTrustDomainSpec(&clusterFederatedTrustDomain.Spec)
		if err != nil {
			return ListFederationRelationshipsResponse{}, fmt.Errorf("error parsing crd spec: %v", err)
		}

		fmt.Printf("Federation object: %+v\n", federation)

		// parse Federation object into spire API object
		spireAPIFederation, err := federationRelationshipToAPI(*federation)
		if err != nil {
			return ListFederationRelationshipsResponse{}, fmt.Errorf("error parsing into spire API object: %v", err)
		}

		fmt.Printf("SPIRE Federation object: %+v\n", spireAPIFederation)

		// place SPIRE API object into result
		result = append(result, spireAPIFederation)
	}
	fmt.Printf("resulting list: %+v\n", result)

	return ListFederationRelationshipsResponse{
		FederationRelationships: result,
	}, nil 
}
