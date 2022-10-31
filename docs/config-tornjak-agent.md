# Tornjak Agent Configuration Reference

This document is a configuration reference for the Tornjak Agent. This is designed after the [SPIRE server config](https://github.com/spiffe/spire/blob/main/doc/spire_server.md). It includes information about plugin types, built-in plugins, the server configuration file, plugin configuration, and command line options for `tornjak-agent` commands.

## General Tornjak Agent Configs
Currently it is possible to add metadata, but there is no functionality for this yet. Sample general Tornjak agent configuration:

```hcl
server {
    metadata = "sample metadata (perhaps include connectivity information and listen-addr)"
}
```

## Plugin types

| Type           | Description | Required |
|:---------------|:------------|:---------|
| DataStore      | Provides persistent storage for Tornjak metadata. | True |
| UserManagement | Secures Tornjak agent and enables authorization logic | False |

## Built-in plugins

| Type | Name | Description |
| ---- | ---- | ----------- |
| DataStore | [sql]() | Default SQL storage for Tornjak metadata |
| UserManagement | [keycloak](/docs/plugin_auth_keycloak.md) | Requires JWT Bearer Access Token provided for each request |

## Plugin configuration

The server configuration file also contains a configuration section for the various SPIRE server plugins. Plugin configurations live inside the top-level `plugins { ... }` section, which has the following format:

```hcl
plugins {
    pluginType "pluginName" {
        ...
        plugin configuration options here
        ...
    }
}
```

The following configuration options are available to configure a plugin:

| Configuration   | Description                              |
| --------------- | ---------------------------------------- |
| plugin_data     | Plugin-specific data                     |

## Sample configuration file

This section includes a sample configuration file for formatting and syntax reference

```hcl
server {
    metadata = "sample metadata"
}

plugins {
    DataStore "sql" {
        plugin_data {
            database_type = "sqlite3"
            connection_string = "./agentlocaldb"
        }
    }

    UserManagement "KeycloakAuth" {
        plugin_data {
            jwksURL = "http://localhost:8080/jwks"
            redirectURL = "http://localhost:10000/*"
        }
    }
}
```

## Command line options

The following flags are available for all tornjak-agent commands:

| Command                | Action                             | Default | Required |
|:-----------------------|:-----------------------------------|:--------| :--------|
| `-spire-config`,`-c`   | Config file path for SPIRE server  |         | True     |
| `-tornjak-config`,`-t` | Config file path for Tornjak agent |         | True     |

### `tornjak-agent http`

Runs the tornjak http server. 

| Command        | Action                                            | Default | Required |
|:---------------|:--------------------------------------------------|:--------| :--------|
| `-listen-addr` | listening address for tornjak agent               | :10000  | false    |
| `-cert`        | CA Cert path for TLS                              |         | false    |
| `-key`         | Key path for TLS                                  |         | false    |
| `mtls-ca`      | CA path for mTLS CA                               |         | false    |
| `tls`          | Enable TLS for http server                        | false   | false    |
| `mtls`         | enable mTLS for http server (overwrites tls flag) | false   | false    |

## Further reading

* [Tornjak Agent Architecture Overview](https://github.com/spiffe/tornjak/blob/main/docs/tornjak-agent.md)
* [Tornjak API Documentation](https://github.com/spiffe/tornjak/blob/main/docs/tornjak-ui-api-documentation.md)

