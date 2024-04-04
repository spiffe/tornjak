# Server plugin: Authorization "keycloak"

Please see our documentation on the [authorization feature](./feature_auth.md) for more complete details. 

Note that configuring this requires the frontend to be configured to obtain access tokens at the relevant auth server. 

The configuration has the following key-value pairs:

| Key         | Description                                                             | Required | 
| ----------- | ----------------------------------------------------------------------- | -------- |
| issuer      | Issuer URL for OIDC Discovery with external IAM System                  | True     |

A sample configuration file for syntactic referense is below:

```hcl
    UserManagement "KeycloakAuth" {
        plugin_data {
            issuer = "http://localhost:8080/realms/tornjak"
        }
    }
```
