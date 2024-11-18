package spirecrd

import (
	apitypes "github.com/spiffe/spire-api-sdk/proto/spire/api/types"
	trustdomain "github.com/spiffe/spire-api-sdk/proto/spire/api/server/trustdomain/v1"
	"fmt"
	"context"

	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"
	"k8s.io/apimachinery/pkg/runtime"
	"k8s.io/apimachinery/pkg/runtime/schema"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"

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
		spireAPIFederation, err := unstructuredToSpireAPIFederation(trustDomain)
		if err != nil {
			return ListFederationRelationshipsResponse{}, fmt.Errorf("Error parsing trustDomain: %v", err)
		}
		// place SPIRE API object into result
		result = append(result, spireAPIFederation)
	}

	return ListFederationRelationshipsResponse{
		FederationRelationships: result,
	}, nil 
}

func unstructuredToSpireAPIFederation(trustDomain unstructured.Unstructured) (*apitypes.FederationRelationship, error) {
		// parse TrustDomain into ClusterFederatedTrustDomain object
		var clusterFederatedTrustDomain spirev1alpha1.ClusterFederatedTrustDomain
		err := runtime.DefaultUnstructuredConverter.FromUnstructured(trustDomain.Object, &clusterFederatedTrustDomain)
		if err != nil {
			return nil, fmt.Errorf("error parsing trustdomain: %v", err)
		}
		// parse ClusterFederatedTrustDomain object into Federation object
		federation, err := spirev1alpha1.ParseClusterFederatedTrustDomainSpec(&clusterFederatedTrustDomain.Spec)
		if err != nil {
			return nil, fmt.Errorf("error parsing crd spec: %v", err)
		}

		// parse Federation object into spire API object
		spireAPIFederation, err := federationRelationshipToAPI(*federation)
		if err != nil {
			return nil, fmt.Errorf("error parsing into spire API object: %v", err)
		}

		return spireAPIFederation, nil
}

func (s *SPIRECRDManager) spireAPIFederationToUnstructured(apiFederation *apitypes.FederationRelationship) (*unstructured.Unstructured, error) {
		// parse into federation object
		federation, err := federationRelationshipFromAPI(apiFederation)
		if err != nil {
			return nil, fmt.Errorf("error parsing into federation object: %v", err)
		}

		// parse into ClusterFederatedTrustDomain object
		clusterFederatedTrustDomain, err := s.parseToClusterFederatedTrustDomain(&federation)
		if err != nil {
			return nil, fmt.Errorf("error parsing into clusterFederatedTrustDomain object: %v", err)
		}

		// translate to unstructured
		unstructuredObject, err := runtime.DefaultUnstructuredConverter.ToUnstructured(clusterFederatedTrustDomain)
		if err != nil {
			return nil, fmt.Errorf("error parsing trustdomain: %v", err)
		}
		createInput := &unstructured.Unstructured{Object: unstructuredObject}

		return createInput, nil
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


