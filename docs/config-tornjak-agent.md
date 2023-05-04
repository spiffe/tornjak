# Tornjak Agent Configuration Reference

This document is a configuration reference for the Tornjak Agent. This is designed after the [SPIRE server config](https://github.com/spiffe/spire/blob/main/doc/spire_server.md). It includes information about plugin types, built-in plugins, the server configuration file, plugin configuration, and command line options for `tornjak-agent` commands.

## General Tornjak Agent Configs
The server config will contain information for the three potential connections: HTTP, TLS, and mTLS. See below for sample configuration:

```hcl
server {

    spire_socket_path = "unix:///tmp/spire-server/private/api.sock" # socket to communicate with SPIRE server

    http {
        enabled = true # if true, opens HTTP. if false, no HTTP connection opened
	    listen_port = ":10000" # if HTTP enabled, opens HTTP listen port at container port 10000
    }

    tls {
        enabled = true # if true, opens TLS. if false, no TLS connection opened
        listen_port = ":20000" # if enabled, opens TLS listen port at container port 20000
        cert = "sample-keys/tls.pem" # path of certificate for TLS
        key = "sample-keys/key.pem" # path of keys for TLS
    }

    mtls {
        enabled = true # if true, opens mTLS. if false, no mTLS connection opened
        listen_port = ":30000" # if enabled, opens mTLS listen port at container port 30000
        cert = "sample-keys/tls.pem" # path of certificate for mTLS
        key = "sample-keys/key.pem" # path of keys for mTLS
        ca = "sample-keys/rootCA.pem" # path of CA for mTLS
    }
}
```

We have three connection types that can be opened by the server simultaneously: HTTP, TLS, and mTLS. At least one must be enabled, or the program will exit immediately. If one connection crashes, the error is logged, and the others will still run. When all crash, the process crashes. 

If a section is omitted, that connection will not be created. If all are omitted, the program will exit immediately. 

If there is no config file given at all, the backend will create one HTTP connection at port 10000. 

## Plugin types

| Type           | Description | Required |
|:---------------|:------------|:---------|
| DataStore      | Provides persistent storage for Tornjak metadata. | True |
| UserManagement | Secures Tornjak agent and enables authorization logic | False |

## Built-in plugins

| Type | Name | Description |
| ---- | ---- | ----------- |
| DataStore | [sql]() | Default SQL storage for Tornjak metadata |
| UserManagement | [keycloak](/docs/plugin_server_auth_keycloak.md) | Requires JWT Bearer Access Token provided for each request. More details in [our auth feature doc](/docs/feature_auth.md) |

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
            connection_string = "/run/spire/data/tornjak.sqlite3"
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
| `--spire-config`       | Config file path for SPIRE server  |         | true     |
| `--tornjak-config`     | Config file path for Tornjak agent |         | true     |
| `--expandEnv`          | If flag included, expand environment variables in Tornjak config | false   | false    |

Note these flags are passed in directly through the Tornjak container. 

### `tornjak-backend serverinfo`
Prints the SPIRE config and Tornjak config given. 

### `tornjak-backend http`

Runs the tornjak server. 

## Further reading

* [Tornjak Agent Architecture Overview](https://github.com/spiffe/tornjak/blob/main/docs/tornjak-agent.md)
* [Tornjak API Documentation](https://github.com/spiffe/tornjak/blob/main/docs/tornjak-ui-api-documentation.md)

