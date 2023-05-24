# Server plugin: Authorization "keycloak"

Please see our documentation on the [authorization feature](./feature_auth.md) for more complete details. 

Note that configuring this requires the frontend to be configured to obtain access tokens at the relevant auth server. 

The configuration has the following key-value pairs:

| Key         | Description                                                             | Required | 
| ----------- | ----------------------------------------------------------------------- | -------- |
| jwksURL     | Location of the public keys used to validate access tokens              | True     |
| redirectuRL | Location of the redirect URL to the auth server to obtain access tokens | True     |

A sample configuration file for syntactic referense is below:

```hcl
    UserManagement "KeycloakAuth" {
        plugin_data {
            jwksURL = "http://localhost:8080/jwks"
            redirectURL = "http://localhost:10000/*"
        }
    }
```
