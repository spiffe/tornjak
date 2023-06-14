import { Action } from "redux";
import {
    AgentsList,
    AgentsWorkLoadAttestorInfo,
    ClustersList,
    EntriesList,
    SelectorInfoLabels,
    ServerInfo,
    TornjakServerInfo,
    WorkloadSelectorInfoLabels,
    SpireHealthCheckFreq,
    DebugServerInfo
} from "components/types";

// auth
export const GLOBAL_IS_AUTHENTICATED = 'GLOBAL_IS_AUTHENTICATED';
export const GLOBAL_ACCESS_TOKEN = 'GLOBAL_ACCESS_TOKEN';
export const GLOBAL_USER_ROLES = 'GLOBAL_USER_ROLES';

export interface AuthReducerState {
    globalIsAuthenticated: boolean,
    globalAccessToken: string | undefined,
    globalUserRoles: string[],
}

export interface IsAuthenticatedAction extends Action<typeof GLOBAL_IS_AUTHENTICATED> {
    payload: boolean;
}
export interface AccessTokenAction extends Action<typeof GLOBAL_ACCESS_TOKEN> {
    payload: string | undefined;
}
export interface UserRolesAction extends Action<typeof GLOBAL_USER_ROLES> {
    payload: string[];
}

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
export const GLOBAL_ENTRY_EXPIRY = 'GLOBAL_ENTRY_EXPIRY';

export interface EntriesReducerState {
    globalEntriesList: EntriesList[],
    globalNewEntries: EntriesList[],
    globalEntryExpiryTime: number,
}

export interface EntriesListAction extends Action<typeof GLOBAL_ENTRIES_LIST> {
    payload: EntriesList[];
}

export interface NewEntriesAction extends Action<typeof GLOBAL_NEW_ENTRIES> {
    payload: EntriesList[];
}

export interface EntryExpiryAction extends Action<typeof GLOBAL_ENTRY_EXPIRY> {
    payload: number;
}

// servers
export const GLOBAL_SERVER_SELECTED = 'GLOBAL_SERVER_SELECTED';
export const GLOBAL_SERVER_INFO = 'GLOBAL_SERVER_INFO';
export const GLOBAL_TORNJAK_SERVER_INFO = 'GLOBAL_TORNJAK_SERVER_INFO';
export const GLOBAL_SERVERS_LIST = 'GLOBAL_SERVERS_LIST';
export const GLOBAL_SELECTOR_INFO = 'GLOBAL_SELECTOR_INFO';
export const GLOBAL_WORKLOAD_SELECTOR_INFO = 'GLOBAL_WORKLOAD_SELECTOR_INFO';
export const GLOBAL_SPIRE_HEALTH_CHECK = 'GLOBAL_SPIRE_HEALTH_CHECK';
export const GLOBAL_SPIRE_HEALTH_CHECKING = 'GLOBAL_SPIRE_HEALTH_CHECKING';
export const GLOBAL_SPIRE_HEALTH_CHECK_TIME = 'GLOBAL_SPIRE_HEALTH_CHECK_TIME';
export const GLOBAL_DEBUG_SERVER_INFO = 'GLOBAL_DEBUG_SERVER_INFO';

export interface ServersReducerState {
    globalServerSelected: string,
    globalServerInfo: ServerInfo,
    globalTornjakServerInfo: TornjakServerInfo,
    globalServersList: Array<string>,
    globalSelectorInfo: SelectorInfoLabels,
    globalWorkloadSelectorInfo: WorkloadSelectorInfoLabels,
    globalSpireHealthCheck: boolean,
    globalSpireHealthChecking: boolean,
    globalSpireHealthTime: SpireHealthCheckFreq,
    globalDebugServerInfo: DebugServerInfo,
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

export interface SpireHealthCheckAction extends Action<typeof GLOBAL_SPIRE_HEALTH_CHECK> {
    payload: boolean;
}

export interface SpireHealthCheckingAction extends Action<typeof GLOBAL_SPIRE_HEALTH_CHECKING> {
    payload: boolean;
}

export interface SpireHealthCheckTimeAction extends Action<typeof GLOBAL_SPIRE_HEALTH_CHECK_TIME> {
    payload: SpireHealthCheckFreq;
}

export interface DebugServerInfoAction extends Action<typeof GLOBAL_DEBUG_SERVER_INFO> {
    payload: DebugServerInfo;
}

export type ServersAction =
    ServerSelectedAction |
    TornjakServerInfoAction |
    ServerInfoAction |
    ServersListAction |
    SelectorInfoAction |
    WorkloadSelectorInfoAction |
    SpireHealthCheckAction |
    SpireHealthCheckingAction |
    SpireHealthCheckTimeAction |
    DebugServerInfoAction

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