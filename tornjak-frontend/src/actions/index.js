import {
    GLOBAL_SERVER_SELECTED,
    GLOBAL_ENTRIES_LIST,
    GLOBAL_AGENTS_LIST,
    GLOBAL_SERVER_INFO,
    GLOBAL_TORNJAK_SERVER_INFO,
    GLOBAL_SERVERS_LIST,
    GLOBAL_SELECTOR_INFO,
    GLOBAL_MESSEGE,
    GLOBAL_WORKLOAD_SELECTOR_INFO,
    GLOBAL_AGENTS_WORKLOADATTESTOR_INFO,
} from './types';

// Expected input - "Error Messege/ Success Messege"
// tornjakMessegeFunc returns the Error Messege/ Success Messege of an executed function
export function tornjakMessegeFunc(globalErrorMessege) {
    return dispatch => {
        dispatch({
            type: GLOBAL_MESSEGE,
            payload: globalErrorMessege
        });
    }
}

// Expected input - "ServerName"
// serverSelectedFunc returns the server selected in the redux state
export function serverSelectedFunc(globalServerSelected) {
    return dispatch => {
        dispatch({
            type: GLOBAL_SERVER_SELECTED,
            payload: globalServerSelected
        });
    }
}

// Expected input - "TornjakServerInfo" struct (as JSON) based on 
// TornjakServerInfo in /api/types.go
// tornjakServerInfoUpdateFunc returns the torjak server info of the selected server
export function tornjakServerInfoUpdateFunc(globalTornjakServerInfo) {
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
export function serverInfoUpdateFunc(globalServerInfo) {
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
export function serversListUpdateFunc(globalServersList) {
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
export function selectorInfoFunc(globalSelectorInfo) {
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
export function entriesListUpdateFunc(globalEntriesList) {
    return dispatch => {
        dispatch({
            type: GLOBAL_ENTRIES_LIST,
            payload: globalEntriesList
        });
    }
}

// Expected input - List of agents with their info
// json representation from SPIFFE golang documentation - https://github.com/spiffe/spire/blob/v0.12.0/proto/spire/types/agent.pb.go#L28-L45
// agentsListUpdateFunc returns the list of agents with their info
export function agentsListUpdateFunc(globalAgentsList) {
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
export function workloadSelectorInfoFunc(globalWorkloadSelectorInfo) {
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
// agentworkloadSelectorInfoFunc returns the work load selector info for the agents
export function agentworkloadSelectorInfoFunc(globalAgentsWorkLoadAttestorInfo) {
    return dispatch => {
        dispatch({
            type: GLOBAL_AGENTS_WORKLOADATTESTOR_INFO,
            payload: globalAgentsWorkLoadAttestorInfo
        });
    }
}
