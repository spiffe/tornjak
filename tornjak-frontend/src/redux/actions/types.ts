import { Action } from "redux";

//agents
export const GLOBAL_AGENTS_LIST = 'GLOBAL_AGENTS_LIST';
export const GLOBAL_AGENTS_WORKLOADATTESTOR_INFO = 'GLOBAL_AGENTS_WORKLOADATTESTOR_INFO'
export interface AgentsListType {
    id: {
        trust_domain: string;
        path: string;
    };
    attetstation_type: string;
    x509svid_serial_number: string;
    x509svid_expires_at: string;
    selectors: Array<{type: string; value: string;}>;
}

export interface AgentsWorkLoadAttestorInfoType {
    spiffeid: string;
    plugin: string;
    cluster: string;
}

export interface AgentsReducerStateType {
    globalAgentsList: AgentsListType[],
    globalAgentsWorkLoadAttestorInfo: AgentsWorkLoadAttestorInfoType[],
}

export interface AgentsListAction extends Action<typeof GLOBAL_AGENTS_LIST>{
    payload: {
        globalAgentsList: AgentsListType[];
    }
}
export interface AgentWorkloadSelectorInfoAction extends Action<typeof GLOBAL_AGENTS_WORKLOADATTESTOR_INFO>{
    payload: {
        globalAgentsWorkLoadAttestorInfo: AgentsWorkLoadAttestorInfoType[];
    }
}

//clusters
export const GLOBAL_CLUSTERS_LIST = 'GLOBAL_CLUSTERS_LIST';
export const GLOBAL_CLUSTER_TYPE_INFO = 'GLOBAL_CLUSTER_TYPE_INFO';
export interface ClustersListType {
    name: string;
    editedName: string;
    creationTime: string;
    domainName: string;
    managedBy: string;
    platformType: string;
    agentsList: Array<string>;
}

export interface ClustersReducerStateType {
    globalClustersList: ClustersListType[],
    globalClusterTypeInfo: String[],
}

export interface ClustersListUpdateAction extends Action<typeof GLOBAL_CLUSTERS_LIST>{
    payload: {
        globalClustersList: ClustersListType[];
    }
}
export interface ClusterTypeInfoAction extends Action<typeof GLOBAL_CLUSTER_TYPE_INFO>{
    payload: {
        globalClusterTypeInfo: string[];
    }
}

//entries
export const GLOBAL_ENTRIES_LIST = 'GLOBAL_ENTRIES_LIST';
export interface EntriesListType {
    id: string;
    spiffe_id: {
        trust_domain: string;
        path: string;
    };
    parent_id: {
        trust_domain: string;
        path: string;
    };
    selectors: Array<{type: string; value: string;}>
}

export interface EntriesReducerStateType {
    globalEntriesList: EntriesListType[],
}

export interface EntriesListAction extends Action<typeof GLOBAL_ENTRIES_LIST>{
    payload: {
        globalEntriesList: EntriesListType[];
    }
}

//servers
export const GLOBAL_SERVER_SELECTED = 'GLOBAL_SERVER_SELECTED';
export const GLOBAL_SERVER_INFO = 'GLOBAL_SERVER_INFO';
export const GLOBAL_TORNJAK_SERVER_INFO = 'GLOBAL_TORNJAK_SERVER_INFO';
export const GLOBAL_SERVERS_LIST = 'GLOBAL_SERVERS_LIST';
export const GLOBAL_SELECTOR_INFO = 'GLOBAL_SELECTOR_INFO';
export const GLOBAL_WORKLOAD_SELECTOR_INFO = 'GLOBAL_WORKLOAD_SELECTOR_INFO';
// interface TornjakServerInfoType {
//     plugins: Object;
//     trustDomain: string;
//     verboseConfig: string;
// }

// interface ServerInfoType {
//     data: {
//         trustDomain: string;
//         nodeAttestorPlugin: string;
//     }
// }

export interface ServersReducerStateType {
    globalServerSelected: string,
    globalServerInfo: Object,
    globalTornjakServerInfo: Object,
    globalServersList: Array<string>,
    globalSelectorInfo: Object,
    globalWorkloadSelectorInfo: Object,
}

export interface ServerSelectedAction extends Action<typeof GLOBAL_SERVER_SELECTED>{
    payload: {
        globalServerSelected: string
    };
}

export interface ServerInfoAction extends Action<typeof GLOBAL_SERVER_INFO>{
    payload: {
        globalServerInfo: Object
    };
}

export interface TornjakServerInfoAction extends Action<typeof GLOBAL_TORNJAK_SERVER_INFO>{
    payload: {
        globalTornjakServerInfo: Object
    };
}

export interface ServersListAction extends Action<typeof GLOBAL_SERVERS_LIST>{
    payload: {
        globalServersList: Array<string>
    };
}
export interface SelectorInfoAction extends Action<typeof GLOBAL_SELECTOR_INFO>{
    payload: {
        globalSelectorInfo: Object
    };
}
export interface WorkloadSelectorInfoAction extends Action<typeof GLOBAL_WORKLOAD_SELECTOR_INFO>{
    payload: {
        globalWorkloadSelectorInfo: Object
    };
}

export type ServersAction =
    ServerSelectedAction |
    TornjakServerInfoAction |
    ServerInfoAction |
    ServersListAction |
    SelectorInfoAction |
    WorkloadSelectorInfoAction

//tornjak
export const GLOBAL_MESSAGE = 'GLOBAL_MESSAGE';
export const GLOBAL_CLICKED_DASHBOARD_TABLE = 'GLOBAL_CLICKED_DASHBOARD_TABLE';
export interface TornjakReducerStateType {
    globalErrorMessage: string,
    globalClickedDashboardTable: string,
}

export interface TornjakMessageAction extends Action<typeof GLOBAL_MESSAGE>{
    payload?: string;
}
export interface ClickedDashboardTableAction extends Action<typeof GLOBAL_CLICKED_DASHBOARD_TABLE>{
    payload?: string;
}