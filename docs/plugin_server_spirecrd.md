# Server plugin: SPIRECRDManager

Note the SPIRECRDManager is an optional plugin. This plugin enables the creation of SPIRE CRDs on the cluster Tornjak is deployed on. 

The configuration has the following key-value pairs:

| Key        | Description                      | Required            |
| ---------- | -------------------------------- | ------------------- |
| classname  | className label for created CRDs | False               |

A sample configuration file for syntactic reference is below:

```hcl
    SPIREControllerManager {
        plugin_data {
            classname = "spire-mgmt-spire"
        }
    }
```
