# Server plugin: Authorization "keycloak"

Please see our documentation on the [authorization feature](./user-management.md) for more complete details. 

Note that configuring this requires the frontend to be configured to obtain access tokens at the relevant auth server. 

The configuration has the following key-value pairs:

| Key         | Description                                                             | Required            | 
| ----------- | ----------------------------------------------------------------------- | ------------------- |
| issuer      | Issuer URL for OIDC Discovery with external IAM System                  | True                |
| audience    | Expected audience value in received JWT tokens                          | False (Recommended) |

A sample configuration file for syntactic referense is below:

```hcl
    UserManagement "KeycloakAuth" {
        plugin_data {
            issuer = "http://localhost:8080/realms/tornjak"
            audience = "tornjak-backend"
        }
    }
```

NOTE: If audience field is missing or empty, the server will log an error and NOT perform an audience check. 
It is highly recommended `audience` is populated to ensure only tokens meant for the Tornjak Backend are accepted. 
