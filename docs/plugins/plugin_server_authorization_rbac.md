# Server plugin: Authorization "RBAC"

Please see our documentation on the [authorization feature](./user-management.md) for more complete details.

This configuration has the following inputs:

| Key | Description | Required |
| --- | ----------- | -------- |
| name | name of the policy for logging purposes | no |
| `role "<x>" {desc = "<y>"}` | `<x>` is the name of a role that can be allowed access; `<y>` is a short description | no |
| `API "<x>" {allowed_roles = ["<z1>", ...]}` | `<x>` is the name of the API that will allow access to roles listed such as `<z1>` | no |

There can (and likely will be) multiple `role` and `API` blocks. If there are no role blocks, no API will be allowed any access. If there is a missing API block, no access will be granted for that API.

A sample configuration file for syntactic referense is below:

```hcl
Authorizer "RBAC" {
  plugin_data {
    name = "Admin Viewer Policy"
    role "admin" { desc = "admin person" }
    role "viewer" { desc = "viewer person" }
    role "" { desc = "authenticated person" }

    API "/" { allowed_roles = [""] }
    API "/api/healthcheck" { allowed_roles = ["admin", "viewer"] }
    API "/api/debugserver" { allowed_roles = ["admin", "viewer"] }
    API "/api/agent/list" { allowed_roles = ["admin", "viewer"] }
    API "/api/entry/list" { allowed_roles = ["admin", "viewer"] }
    API "/api/tornjak/serverinfo" { allowed_roles = ["admin", "viewer"] }
    API "/api/tornjak/selectors/list" { allowed_roles = ["admin", "viewer"] }
    API "/api/tornjak/agents/list" { allowed_roles = ["admin", "viewer"] }
    API "/api/tornjak/clusters/list" { allowed_roles = ["admin", "viewer"] }
    API "/api/agent/ban" { allowed_roles = ["admin"] }
    API "/api/agent/delete" { allowed_roles = ["admin"] }
    API "/api/agent/createjointoken" { allowed_roles = ["admin"] }
    API "/api/entry/create" { allowed_roles = ["admin"] }
    API "/api/entry/delete" { allowed_roles = ["admin"] }
    API "/api/tornjak/selectors/register" { allowed_roles = ["admin"] }
    API "/api/tornjak/clusters/create" { allowed_roles = ["admin"] }
    API "/api/tornjak/clusters/edit" { allowed_roles = ["admin"] }
    API "/api/tornjak/clusters/delete" { allowed_roles = ["admin"] }
  }
}
```

NOTE: If this feature is enabled without an authentication layer, it will render all calls uncallable.

The above specification assumes roles `admin` and `viewer` are passed by the authentication layer. In this example, the following apply:

1. If user has `admin` role, can perform any call
2. If user has `viewer` role, can perform all read-only calls (See lists below)
3. If user is authenticated with no role, can perform only `/` Tornjak home call.

## Valid inputs

There are a couple failure cases in which the plugin will fail to initialize and the Tornjak backend will not run:

1. If an included API block has an undefined API (`API "<x>" {...}` where `x` is not a Tornjak API)
2. If an included API block has an undefined role (There exists `API "<x>" {allowed_roles = [..., "<y>", ...]}` such that for all `role "<z>" {...}`, `y != z`)

## The empty string role ""

If there is a role listed with name `""`, this enables some APIs to allow all users where the authentication layer does not return error. In the above example, only the `/` API has this behavior.

## Additional behavior specification

If there is a role that is not included as an `allowed_role` in any API block, a user will not be granted access to any API based on that role.
