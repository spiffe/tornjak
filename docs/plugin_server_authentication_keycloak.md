# Server plugin: Authentication "Keycloak"

Please see our documentation on the [authorization feature](./user-management.md) for more complete details. 

Note that simply enabling this feature will only perform authentication. In order to apply authorization logic to user details, one must also enable an Authorization plugin. 

The configuration has the following key-value pairs:

| Key         | Description                                                             | Required            | 
| ----------- | ----------------------------------------------------------------------- | ------------------- |
| issuer      | Issuer URL for OIDC Discovery with external IAM System                  | True                |
| audience    | Expected audience value in received JWT tokens                          | False (Recommended) |

A sample configuration file for syntactic referense is below:

```hcl
    Authentication "Keycloak" {
        plugin_data {
            issuer = "http://localhost:8080/realms/tornjak"
            audience = "tornjak-backend"
        }
    }
```

NOTE: If audience field is missing or empty, the server will log a warning and NOT perform an audience check. 
It is highly recommended `audience` is populated to ensure only tokens meant for the Tornjak Backend are accepted. 

## User Info extracted

This plugin assumes roles are available in `realm_access.roles` in the JWT and maps the following values:

| JWT                            | Mapped role           |
| ------------------------------ | --------------------- |
| `tornjak-viewer-realm-role`    | `viewer`              |
| `tornjak-admin-realm-role`     | `admin`               |

These mapped values are passed to the authorization layer. 