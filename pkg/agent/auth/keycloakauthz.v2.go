package auth

import (
	"net/http"
	"github.com/pkg/errors"
)

type ReadWriteAuthorizer struct {
	api_permissions map[string][]string
}

func getAuthMap() (map[string][]string) {
	// api call matches to list of strings, representing disjunction of requirements
	api_permissions := map[string][]string{
		// no auth token needed for Tornjak Home
		"/": []string{},

		// viewer
		"/api/healthcheck":            []string{"admin", "viewer"},
		"/api/debugserver":            []string{"admin", "viewer"},
		"/api/agent/list":             []string{"admin", "viewer"},
		"/api/entry/list":             []string{"admin", "viewer"},
		"/api/tornjak/serverinfo":     []string{"admin", "viewer"},
		"/api/tornjak/selectors/list": []string{"admin", "viewer"},
		"/api/tornjak/agents/list":    []string{"admin", "viewer"},
		"/api/tornjak/clusters/list":  []string{"admin", "viewer"},
		// admin
		"/api/agent/ban":                  []string{"admin"},
		"/api/agent/delete":               []string{"admin"},
		"/api/agent/createjointoken":      []string{"admin"},
		"/api/entry/create":               []string{"admin"},
		"/api/entry/delete":               []string{"admin"},
		"/api/tornjak/selectors/register": []string{"admin"},
		"/api/tornjak/clusters/create":    []string{"admin"},
		"/api/tornjak/clusters/edit":      []string{"admin"},
		"/api/tornjak/clusters/delete":    []string{"admin"},
	}
	return api_permissions
}


func NewAdminViewerAuthorizer() (*ReadWriteAuthorizer, error) {
	api_permissions := getAuthMap()
	return &ReadWriteAuthorizer{
		api_permissions: api_permissions,
	}, nil
}

func (a *ReadWriteAuthorizer) AuthorizeRequest(r *http.Request, u *UserInfo) error {
	roles := u.Roles
	apiPath := r.URL.Path

	allowedRoles := a.api_permissions[apiPath]


	// check if any roles in sufficientRoles
	for _, role := range roles {
		for _, allowedRole := range allowedRoles {
			if role == allowedRole {
				return nil
			}
		}
	}
	return errors.New("Unauthorized request")
}
