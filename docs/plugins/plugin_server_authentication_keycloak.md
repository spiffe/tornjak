# Server plugin: Authentication "Keycloak"

Please see our documentation on the [authorization feature](./user-management.md) for more complete details.

Note that simply enabling this feature will NOT enable authorization. In order to apply authorization logic to user details, one must also enable an Authorization plugin. Any output from this layer, including authentication errors, are to be interpreted by an Authorization layer.

The configuration has the following key-value pairs:

| Key         | Description                                                             | Required            |
| ----------- | ----------------------------------------------------------------------- | ------------------- |
| issuer      | Issuer URL for OIDC Discovery with external IAM System                  | True                |
| audience    | Expected audience value in received JWT tokens                          | False (Recommended) |

A sample configuration file for syntactic referense is below:

```hcl
    Authenticator "Keycloak" {
        plugin_data {
            issuer = "http://host.docker.internal:8080/realms/tornjak"
            audience = "tornjak-backend"
        }
    }
```

NOTE: If audience field is missing or empty, the server will log a warning and NOT perform an audience check.
It is highly recommended `audience` is populated to ensure only tokens meant for the Tornjak Backend are accepted.

## User Info extracted

This plugin assumes roles are available in `realm_access.roles` in the JWT and passes this list as user.roles.

These mapped values are passed to the authorization layer.
