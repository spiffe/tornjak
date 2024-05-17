package authorization

import (
	"net/http"
	"github.com/pkg/errors"
	"fmt"

	"github.com/spiffe/tornjak/pkg/agent/authentication/user"
)

type RBACAuthorizer struct {
	name string
	roleList []string
	apiMapping map[string][]string
}

func validateInitParameters(roleList []string, apiMapping map[string][]string) error {
	return nil
}

func NewRBACAuthorizer(policyName string, roleList []string, apiMapping map[string][]string) (*RBACAuthorizer, error) {
	fmt.Printf("Parsing policy %s\n", policyName)
	err := validateInitParameters(roleList, apiMapping)
	if err != nil {
		return nil, errors.Errorf("Initialization error: %v", err)
	}
	return &RBACAuthorizer{
		name: policyName,
		roleList: roleList,
		apiMapping: apiMapping,
	}, nil
}

func (a *RBACAuthorizer) AuthorizeRequest(r *http.Request, u *user.UserInfo) error {
	// if not authenticated fail and return error
	/*if u.AuthenticationError != nil {
		return errors.Errorf("Authentication error: %v", u.AuthenticationError)
	}

	roles := u.Roles
	apiPath := r.URL.Path

	allowedRoles := a.api_permissions[apiPath]

	// if no role required, return nil
	if len(allowedRoles) == 0 {
		return nil
	}

	// check if any roles in sufficientRoles
	for _, role := range roles {
		for _, allowedRole := range allowedRoles {
			if role == allowedRole {
				return nil
			}
		}
	}

	return errors.New("Unauthorized request")*/
	return nil
}
