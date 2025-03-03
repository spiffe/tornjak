# Tornjak Deployment via SPIFFE Helm Charts Hardened

## Overview
The [SPIFFE Helm Charts Hardened](https://github.com/spiffe/helm-charts-hardened) repository includes an example for deploying **Tornjak**, a web-based UI and API layer for managing SPIRE infrastructure.

This example provides configurations for deploying **Tornjak Backend** and **Tornjak Frontend**, integrated with SPIRE.

## Deployment Details

### Components Included:
- **Tornjak Backend**: Provides API services for managing SPIRE identities.
- **Tornjak Frontend**: A web UI for viewing and managing SPIRE-related configurations.
- **SPIRE Server**: Manages workload identities and issues SPIFFE IDs.
- **SPIRE Agent**: Runs on workloads to obtain SPIFFE SVIDs.

### Helm Chart Configuration
The main SPIRE Helm chart includes Tornjak as a dependency, defined in `charts/spire/Chart.yaml`:

```yaml
- name: tornjak-frontend
  condition: tornjak-frontend.enabled
  repository: file://./charts/tornjak-frontend
  version: 0.1.0
```
# [TODO]
- Need to get deployment with helm charts working
- Need to work on more detailed documentation steps 