import { ThunkAction } from 'redux-thunk';
import { RootState } from 'redux/reducers';
import {
    GLOBAL_SERVER_SELECTED,
    GLOBAL_ENTRIES_LIST,
    GLOBAL_AGENTS_LIST,
    GLOBAL_SERVER_INFO,
    GLOBAL_TORNJAK_SERVER_INFO,
    GLOBAL_SERVERS_LIST,
    GLOBAL_SELECTOR_INFO,
    GLOBAL_MESSAGE,
    GLOBAL_WORKLOAD_SELECTOR_INFO,
    GLOBAL_AGENTS_WORKLOADATTESTOR_INFO,
    GLOBAL_CLUSTERS_LIST,
    GLOBAL_CLUSTER_TYPE_INFO,
    GLOBAL_CLICKED_DASHBOARD_TABLE,
    ClustersListUpdateAction,
    ClusterTypeInfoAction,
    TornjakMessageAction,
    ServerSelectedAction,
    TornjakServerInfoAction,
    ServerInfoAction,
    ServersListAction,
    SelectorInfoAction,
    EntriesListAction,
    AgentsListAction,
    WorkloadSelectorInfoAction,
    AgentWorkloadSelectorInfoAction,
    ClickedDashboardTableAction,
    NewEntriesAction,
    GLOBAL_NEW_ENTRIES,
} from './types';

import { 
    AgentsList, 
    AgentsWorkLoadAttestorInfo, 
    ClustersList, 
    EntriesList, 
    SelectorInfoLabels, 
    ServerInfo, 
    TornjakServerInfo, 
    WorkloadSelectorInfoLabels
} from 'components/types';

// Expected input - List of clusters with their info
// clustersListUpdateFunc returns the list of clusters with their info
export function clustersListUpdateFunc(globalClustersList: ClustersList[]): ThunkAction<void, RootState, undefined, ClustersListUpdateAction> {
    return dispatch => {
        dispatch({
            type: GLOBAL_CLUSTERS_LIST,
            payload: globalClustersList
        });
    }
}

// Expected input - 
// {
//  "label": "clustertype1",
//  "label": "clustertype2"
// }
// clusterTypeInfoFunc returns the list of available cluster types
export function clusterTypeInfoFunc(globalClusterTypeInfo: string[]): ThunkAction<void, RootState, undefined, ClusterTypeInfoAction> {
    return dispatch => {
        dispatch({
            type: GLOBAL_CLUSTER_TYPE_INFO,
            payload: globalClusterTypeInfo
        });
    }
}

// Expected input - "Error Message/ Success Message"
// tornjakMessageFunc returns the Error Message/ Success Message of an executed function
export function tornjakMessageFunc(globalErrorMessage: string): ThunkAction<void, RootState, undefined, TornjakMessageAction> {
    return dispatch => {
        dispatch({
            type: GLOBAL_MESSAGE,
            payload: globalErrorMessage
        });
    }
}

// Expected input - "ServerName"
// serverSelectedFunc returns the server selected in the redux state
export function serverSelectedFunc(globalServerSelected: string): ThunkAction<void, RootState, undefined, ServerSelectedAction> {
    return dispatch => {
        dispatch({
            type: GLOBAL_SERVER_SELECTED,
            payload: globalServerSelected
        });
    }
}

// Expected input - "TornjakServerInfo" struct (as JSON) based on 
// TornjakServerInfo in /api/types.go
// tornjakServerInfoUpdateFunc returns the tornjak server info of the selected server
export function tornjakServerInfoUpdateFunc(globalTornjakServerInfo: TornjakServerInfo): ThunkAction<void, RootState, undefined, TornjakServerInfoAction> {
    return dispatch => {
        dispatch({
            type: GLOBAL_TORNJAK_SERVER_INFO,
            payload: globalTornjakServerInfo
        });
    }
}

// Expected input - 
//  {
//      "data": 
//      {
//        "trustDomain": trustDomain,
//        "nodeAttestorPlugin": nodeAttestorPlugin
//      }
//  }
// serverInfoUpdateFunc returns the server trust domain and nodeAttestorPlugin
export function serverInfoUpdateFunc(globalServerInfo: ServerInfo): ThunkAction<void, RootState, undefined, ServerInfoAction> {
    return dispatch => {
        dispatch({
            type: GLOBAL_SERVER_INFO,
            payload: globalServerInfo
        });
    }
}

// Expected input - 
//  [
//      "server1": 
//      {
//        "name": Server1Name,
//        "address": Server1Address,
//        "tls": false/true,
//        "mtls": false/true,
//      },
//      "server2": 
//      {
//        "name": Server2Name,
//        "address": Server2Address,
//        "tls": false/true,
//        "mtls": false/true,
//      }
//  ]
// serversListUpdateFunc returns the list of available servers and their basic info
export function serversListUpdateFunc(globalServersList: Array<string>): ThunkAction<void, RootState, undefined, ServersListAction> {
    return dispatch => {
        dispatch({
            type: GLOBAL_SERVERS_LIST,
            payload: globalServersList
        });
    }
}

// Expected input - 
// [
//  "selector1": [
//      {
//        "label": "selector1:...."
//      },
//      {
//        "label": "selector1:...."
//      },
//    ],
//    "selector2": [
//      {
//        "label": "selector2:...."
//      },
//      {
//        "label": "selector2:...."
//      },
//    ]
// ]
// selectorInfoFunc returns the list of available selectors and their options
export function selectorInfoFunc(globalSelectorInfo: SelectorInfoLabels): ThunkAction<void, RootState, undefined, SelectorInfoAction> {
    return dispatch => {
        dispatch({
            type: GLOBAL_SELECTOR_INFO,
            payload: globalSelectorInfo
        });
    }
}

// Expected input - List of entries with their info
// json representation from SPIFFE golang documentation - https://github.com/spiffe/spire/blob/v0.12.0/proto/spire/types/entry.pb.go#L28-L67
// entriesListUpdateFunc returns the list of entries with their info
export function entriesListUpdateFunc(globalEntriesList: EntriesList[]): ThunkAction<void, RootState, undefined, EntriesListAction> {
    return dispatch => {
        dispatch({
            type: GLOBAL_ENTRIES_LIST,
            payload: globalEntriesList
        });
    }
}

// Expected input - List of new entries with their info
// json representation from SPIFFE golang documentation - https://github.com/spiffe/spire/blob/v0.12.0/proto/spire/types/entry.pb.go#L28-L67
// newEntriesUpdateFunc returns the list of new entries to be created from yaml with their info
export function newEntriesUpdateFunc(globalNewEntries: EntriesList[]): ThunkAction<void, RootState, undefined, NewEntriesAction> {
    return dispatch => {
        dispatch({
            type: GLOBAL_NEW_ENTRIES,
            payload: globalNewEntries
        });
    }
}

// Expected input - List of agents with their info
// json representation from SPIFFE golang documentation - https://github.com/spiffe/spire/blob/v0.12.0/proto/spire/types/agent.pb.go#L28-L45
// agentsListUpdateFunc returns the list of agents with their info
export function agentsListUpdateFunc(globalAgentsList: AgentsList[]): ThunkAction<void, RootState, undefined, AgentsListAction> {
    return dispatch => {
        dispatch({
            type: GLOBAL_AGENTS_LIST,
            payload: globalAgentsList
        });
    }
}

// Expected input - 
// [
// "workloadselector1": [
//     {
//       "label": "workloadselector1:...."
//     },
//     {
//       "label": "workloadselector1:...."
//     },
//   ],
//   "workloadselector2": [
//     {
//       "label": "workloadselector2:...."
//     },
//     {
//       "label": "workloadselector2:...."
//     },
//   ]
// ]
// workloadSelectorInfoFunc returns the list of available workload selectors and their options
export function workloadSelectorInfoFunc(globalWorkloadSelectorInfo: WorkloadSelectorInfoLabels): ThunkAction<void, RootState, undefined, WorkloadSelectorInfoAction> {
    return dispatch => {
        dispatch({
            type: GLOBAL_WORKLOAD_SELECTOR_INFO,
            payload: globalWorkloadSelectorInfo
        });
    }
}

// Expected input - 
// [
// "agent1workloadselectorinfo": [
//     {
//       "id": "agentid",
//       "spiffeid": "agentspiffeeid",  
//       "selectors": "agentworkloadselectors"
//     }
//   ],
//   "agent2workloadselectorinfo": [
//     {
//       "id": "agentid",
//       "spiffeid": "agentspiffeeid",  
//       "selectors": "agentworkloadselectors"  
//     }
//   ]
//]
// agentworkloadSelectorInfoFunc returns the workload selector info for the agents
export function agentworkloadSelectorInfoFunc(globalAgentsWorkLoadAttestorInfo: AgentsWorkLoadAttestorInfo[]): ThunkAction<void, RootState, undefined, AgentWorkloadSelectorInfoAction> {
    return dispatch => {
        dispatch({
            type: GLOBAL_AGENTS_WORKLOADATTESTOR_INFO,
            payload: globalAgentsWorkLoadAttestorInfo
        });
    }
}

// Expected input - clicked dashboard tabel
// clickedDashboardTableFunc returns the clicked dashboard tabel
export function clickedDashboardTableFunc(globalClickedDashboardTable: string): ThunkAction<void, RootState, undefined, ClickedDashboardTableAction> {
    return dispatch => {
        dispatch({
            type: GLOBAL_CLICKED_DASHBOARD_TABLE,
            payload: globalClickedDashboardTable
        });
    }
}

