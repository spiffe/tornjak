// agents

export interface SPIFFEIDType {
  // From https://github.com/spiffe/spire-api-sdk/blob/main/proto/spire/api/types/spiffeid.pb.go
  // Trust domain portion the SPIFFE ID (e.g. "example.org")
  trust_domain: string;
  // The path component of the SPIFFE ID (e.g. "/foo/bar/baz"). The path
  // SHOULD have a leading slash. Consumers MUST normalize the path before
  // making any sort of comparison between IDs.
  path: string;
}

export interface SelectorType {
  // From https://github.com/spiffe/spire-api-sdk/blob/main/proto/spire/api/types/selector.pb.go
  // The type of the selector. This is typically the name of the plugin that
  // produces the selector.
  type: string;
  value: string;
}

export interface AgentsListType {
  // From https://github.com/spiffe/spire-api-sdk/blob/main/proto/spire/api/types/agent.pb.go
  id: SPIFFEIDType; // SPIFFE ID of the agent.
  attetstation_type: string; // The method by which the agent attested.
  x509svid_serial_number: string; // The X509-SVID serial number.
  x509svid_expires_at: number; //  The X509-SVID expiration (seconds since Unix epoch).
  selectors: Array<SelectorType>; // The selectors attributed to the agent during attestation.
}

export interface AgentsWorkLoadAttestorInfoType {
  spiffeid: string; // SPIFFEE ID of agent
  plugin: string; // Workload attestor plugin selected for agent
  cluster: string; // Cluster agent is associated with
}


// clusters
export interface ClustersListType {
  name: string; // Name of Cluster
  editedName: string; // Edited Name if Cluster Name is edited from original
  creationTime: string; // Time cluster is created
  domainName: string; // Domain Name of cluster if any
  managedBy: string; // Person/ entity managing the cluster
  platformType: string; // Platform type of the cluster
  agentsList: Array<string>; // List of agents associated with the cluster
}

// entries
export interface EntriesListType {
  // From https://github.com/spiffe/spire-api-sdk/blob/main/proto/spire/api/types/entry.pb.go
  id: string; // Globally unique ID for the entry.
  spiffe_id: SPIFFEIDType; // The SPIFFE ID of the identity described by this entry.
  // Who the entry is delegated to. If the entry describes a node, this is
  // set to the SPIFFE ID of the SPIRE server of the trust domain (e.g.
  // spiffe://example.org/spire/server). Otherwise, it will be set to a node
  // SPIFFE ID.
  parent_id: SPIFFEIDType;
  // The selectors which identify which entities match this entry. If this is
  // an entry for a node, these selectors represent selectors produced by
  // node attestation. Otherwise, these selectors represent those produced by
  // workload attestation.
  selectors: Array<SelectorType>;
  ttl: number; // The time to live for identities issued for this entry (in seconds).
  federates_with: string[]; // The names of trust domains the identity described by this entry federates with
  // Whether or not the identity described by this entry is an administrative
  // workload. Administrative workloads are granted additional access to
  // various managerial server APIs, such as entry registration.
  admin: boolean;
  // Whether or not the identity described by this entry represents a
  // downstream SPIRE server. Downstream SPIRE servers have additional access
  // to various signing APIs, such as those used to sign X.509 CA
  // certificates and publish JWT signing keys.
  downstream: boolean;
  expires_at: number; // When the entry expires (seconds since Unix epoch).
  dns_names: string[]; // A list of DNS names associated with the identity described by this entry.
  revision_number: number; // Revision number is bumped every time the entry is updated
  store_svid: boolean; // Determines if the issued identity is exportable to a store
}

// servers
export interface TornjakServerInfoType {
  // Plugins for tornjak server info
  plugins: {
    DataStore: string[];
    KeyManager: string[];
    NodeAttestor: string[];
    NodeResolver: string[];
    Notifier: string[];
  };
  trustDomain: string; // Trust domain of server
  verboseConfig: string; // More detailed metadata on server
}

export interface ServerInfoType {
  data: {
    trustDomain: string; // Trust domain of server
    nodeAttestorPlugin: string; // Node Attestor Plugin of server
  }
}