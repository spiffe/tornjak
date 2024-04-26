# Server plugin: Authorization "AdminViewer"

Please see our documentation on the [authorization feature](./user-management.md) for more complete details. 

The configuration has no inputs. Simply creating a section as below is sufficient for enabling the authorization layer:

A sample configuration file for syntactic referense is below:

```hcl
    Authorization "AdminViewer" {}
```

NOTE: If this feature is enabled without an authentication layer, it will render essentially all calls unauthorizable. 

## Authorization logic implemented

This plugin assumes roles `admin` and `viewer` are passed by the authentication layer. 

From this information, the following logic is applied:

1. If user has `admin` role, can perform any call
2. If user has `viewer` role, can perform all read-only calls (See lists below)
3. If user is authenticated with no role, can perform only `/` Tornjak home call. 

List of read-only calls:
- `/`
- `/api/healthcheck`
- `/api/debugserver`
- `/api/agent/list`
- `/api/entry/list`
- `/api/tornjak/serverinfo`
- `/api/tornjak/selectors/list`
- `/api/tornjak/agents/list`
- `/api/tornjak/clusters/list`

List of writing (admin-only) calls:
- `/api/agent/ban`
- `/api/agent/delete`
- `/api/agent/createjointoken`
- `/api/entry/create`
- `/api/entry/delete`
- `/api/tornjak/selectors/register`
- `/api/tornjak/clusters/create`
- `/api/tornjak/clusters/edit`
- `/api/tornjak/clusters/delete`
