package api

import (
	"fmt"
	"strings"
	"time"

	backoff "github.com/cenkalti/backoff/v4"
	"github.com/hashicorp/hcl"
	"github.com/hashicorp/hcl/hcl/ast"
	"github.com/hashicorp/hcl/hcl/token"
	"github.com/pkg/errors"

	"github.com/spiffe/tornjak/pkg/agent/authentication/authenticator"
	"github.com/spiffe/tornjak/pkg/agent/authorization"
	agentdb "github.com/spiffe/tornjak/pkg/agent/db"
)

func stringFromToken(keyToken token.Token) (string, error) {
	switch keyToken.Type {
	case token.STRING, token.IDENT:
	default:
		return "", fmt.Errorf("expected STRING or IDENT but got %s", keyToken.Type)
	}
	value := keyToken.Value()
	stringValue, ok := value.(string)
	if !ok {
		// purely defensive
		return "", fmt.Errorf("expected %T but got %T", stringValue, value)
	}
	return stringValue, nil
}

// getPluginConfig returns first plugin configuration
func getPluginConfig(plugin *ast.ObjectItem) (string, ast.Node, error) {
	// extract plugin name and value
	pluginName, err := stringFromToken(plugin.Keys[1].Token)
	if err != nil {
		return "", nil, fmt.Errorf("invalid plugin type name %q: %w", plugin.Keys[1].Token.Text, err)
	}
	// extract data
	var hclPluginConfig hclPluginConfig
	if err := hcl.DecodeObject(&hclPluginConfig, plugin.Val); err != nil {
		return "", nil, fmt.Errorf("failed to decode plugin config for %q: %w", pluginName, err)
	}
	return pluginName, hclPluginConfig.PluginData, nil
}

// NewAgentsDB returns a new agents DB, given a DB connection string
func NewAgentsDB(dbPlugin *ast.ObjectItem) (agentdb.AgentDB, error) {
	key, data, err := getPluginConfig(dbPlugin)
	if err != nil { // db is required config
		return nil, errors.New("Required DataStore plugin not configured")
	}

	switch key {
	case "sql":
		// check if data is defined
		if data == nil {
			return nil, errors.New("SQL DataStore plugin ('config > plugins > DataStore sql > plugin_data') not populated")
		}
		fmt.Printf("SQL DATASTORE DATA: %+v\n", data)

		// TODO can probably add this to config
		expBackoff := backoff.NewExponentialBackOff()
		expBackoff.MaxElapsedTime = time.Second

		// decode config to struct
		var config pluginDataStoreSQL
		if err := hcl.DecodeObject(&config, data); err != nil {
			return nil, errors.Errorf("Couldn't parse DB config: %v", err)
		}

		// create db
		drivername := config.Drivername
		dbfile := config.Filename

		db, err := agentdb.NewLocalSqliteDB(drivername, dbfile, expBackoff)
		if err != nil {
			return nil, errors.Errorf("Could not start DB driver %s, filename: %s: %v", drivername, dbfile, err)
		}
		return db, nil
	default:
		return nil, errors.Errorf("Couldn't create datastore")
	}
}

// NewAuthenticator returns a new Authenticator
func NewAuthenticator(authenticatorPlugin *ast.ObjectItem) (authenticator.Authenticator, error) {
	key, data, _ := getPluginConfig(authenticatorPlugin)

	switch key {
	case "Keycloak":
		// check if data is defined
		if data == nil {
			return nil, errors.New("Keycloak Authenticator plugin ('config > plugins > Authenticator Keycloak > plugin_data') not populated")
		}
		fmt.Printf("Authenticator Keycloak Plugin Data: %+v\n", data)
		// decode config to struct
		var config pluginAuthenticatorKeycloak
		if err := hcl.DecodeObject(&config, data); err != nil {
			return nil, errors.Errorf("Couldn't parse Authenticator config: %v", err)
		}

		// Log warning if audience is nil that aud claim is not checked
		if config.Audience == "" {
			fmt.Println("WARNING: Auth plugin has no expected audience configured - `aud` claim will not be checked (please populate 'config > plugins > UserManagement KeycloakAuth > plugin_data > audience')")
		}

		// create authenticator TODO make json an option?
		authenticator, err := authenticator.NewKeycloakAuthenticator(true, config.IssuerURL, config.Audience)
		if err != nil {
			return nil, errors.Errorf("Couldn't configure Authenticator: %v", err)
		}
		return authenticator, nil
	default:
		return nil, errors.Errorf("Invalid option for Authenticator named %s", key)
	}
}

// NewAuthorizer returns a new Authorizer
func NewAuthorizer(authorizerPlugin *ast.ObjectItem) (authorization.Authorizer, error) {
	key, data, _ := getPluginConfig(authorizerPlugin)

	switch key {
	case "RBAC":
		// check if data is defined
		if data == nil {
			return nil, errors.New("RBAC Authorizer plugin ('config > plugins > Authorizer RBAC > plugin_data') not populated")
		}
		fmt.Printf("Authorizer RBAC Plugin Data: %+v\n", data)

		// decode config to struct
		var config pluginAuthorizerRBAC
		if err := hcl.DecodeObject(&config, data); err != nil {
			return nil, errors.Errorf("Couldn't parse Authorizer config: %v", err)
		}

		// decode into role list and apiMapping
		roleList := make(map[string]string)
		apiV1Mapping := make(map[string]map[string][]string)
		for _, role := range config.RoleList {
			roleList[role.Name] = role.Desc
			// print warning for empty string
			if role.Name == "" {
				fmt.Println("WARNING: using the empty string for an API enables access to all authenticated users")
			}
		}
		for _, apiV1 := range config.APIv1RoleMappings {
			arr := strings.Split(apiV1.Name, " ")
			apiV1.Method = arr[0]
			apiV1.Path = arr[1]
			fmt.Printf("API V1 method: %s, API V1 path: %s, API V1 allowed roles: %s \n", apiV1.Method, apiV1.Path, apiV1.AllowedRoles)
			if _, ok := apiV1Mapping[apiV1.Path]; ok {
				apiV1Mapping[apiV1.Path][apiV1.Method] = apiV1.AllowedRoles
			} else {
				apiV1Mapping[apiV1.Path] = map[string][]string{apiV1.Method: apiV1.AllowedRoles}
			}
		}
		fmt.Printf("API V1 Mapping: %+v\n", apiV1Mapping)

		authorizer, err := authorization.NewRBACAuthorizer(config.Name, roleList, apiV1Mapping)
		if err != nil {
			return nil, errors.Errorf("Couldn't configure Authorizer: %v", err)
		}
		return authorizer, nil
	default:
		return nil, errors.Errorf("Invalid option for Authorizer named %s", key)
	}
}

func (s *Server) VerifyConfiguration() error {
	if s.TornjakConfig == nil {
		return errors.New("config not given")
	}

	/*  Verify server  */
	if s.TornjakConfig.Server == nil { // must be defined
		return errors.New("'config > server' field not defined")
	}
	if s.TornjakConfig.Server.SPIRESocket == "" {
		return errors.New("'config > server > spire_socket_path' field not defined")
	}

	/*  Verify Plugins  */
	if s.TornjakConfig.Plugins == nil {
		return errors.New("'config > plugins' field not defined")
	}
	return nil
}

func (s *Server) ConfigureDefaults() error {
	// no authorization is a default
	s.Authenticator = authenticator.NewNullAuthenticator()
	s.Authorizer = authorization.NewNullAuthorizer()
	return nil
}

func (s *Server) Configure() error {
	// Verify Config
	err := s.VerifyConfiguration()
	if err != nil {
		return errors.Errorf("Tornjak Config error: %v", err)
	}

	/*  Configure Server  */
	serverConfig := s.TornjakConfig.Server
	s.SpireServerAddr = serverConfig.SPIRESocket // for convenience

	/*  Configure Plugins  */
	// configure defaults for optional plugins, reconfigured if given
	// TODO maybe we should not have this step at all
	// This is a temporary work around for optional plugin configs
	err = s.ConfigureDefaults()
	if err != nil {
		return errors.Errorf("Tornjak Config error: %v", err)
	}

	pluginConfigs := *s.TornjakConfig.Plugins
	pluginList, ok := pluginConfigs.(*ast.ObjectList)
	if !ok {
		return fmt.Errorf("expected plugins node type %T but got %T", pluginList, pluginConfigs)
	}

	// iterate over plugin list

	for _, pluginObject := range pluginList.Items {
		if len(pluginObject.Keys) != 2 {
			return fmt.Errorf("plugin item expected to have two keys (type then name)")
		}

		pluginType, err := stringFromToken(pluginObject.Keys[0].Token)
		if err != nil {
			return fmt.Errorf("invalid plugin type key %q: %w", pluginObject.Keys[0].Token.Text, err)
		}

		// create plugin component based on type
		switch pluginType {
		// configure datastore
		case "DataStore":
			s.Db, err = NewAgentsDB(pluginObject)
			if err != nil {
				return errors.Errorf("Cannot configure datastore plugin: %v", err)
			}
		// configure Authenticator
		case "Authenticator":
			s.Authenticator, err = NewAuthenticator(pluginObject)
			if err != nil {
				return errors.Errorf("Cannot configure Authenticator plugin: %v", err)
			}
		// configure Authorizer
		case "Authorizer":
			s.Authorizer, err = NewAuthorizer(pluginObject)
			if err != nil {
				return errors.Errorf("Cannot configure Authorizer plugin: %v", err)
			}
		}
		// TODO Handle when multiple plugins configured
	}

	return nil
}
