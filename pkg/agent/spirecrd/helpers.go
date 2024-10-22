package spirecrd

import (
	"fmt"
	"errors"
	"time"
	"crypto"
	"crypto/x509"

	"github.com/spiffe/spire-controller-manager/pkg/spireapi"
	apitypes "github.com/spiffe/spire-api-sdk/proto/spire/api/types"
	"github.com/spiffe/go-spiffe/v2/bundle/spiffebundle"
)

// TODO this file has much code duplicated from spire-controller-manager - would ideally import functions directly

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
