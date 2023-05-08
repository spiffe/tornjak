# Tornjak Server Configuration Reference

This document is a reference for the Tornjak server, and it follows the [SPIRE server config](https://github.com/spiffe/spire/blob/main/doc/spire_server.md). It includes information about plugin types, built-in plugins, the server configuration file, plugin configuration, and command line options for `tornjak-agent` commands.

## Contents
- [Command line options](#command-line-options)
- [The Tornjak Config](#the-tornjak-config)
- [General Tornjak Server Configs](#general-tornjak-server-configs)
- [About Tornjak Plugins](#about-tornjak-plugins)
- [Sample Configuration Files](#sample-configuration-files)
- [Further Reading](#further-reading)

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

## The Tornjak Config

The Tornjak config that is passed in must follow a specific format. Examples of this format can be found [below](#sample-configuration-files). In general, it is split into the `server` section with [general Tornjak server configs](#general-tornjak-server-configs), and the `plugins` section. 

## General Tornjak Server Configs
The server config will contain information for the three potential connections: HTTP, TLS, and mTLS. See below for sample configuration:

```hcl
server {

    spire_socket_path = "unix:///tmp/spire-server/private/api.sock" # socket to communicate with SPIRE server

    http {
        enabled = true # if true, opens HTTP. if false, no HTTP connection opened
	    port = "10000" # if HTTP enabled, opens HTTP listen port at container port 10000
    }

    tls {
        enabled = true # if true, opens TLS. if false, no TLS connection opened
        port = "20000" # if enabled, opens TLS listen port at container port 20000
        cert = "sample-keys/tls.pem" # path of certificate for TLS
        key = "sample-keys/key.pem" # path of keys for TLS
    }

    mtls {
        enabled = true # if true, opens mTLS. if false, no mTLS connection opened
        port = "30000" # if enabled, opens mTLS listen port at container port 30000
        cert = "sample-keys/tls.pem" # path of certificate for mTLS
        key = "sample-keys/key.pem" # path of keys for mTLS
        ca = "sample-keys/rootCA.pem" # path of CA for mTLS
    }
}
```

We have three connection types that can be opened by the server simultaneously: HTTP, TLS, and mTLS. At least one must be enabled, or the program will exit immediately. If one connection crashes, the error is logged, and the others will still run. When all crash, the Tornjak server exits and the container terminates.

If a specific section is omitted or not enabled, that connection will not be created. If all are omitted or disabled, the program will exit immediately with an appropriate error log. 

## About Tornjak plugins

### Plugin types

| Type           | Description | Required |
|:---------------|:------------|:---------|
| DataStore      | Provides persistent storage for Tornjak metadata. | True |
| UserManagement | Secures access to Tornjak agent and enables authorization logic | False |

### Built-in plugins

| Type | Name | Description |
| ---- | ---- | ----------- |
| DataStore | [sql]() | Default SQL storage for Tornjak metadata |
| UserManagement | [keycloak](/docs/plugin_server_auth_keycloak.md) | Requires JWT Bearer Access Token provided for each request. More details in [our auth feature doc](/docs/feature_auth.md) |

### Plugin configuration

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

## Sample configuration files

The most basic configuration file can be found [here](./conf/agent/base.conf).

We have an extended configuration file with comments on each section found [here](./conf/agent/full.conf).

## Further reading

* [Tornjak Agent Architecture Overview](https://github.com/spiffe/tornjak/blob/main/docs/tornjak-agent.md)
* [Tornjak API Documentation](https://github.com/spiffe/tornjak/blob/main/docs/tornjak-ui-api-documentation.md)

