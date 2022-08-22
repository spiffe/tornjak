import { Action } from "redux";
import { 
    AgentsList, 
    AgentsWorkLoadAttestorInfo, 
    ClustersList, 
    EntriesList, 
    SelectorInfoLabels, 
    ServerInfo,
    TornjakServerInfo, 
    WorkloadSelectorInfoLabels
} from "components/types";

// agents
export const GLOBAL_AGENTS_LIST = 'GLOBAL_AGENTS_LIST';
export const GLOBAL_AGENTS_WORKLOADATTESTOR_INFO = 'GLOBAL_AGENTS_WORKLOADATTESTOR_INFO'

export interface AgentsReducerState {
    globalAgentsList: AgentsList[],
    globalAgentsWorkLoadAttestorInfo: AgentsWorkLoadAttestorInfo[],
}

export interface AgentsListAction extends Action<typeof GLOBAL_AGENTS_LIST> {
    payload: AgentsList[];
}
export interface AgentWorkloadSelectorInfoAction extends Action<typeof GLOBAL_AGENTS_WORKLOADATTESTOR_INFO> {
    payload: AgentsWorkLoadAttestorInfo[];
}

// clusters
export const GLOBAL_CLUSTERS_LIST = 'GLOBAL_CLUSTERS_LIST';
export const GLOBAL_CLUSTER_TYPE_INFO = 'GLOBAL_CLUSTER_TYPE_INFO';

export interface ClustersReducerState {
    globalClustersList: ClustersList[],
    globalClusterTypeInfo: string[],
}

export interface ClustersListUpdateAction extends Action<typeof GLOBAL_CLUSTERS_LIST> {
    payload: ClustersList[];
}
export interface ClusterTypeInfoAction extends Action<typeof GLOBAL_CLUSTER_TYPE_INFO> {
    payload: string[];
}

// entries
export const GLOBAL_ENTRIES_LIST = 'GLOBAL_ENTRIES_LIST';
export const GLOBAL_NEW_ENTRIES = 'GLOBAL_NEW_ENTRIES';

export interface EntriesReducerState {
    globalEntriesList: EntriesList[],
    globalNewEntries: EntriesList[],
}

export interface EntriesListAction extends Action<typeof GLOBAL_ENTRIES_LIST> {
    payload: EntriesList[];
}

export interface NewEntriesAction extends Action<typeof GLOBAL_NEW_ENTRIES> {
    payload: EntriesList[];
}

// servers
export const GLOBAL_SERVER_SELECTED = 'GLOBAL_SERVER_SELECTED';
export const GLOBAL_SERVER_INFO = 'GLOBAL_SERVER_INFO';
export const GLOBAL_TORNJAK_SERVER_INFO = 'GLOBAL_TORNJAK_SERVER_INFO';
export const GLOBAL_SERVERS_LIST = 'GLOBAL_SERVERS_LIST';
export const GLOBAL_SELECTOR_INFO = 'GLOBAL_SELECTOR_INFO';
export const GLOBAL_WORKLOAD_SELECTOR_INFO = 'GLOBAL_WORKLOAD_SELECTOR_INFO';

export interface ServersReducerState {
    globalServerSelected: string,
    globalServerInfo: ServerInfo,
    globalTornjakServerInfo: TornjakServerInfo,
    globalServersList: Array<string>,
    globalSelectorInfo: SelectorInfoLabels,
    globalWorkloadSelectorInfo: WorkloadSelectorInfoLabels ,
}

export interface ServerSelectedAction extends Action<typeof GLOBAL_SERVER_SELECTED> {
    payload: string;
}

export interface ServerInfoAction extends Action<typeof GLOBAL_SERVER_INFO> {
    payload: ServerInfo;
}

export interface TornjakServerInfoAction extends Action<typeof GLOBAL_TORNJAK_SERVER_INFO> {
    payload: TornjakServerInfo;
}

export interface ServersListAction extends Action<typeof GLOBAL_SERVERS_LIST> {
    payload: Array<string>;
}
export interface SelectorInfoAction extends Action<typeof GLOBAL_SELECTOR_INFO> {
    payload: SelectorInfoLabels;
}
export interface WorkloadSelectorInfoAction extends Action<typeof GLOBAL_WORKLOAD_SELECTOR_INFO> {
    payload: WorkloadSelectorInfoLabels;
}

export type ServersAction =
    ServerSelectedAction |
    TornjakServerInfoAction |
    ServerInfoAction |
    ServersListAction |
    SelectorInfoAction |
    WorkloadSelectorInfoAction

// tornjak
export const GLOBAL_MESSAGE = 'GLOBAL_MESSAGE';
export const GLOBAL_CLICKED_DASHBOARD_TABLE = 'GLOBAL_CLICKED_DASHBOARD_TABLE';
export interface TornjakReducerState {
    globalErrorMessage: string,
    globalClickedDashboardTable: string,
}

export interface TornjakMessageAction extends Action<typeof GLOBAL_MESSAGE> {
    payload: string;
}
export interface ClickedDashboardTableAction extends Action<typeof GLOBAL_CLICKED_DASHBOARD_TABLE> {
    payload: string;
}

export type TornjakAction = 
    TornjakMessageAction | 
    ClickedDashboardTableAction