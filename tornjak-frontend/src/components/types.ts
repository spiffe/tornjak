export interface AgentItem {
    attestation_type: string,
    id: {
      path: string,
      trust_domain: string,
    },
    selectors: Object[],
    x509svid_expires_at: number,
    x509svid_serial_number: string,
  }

  export interface ClusterItem {
    agentsList: String[],
    creationTime: string,
    domainName: string,
    editedName: string,
    managedBy: string,
    name: string,
    platformType: string,
  }

  export interface EntryItem {
    id: string,
    parent_id: {
      trust_domain: string,
      path: string,
    },
    selectors: Object[],
    spiffe_id: {
      trust_domain: string,
      path: string,
    }
  }

  export interface AgentsWorkloadAttestorInfoItem {
      spiffeid: string,
      plugin: string, 
      cluster: string,
  }

  export interface ServerInfo {
    data: {
      nodeAttestorPlugin: string,
      trustDomain: string,
    }
  }