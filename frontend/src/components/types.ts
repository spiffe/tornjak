// agents

export interface SPIFFEID {
  // From https://github.com/spiffe/spire-api-sdk/blob/main/proto/spire/api/types/spiffeid.pb.go
  // Trust domain portion the SPIFFE ID (e.g. "example.org")
  trust_domain: string;
  // The path component of the SPIFFE ID (e.g. "/foo/bar/baz"). The path
  // SHOULD have a leading slash. Consumers MUST normalize the path before
  // making any sort of comparison between IDs.
  path: string;
}

export interface Selector {
  // From https://github.com/spiffe/spire-api-sdk/blob/main/proto/spire/api/types/selector.pb.go
  // The type of the selector. This is typically the name of the plugin that
  // produces the selector.
  type: string;
  value: string;
}

export interface AgentsList {
  // From https://github.com/spiffe/spire-api-sdk/blob/main/proto/spire/api/types/agent.pb.go
  id: SPIFFEID; // SPIFFE ID of the agent.
  attetstation_type: string; // The method by which the agent attested.
  x509svid_serial_number: string; // The X509-SVID serial number.
  x509svid_expires_at: bigint; //  The X509-SVID expiration (seconds since Unix epoch).
  selectors: Array<Selector>; // The selectors attributed to the agent during attestation.
  banned: boolean;
}

export interface AgentsWorkLoadAttestorInfo {
  spiffeid: string; // SPIFFEE ID of agent
  plugin: string; // Workload attestor plugin selected for agent
  cluster: string; // Cluster agent is associated with
}


// clusters
export interface ClustersList {
  name: string; // Name of Cluster
  editedName: string; // Edited Name if Cluster Name is edited from original
  creationTime: string; // Time cluster is created
  domainName: string; // Domain Name of cluster if any
  managedBy: string; // Person/ entity managing the cluster
  platformType: string; // Platform type of the cluster
  agentsList: Array<string>; // List of agents associated with the cluster
}

// entries
export interface EntriesList {
  // From https://github.com/spiffe/spire-api-sdk/blob/main/proto/spire/api/types/entry.pb.go
  id: string; // Globally unique ID for the entry.
  spiffe_id: SPIFFEID; // The SPIFFE ID of the identity described by this entry.
  // Who the entry is delegated to. If the entry describes a node, this is
  // set to the SPIFFE ID of the SPIRE server of the trust domain (e.g.
  // spiffe://example.org/spire/server). Otherwise, it will be set to a node
  // SPIFFE ID.
  parent_id: SPIFFEID;
  // The selectors which identify which entities match this entry. If this is
  // an entry for a node, these selectors represent selectors produced by
  // node attestation. Otherwise, these selectors represent those produced by
  // workload attestation.
  selectors: Array<Selector>;
  jwt_svid_ttl: number; // time to live for JWT SVID in seconds
  x509_svid_ttl: number; // time to live for x509-SVID in seconds
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

export type link = string;

// servers
// TODO: Adjust debug server info type definition in case of nested spire, can have more than two svids
export interface DebugServerInfo {
  svid_chain: [
        {
            id: {
                trust_domain: string,
                path: string
            },
            expires_at: number,
            subject: string
        },
        {
            id: {
                trust_domain: string
            },
            expires_at: number,
            subject: string
        }
    ],
    uptime: number,
    federated_bundles_count: number
}

export interface TornjakServerInfo {
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

export interface ServerInfo {
  trustDomain: string; // Trust domain of server
  nodeAttestorPlugin: string; // Node Attestor Plugin of server
}

export interface SpireHealthCheckFreq {
  SpireHealtCheckTime: number; // Spire health check time
  SpireHealthCheckFreqDisplay: string; // SPIRE health check dropdown display/ for persistence
}

// tornjak 
export interface StringLabels {
  label: string;
}

export type AgentLabels = StringLabels;
export type SelectorLabels = StringLabels;

export interface StringLabelsWithIndexStrings {
  [index: string]: StringLabels[]
}

export type SelectorInfoLabels = StringLabelsWithIndexStrings;
export type WorkloadSelectorInfoLabels = StringLabelsWithIndexStrings;

// token
export interface AccessToken {
  // From https://www.keycloak.org/docs-api/11.0/javadocs/org/keycloak/representations/AccessToken.html
  acr: string; // Authentication Context Class Reference
  "allowed-origins": string[]; // allowed origins
  auth_time: bigint; // authentication time
  azp: string; // authorized party - to whom this token is issued
  email: string; // email of user
  email_verified: boolean; // wheather email is verified or not
  exp: bigint; // expiration time
  family_name: string; // family name of user
  given_name: string; // given name of user
  iat: bigint; // time issued
  iss: string; // entity that created and signed the token
  jti: string; // 
  name: string; // name of user
  nonce: string; // string value used to associate a Client session with an ID Token
  preferred_username: string; // 
  realm_access: {"roles": string[]}; // realm attributes
  scope: string; // scope
  session_state: string; // session state
  sid: string; // unique session identifier of a user on a browser or a device
  sub: string; // to whom this entity refers to
  typ: string; // type of token
}

export type PieChartEntry = {
  group: string,
  value: number
}
