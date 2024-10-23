package spirecrd

import (
	"fmt"
	"errors"
	"time"
	"crypto"
	"crypto/x509"
	metav1 "k8s.io/apimachinery/pkg/apis/meta/v1"

	"github.com/spiffe/spire-controller-manager/pkg/spireapi"
	apitypes "github.com/spiffe/spire-api-sdk/proto/spire/api/types"
	"github.com/spiffe/go-spiffe/v2/bundle/spiffebundle"
	"github.com/spiffe/go-spiffe/v2/spiffeid"
	spirev1alpha1 "github.com/spiffe/spire-controller-manager/api/v1alpha1"
)

// TODO this file has much code duplicated from spire-controller-manager - would ideally import functions directly

// This code taken from https://github.com/spiffe/spire-controller-manager/blob/main/pkg/spireapi/types.go
// For parsing from spire type to Federation object
func federationRelationshipFromAPI(in *apitypes.FederationRelationship) (spireapi.FederationRelationship, error) {
	trustDomain, err := spiffeid.TrustDomainFromString(in.TrustDomain)
	if err != nil {
		return spireapi.FederationRelationship{}, fmt.Errorf("invalid trust domain: %w", err)
	}

	if err := spireapi.ValidateBundleEndpointURL(in.BundleEndpointUrl); err != nil {
		return spireapi.FederationRelationship{}, fmt.Errorf("invalid bundle endpoint URL: %w", err)
	}

	var trustDomainBundle *spiffebundle.Bundle
	if in.TrustDomainBundle != nil {
		trustDomainBundle, err = bundleFromAPI(in.TrustDomainBundle)
		if err != nil {
			return spireapi.FederationRelationship{}, fmt.Errorf("invalid trust domain bundle: %w", err)
		}
	}

	var bundleEndpointProfile spireapi.BundleEndpointProfile
	switch profile := in.BundleEndpointProfile.(type) {
	case *apitypes.FederationRelationship_HttpsWeb:
		if profile.HttpsWeb == nil {
			return spireapi.FederationRelationship{}, errors.New("https_web profile is missing data")
		}
		bundleEndpointProfile = spireapi.HTTPSWebProfile{}
	case *apitypes.FederationRelationship_HttpsSpiffe:
		if profile.HttpsSpiffe == nil {
			return spireapi.FederationRelationship{}, errors.New("https_spiffe profile is missing data")
		}
		endpointSPIFFEID, err := spiffeid.FromString(profile.HttpsSpiffe.EndpointSpiffeId)
		if err != nil {
			return spireapi.FederationRelationship{}, fmt.Errorf("invalid endpoint SPIFFE ID: %w", err)
		}
		bundleEndpointProfile = spireapi.HTTPSSPIFFEProfile{
			EndpointSPIFFEID: endpointSPIFFEID,
		}
	case nil:
		return spireapi.FederationRelationship{}, errors.New("bundle endpoint profile is missing")
	default:
		return spireapi.FederationRelationship{}, fmt.Errorf("unrecognized bundle endpoint profile type: %T", in.BundleEndpointProfile)
	}

	return spireapi.FederationRelationship{
		TrustDomain:           trustDomain,
		BundleEndpointURL:     in.BundleEndpointUrl,
		BundleEndpointProfile: bundleEndpointProfile,
		TrustDomainBundle:     trustDomainBundle,
	}, nil
}

// This code taken from https://github.com/spiffe/spire-controller-manager/blob/main/pkg/spireapi/types.go
// For parsing from Federation object to spire types
func federationRelationshipToAPI(in spireapi.FederationRelationship) (*apitypes.FederationRelationship, error) {
	if in.TrustDomain.IsZero() {
		return nil, errors.New("trust domain is missing")
	}
	if err := spireapi.ValidateBundleEndpointURL(in.BundleEndpointURL); err != nil {
		return nil, fmt.Errorf("invalid bundle endpoint URL: %w", err)
	}

	out := &apitypes.FederationRelationship{
		TrustDomain:       in.TrustDomain.Name(),
		BundleEndpointUrl: in.BundleEndpointURL,
	}

	if in.TrustDomainBundle != nil {
		trustDomainBundle, err := bundleToAPI(in.TrustDomainBundle)
		if err != nil {
			return nil, fmt.Errorf("invalid trust domain bundle: %w", err)
		}
		out.TrustDomainBundle = trustDomainBundle
	}

	switch profile := in.BundleEndpointProfile.(type) {
	case spireapi.HTTPSWebProfile:
		out.BundleEndpointProfile = &apitypes.FederationRelationship_HttpsWeb{
			HttpsWeb: &apitypes.HTTPSWebProfile{},
		}
	case spireapi.HTTPSSPIFFEProfile:
		out.BundleEndpointProfile = &apitypes.FederationRelationship_HttpsSpiffe{
			HttpsSpiffe: &apitypes.HTTPSSPIFFEProfile{
				EndpointSpiffeId: profile.EndpointSPIFFEID.String(),
			},
		}
	default:
		return nil, fmt.Errorf("unrecognized bundle endpoint profile type %T", profile)
	}
	return out, nil
}

// This code taken from https://github.com/spiffe/spire-controller-manager/blob/main/pkg/spireapi/types.go
// For parsing from Bundle object to spire types
func bundleFromAPI(in *apitypes.Bundle) (*spiffebundle.Bundle, error) {
	if in == nil {
		return nil, nil
	}

	trustDomain, err := spiffeid.TrustDomainFromString(in.TrustDomain)
	if err != nil {
		return nil, err
	}

	x509Authorities, err := x509AuthoritiesFromAPI(in.X509Authorities)
	if err != nil {
		return nil, err
	}

	jwtAuthorities, err := jwtAuthoritiesFromAPI(in.JwtAuthorities)
	if err != nil {
		return nil, err
	}

	out := spiffebundle.New(trustDomain)
	out.SetX509Authorities(x509Authorities)
	out.SetJWTAuthorities(jwtAuthorities)
	if in.SequenceNumber != 0 {
		out.SetSequenceNumber(in.SequenceNumber)
	}
	if in.RefreshHint != 0 {
		out.SetRefreshHint(time.Duration(in.RefreshHint) * time.Second)
	}
	return out, nil
}

// This code taken from https://github.com/spiffe/spire-controller-manager/blob/main/pkg/spireapi/types.go
// For parsing from Bundle object to spire types
func bundleToAPI(in *spiffebundle.Bundle) (*apitypes.Bundle, error) {
	trustDomain := in.TrustDomain().Name()
	if trustDomain == "" {
		return nil, errors.New("trust domain is missing")
	}
	x509Authorities, err := x509AuthoritiesToAPI(in.X509Authorities())
	if err != nil {
		return nil, err
	}
	jwtAuthorities, err := jwtAuthoritiesToAPI(in.JWTAuthorities())
	if err != nil {
		return nil, err
	}
	sequenceNumber, _ := in.SequenceNumber()
	refreshHint, _ := in.RefreshHint()
	return &apitypes.Bundle{
		TrustDomain:     trustDomain,
		X509Authorities: x509Authorities,
		JwtAuthorities:  jwtAuthorities,
		SequenceNumber:  sequenceNumber,
		RefreshHint:     int64(refreshHint / time.Second),
	}, nil
}

// This code taken from https://github.com/spiffe/spire-controller-manager/blob/main/pkg/spireapi/types.go
// For parsing from x509Authorities object to spire types
func x509AuthoritiesFromAPI(ins []*apitypes.X509Certificate) ([]*x509.Certificate, error) {
	var outs []*x509.Certificate
	if ins != nil {
		outs = make([]*x509.Certificate, 0, len(ins))
		for _, in := range ins {
			out, err := x509AuthorityFromAPI(in)
			if err != nil {
				return nil, err
			}
			outs = append(outs, out)
		}
	}
	return outs, nil
}

// This code taken from https://github.com/spiffe/spire-controller-manager/blob/main/pkg/spireapi/types.go
// For parsing from x509Authority object to spire types
func x509AuthorityFromAPI(in *apitypes.X509Certificate) (*x509.Certificate, error) {
	return x509.ParseCertificate(in.Asn1)
}

// This code taken from https://github.com/spiffe/spire-controller-manager/blob/main/pkg/spireapi/types.go
// For parsing from x509Authorities object to spire types
func x509AuthoritiesToAPI(ins []*x509.Certificate) ([]*apitypes.X509Certificate, error) {
	var outs []*apitypes.X509Certificate
	if ins != nil {
		outs = make([]*apitypes.X509Certificate, 0, len(ins))
		for _, in := range ins {
			out, err := x509AuthorityToAPI(in)
			if err != nil {
				return nil, err
			}
			outs = append(outs, out)
		}
	}
	return outs, nil
}

// This code taken from https://github.com/spiffe/spire-controller-manager/blob/main/pkg/spireapi/types.go
// For parsing from x509Authority object to spire types
func x509AuthorityToAPI(in *x509.Certificate) (*apitypes.X509Certificate, error) {
	if len(in.Raw) == 0 {
		return nil, errors.New("x509 certificate is missing raw data")
	}
	return &apitypes.X509Certificate{Asn1: in.Raw}, nil
}

// This code taken from https://github.com/spiffe/spire-controller-manager/blob/main/pkg/spireapi/types.go
// For parsing from JWT Authorities object to spire types
func jwtAuthoritiesFromAPI(ins []*apitypes.JWTKey) (map[string]crypto.PublicKey, error) {
	var outs map[string]crypto.PublicKey
	if ins != nil {
		outs = make(map[string]crypto.PublicKey, len(ins))
		for _, in := range ins {
			keyID, publicKey, err := jwtAuthorityFromAPI(in)
			if err != nil {
				return nil, err
			}
			outs[keyID] = publicKey
		}
	}
	return outs, nil
}

// This code taken from https://github.com/spiffe/spire-controller-manager/blob/main/pkg/spireapi/types.go
// For parsing from JWT Authority object to spire types
func jwtAuthorityFromAPI(in *apitypes.JWTKey) (string, crypto.PublicKey, error) {
	if in.KeyId == "" {
		return "", nil, errors.New("key ID is missing")
	}
	publicKey, err := x509.ParsePKIXPublicKey(in.PublicKey)
	if err != nil {
		return "", nil, fmt.Errorf("failed to unmarshal public key: %w", err)
	}
	return in.KeyId, publicKey, nil
}

// This code taken from https://github.com/spiffe/spire-controller-manager/blob/main/pkg/spireapi/types.go
// For parsing from JWT Authorities object to spire types
func jwtAuthoritiesToAPI(ins map[string]crypto.PublicKey) ([]*apitypes.JWTKey, error) {
	var outs []*apitypes.JWTKey
	if ins != nil {
		outs = make([]*apitypes.JWTKey, 0, len(ins))
		for keyID, publicKey := range ins {
			out, err := jwtAuthorityToAPI(keyID, publicKey)
			if err != nil {
				return nil, err
			}
			outs = append(outs, out)
		}
	}
	return outs, nil
}

// This code taken from https://github.com/spiffe/spire-controller-manager/blob/main/pkg/spireapi/types.go
// For parsing from JWT Authority object to spire types
func jwtAuthorityToAPI(keyID string, publicKey crypto.PublicKey) (*apitypes.JWTKey, error) {
	if keyID == "" {
		return nil, errors.New("key ID is missing")
	}
	publicKeyBytes, err := x509.MarshalPKIXPublicKey(publicKey)
	if err != nil {
		return nil, fmt.Errorf("failed to marshal public key: %w", err)
	}
	return &apitypes.JWTKey{
		KeyId:     keyID,
		PublicKey: publicKeyBytes,
	}, nil
}

func (s *SPIRECRDManager) parseToClusterFederatedTrustDomain(inp *spireapi.FederationRelationship)(*spirev1alpha1.ClusterFederatedTrustDomain, error) {
	// Populate Type Meta
	typeMeta := metav1.TypeMeta{
		Kind: "ClusterFederatedTrustDomain",
		APIVersion: "spire.spiffe.io/v1alpha1",
	}
	// Populate Object Meta
	objectMeta := metav1.ObjectMeta{
		Name: inp.TrustDomain.String(),
	}

	spec, err := s.parseToClusterFederatedTrustDomainSpec(inp)
	if err != nil {
		return nil, fmt.Errorf("failed to parse into ClusterFederatedTrustDomainSpec: %w", err)
	}

	fmt.Printf("typeMeta: %+v, objectMeta: %+v, spec: %+v\n", typeMeta, objectMeta, spec)
	// Populate Spec
	return nil, nil
} 

func (s *SPIRECRDManager) parseToClusterFederatedTrustDomainSpec(inp *spireapi.FederationRelationship)(*spirev1alpha1.ClusterFederatedTrustDomainSpec, error) {
	// get TrustDomain
	trustDomain := inp.TrustDomain.String()

	// get BundleEndpointURL
	bundleEndpointURL := inp.BundleEndpointURL

	// get BundleEndpointProfile
	bundleEndpointProfile, err := parseBundleEndpointProfile(inp)
	if err != nil {
		return nil, fmt.Errorf("failed to parse bundleEndpointProfile: %w", err)
	}

	// get TrustDomainBundle
	trustDomainBundle, err := parseTrustDomainBundle(inp)
	if err != nil {
		return nil, fmt.Errorf("failed to parse trustDomainBundle: %w", err)
	}

	// get ClassName
	className := s.className

	fmt.Printf("trustDomain: %s, bundleEndpointURL: %s, bundleEndpointProfile: %+v, trustDomainBundle: %+v, className: %s\n", trustDomain, bundleEndpointURL, bundleEndpointProfile, trustDomainBundle, className)
	return nil, nil
}

func parseBundleEndpointProfile(inp *spireapi.FederationRelationship)(spirev1alpha1.BundleEndpointProfile, error) {
	bundleEndpointProfile := inp.BundleEndpointProfile
	// case on https_web and https_spiffe
	switch bundleEndpointProfile.Name() {
		case "https_web":
			return spirev1alpha1.BundleEndpointProfile{
				Type: spirev1alpha1.HTTPSWebProfileType,
			}, nil
		case "https_spiffe":
			bundleEndpointProfile, ok := bundleEndpointProfile.(spireapi.HTTPSSPIFFEProfile)
			if !ok {
    		// Handle the error if the type assertion fails
    		return spirev1alpha1.BundleEndpointProfile{}, fmt.Errorf("failed to assert BundleEndpointProfile as HTTPSSPIFFEProfile")
			}
			endpointSpiffeID := bundleEndpointProfile.EndpointSPIFFEID
			return spirev1alpha1.BundleEndpointProfile{
				Type: spirev1alpha1.HTTPSSPIFFEProfileType,
				EndpointSPIFFEID: endpointSpiffeID.String(),
			}, nil
		default:
			return spirev1alpha1.BundleEndpointProfile{}, fmt.Errorf("invalid bundle endpoint profile: %s", bundleEndpointProfile.Name())
	}
}

func parseTrustDomainBundle(inp *spireapi.FederationRelationship)(*spirev1alpha1.BundleEndpointProfile, error) {
	return nil, nil
}
