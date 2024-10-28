# Server plugin: SPIRECRDManager

Note the SPIRECRDManager is an optional plugin. This plugin enables the creation of SPIRE CRDs on the cluster Tornjak is deployed on. It enables the following API calls:

- `GET /api/v1/spire-controller-manager/clusterfederatedtrustdomains`

> [!IMPORTANT]
> This plugin requires two things: (a) That Tornjak is deployed in the same cluster as the relevant CRDs as it uses its own service account token to talk to the kube API server. (b) That the proper permissions are given to the Service Account token that Tornjak will use. Current Helm charts deploy SPIRE Controller manager and Tornjak in the same pod as the SPIRE server, so no extra configuration is necessary if deployed this way.

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
