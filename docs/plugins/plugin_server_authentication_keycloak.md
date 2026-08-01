# Server plugin: Authentication "Keycloak"

Please see our documentation on the [authorization feature](./user-management.md) for more complete details.

Note that simply enabling this feature will NOT enable authorization. In order to apply authorization logic to user details, one must also enable an Authorization plugin. Any output from this layer, including authentication errors, are to be interpreted by an Authorization layer.

The configuration has the following key-value pairs:

| Key         | Description                                                             | Required            |
| ----------- | ----------------------------------------------------------------------- | ------------------- |
| issuer      | Issuer URL for OIDC Discovery with external IAM System                  | True                |
| audience    | Expected audience value in received JWT tokens                          | False (Recommended) |
| roleclaim   | Dot-separated path to the roles list in the JWT (see below)             | False (default `realm_access.roles`) |

A sample configuration file for syntactic referense is below:

```hcl
    Authenticator "Keycloak" {
        plugin_data {
            issuer = "http://host.docker.internal:8080/realms/tornjak"
            audience = "tornjak-backend"
            roleclaim = "resource_access.tornjak-backend.roles"
        }
    }
```

NOTE: If audience field is missing or empty, the server will log a warning and NOT perform an audience check.
It is highly recommended `audience` is populated to ensure only tokens meant for the Tornjak Backend are accepted.

## User Info extracted

By default, this plugin assumes roles are available in `realm_access.roles` in the JWT (Keycloak's default
location for realm roles) and passes this list as user.roles.

If your roles live elsewhere in the token - for example under `resource_access.<clientId>.roles`, which is
where Keycloak places client-scoped roles - set `roleclaim` to a dot-separated path to that claim. The final
segment must resolve to a list of strings; anything else (a missing claim, or a claim that isn't a string list)
results in no roles being extracted for that request.

These mapped values are passed to the authorization layer.
