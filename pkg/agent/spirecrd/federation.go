package spirecrd

import (
	apitypes "github.com/spiffe/spire-api-sdk/proto/spire/api/types"
	trustdomain "github.com/spiffe/spire-api-sdk/proto/spire/api/server/trustdomain/v1"
	"fmt"
	"context"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime/schema"
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
		spireAPIFederation, err := unstructuredToSpireAPIFederation(trustDomain)
		if err != nil {
			return ListFederationRelationshipsResponse{}, fmt.Errorf("error parsing trustDomain: %v", err)
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

	// TODO add check on classname - should only make for a certain classname
	apiFederationList := inp.FederationRelationships
	var result []*trustdomain.BatchCreateFederationRelationshipResponse_Result
	for _, apiFederation := range apiFederationList {
		// resulting object
		successStatus := &apitypes.Status{
			Code: 0,
			Message: "OK",
		}
		failStatus := &apitypes.Status{
			Code: 1, // TODO more specific codes
			Message: "Failure",
		}

		// parse to unstructured
		createInput, err := s.spireAPIFederationToUnstructured(apiFederation)
		if err != nil {
			failStatus.Message = fmt.Sprintf("Error parsing input: %v", err)
			result = append(result, &trustdomain.BatchCreateFederationRelationshipResponse_Result {Status: failStatus})
			continue
		}

		// post ClusterFederatedTrustDomain object
		createResult, err := s.kubeClient.Resource(gvrFederation).Create(context.TODO(), createInput, metav1.CreateOptions{})
		if err != nil {
			failStatus.Message = fmt.Sprintf("Error listing trust dmoains: %v", err)
			result = append(result, &trustdomain.BatchCreateFederationRelationshipResponse_Result {Status: failStatus})
			continue
		}
		resultFederationRelationship, err := unstructuredToSpireAPIFederation(*createResult)
		if err != nil {
			failStatus.Message = fmt.Sprintf("Error parsing returned trust domain: %v", err)
			result = append(result, &trustdomain.BatchCreateFederationRelationshipResponse_Result {Status: failStatus})
			continue
		}
		resultEntry := trustdomain.BatchCreateFederationRelationshipResponse_Result{
			Status: successStatus,
			FederationRelationship: resultFederationRelationship,
		}

		result = append(result, &resultEntry)

	}
	return BatchCreateFederationRelationshipsResponse{
		Results: result,
	}, nil 
}


