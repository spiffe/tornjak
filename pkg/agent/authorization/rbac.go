package authorization

import (
	"github.com/pkg/errors"
	"fmt"
	"strings"
	"net/http"

	"github.com/spiffe/tornjak/pkg/agent/authentication/user"
)

type RBACAuthorizer struct {
	name       string
	roleList   map[string]string
	apiMapping map[string][]string
	apiV1Mapping map[string]map[string][]string
}

// TODO put this in a common constants file
var staticAPIList = map[string]struct{}{
	"/":                               {},
	"/api/healthcheck":                {},
	"/api/debugserver":                {},
	"/api/agent/list":                 {},
	"/api/entry/list":                 {},
	"/api/tornjak/serverinfo":         {},
	"/api/tornjak/selectors/list":     {},
	"/api/tornjak/agents/list":        {},
	"/api/tornjak/clusters/list":      {},
	"/api/agent/ban":                  {},
	"/api/agent/delete":               {},
	"/api/agent/createjointoken":      {},
	"/api/entry/create":               {},
	"/api/entry/delete":               {},
	"/api/tornjak/selectors/register": {},
	"/api/tornjak/clusters/create":    {},
	"/api/tornjak/clusters/edit":      {},
	"/api/tornjak/clusters/delete":    {},
}
var staticAPIV1List = map[string]map[string]struct{}{
	"/api/v1/spire/serverinfo" :{"GET": {}},
	"/api/v1/spire/healthcheck" :{"GET": {}},
	"/api/v1/spire/entries" :{"GET": {}, "POST": {}, "DELETE": {}},
	"/api/v1/spire/agents" :{"GET": {}, "POST": {}, "DELETE": {}},
	"/api/v1/spire/agents/ban" :{"POST": {}},
	"/api/v1/spire/agents/jointoken" :{"POST": {}},
	"/api/v1/tornjak/clusters" :{"GET": {}, "POST": {}, "PATCH": {}, "DELETE": {}},
	"/api/v1/tornjak/selectors" :{"GET": {}, "POST": {}},
	"/api/v1/tornjak/agents" :{"GET": {}},
	"/api/v1/tornjak/serverinfo" :{"GET": {}},
	"/api/v1/spire/bundle" :{"GET": {}},
	"/api/v1/spire/federations/bundles" :{"GET": {}, "POST": {}, "DELETE": {}, "PATCH": {}},
}

func validateInitParameters(roleList map[string]string, apiMapping map[string][]string, apiV1Mapping map[string]map[string][]string) error {
	if roleList == nil {
		return errors.Errorf("No roles defined")
	}
	for api, allowList := range apiMapping {
		// check that API exists
		if _, ok := staticAPIList[api]; !ok {
			return errors.Errorf("API %s does not exist", api)
		}

		// check that each role exists in roleList
		for _, allowedRole := range allowList {
			if _, ok := roleList[allowedRole]; !ok {
				return errors.Errorf("API %s lists undefined role %s", api, allowedRole)
			}
		}
	}
	for path, method_dict := range apiV1Mapping {
		for method, allowList := range method_dict {
			// check that API exists
			if _, ok := staticAPIV1List[path][method]; !ok {
				return errors.Errorf("API V1 path %s does not exist with method %s", path, method)
			}

			// check that each role exists in roleList
			for _, allowedRole := range allowList {
				if _, ok := roleList[allowedRole]; !ok {
					return errors.Errorf("API V1  %s lists undefined role %s", path, allowedRole)
				}
			}
		}
	}
	return nil
}

func NewRBACAuthorizer(policyName string, roleList map[string]string, apiMapping map[string][]string, apiV1Mapping map[string]map[string][]string) (*RBACAuthorizer, error) {
	err := validateInitParameters(roleList, apiMapping, apiV1Mapping)
	if err != nil {
		return nil, errors.Errorf("Could not parse policy %s: invalid mapping: %v", policyName, err)
	}
	fmt.Printf("apiV1Mapping: %v\n", apiV1Mapping)
	return &RBACAuthorizer{
		name:       policyName,
		roleList:   roleList,
		apiMapping: apiMapping,
		apiV1Mapping: apiV1Mapping,
	}, nil
}

func (a *RBACAuthorizer) authorizeAPIRequest(r *http.Request, u *user.UserInfo) error {
	userRoles := u.Roles
	apiPath := r.URL.Path

	allowedRoles := a.apiMapping[apiPath]

	// if no role listed for api, reject
	if len(allowedRoles) == 0 {
		return errors.New("Unauthorized request")
	}

	// check each allowed role
	for _, allowedRole := range allowedRoles {
		if allowedRole == "" { // all authenticated allowed
			return nil
		}
		for _, role := range userRoles {
			// user has role
			if role == allowedRole {
				return nil
			}
		}
	}
	return errors.New("Unauthorized Request")
}

func (a *RBACAuthorizer) authorizeAPIV1Request(r *http.Request, u *user.UserInfo) error {
	userRoles := u.Roles
	apiPath := r.URL.Path
	apiMethod := r.Method

	allowedRoles := a.apiV1Mapping[apiPath][apiMethod]

	// if no role listed for api, reject
	if len(allowedRoles) == 0 {
		return errors.New("Unauthorized request")
	}

	// check each allowed role
	for _, allowedRole := range allowedRoles {
		if allowedRole == "" { // all authenticated allowed
			return nil
		}
		for _, role := range userRoles {
			// user has role
			if role == allowedRole {
				return nil
			}
		}
	}
	return errors.New("Unauthorized Request")
}

func (a *RBACAuthorizer) AuthorizeRequest(r *http.Request, u *user.UserInfo) error {
	// if not authenticated fail and return error
	if u.AuthenticationError != nil {
		return errors.Errorf("Authentication error: %v", u.AuthenticationError)
	}

	// based on path
	apiPath := r.URL.Path
	isV1 := strings.HasPrefix(apiPath, "/api/v1")

	if !isV1 {
		// check old API Request
		err := a.authorizeAPIRequest(r, u)
		if err != nil {
			return errors.Errorf("Tornjak API Authorization error: %v", err)
		}
	} else {
		// check API V1 Request
    err := a.authorizeAPIV1Request(r, u)
		if err != nil {
			return errors.Errorf("Tornjak API V1 Authorization error: %v", err)
		}
	}

	return nil
}
