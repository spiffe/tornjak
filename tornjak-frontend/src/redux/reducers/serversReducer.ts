import {
    GLOBAL_SERVER_SELECTED,
    GLOBAL_SERVER_INFO,
    GLOBAL_TORNJAK_SERVER_INFO,
    GLOBAL_SERVERS_LIST,
    GLOBAL_SELECTOR_INFO,
    GLOBAL_WORKLOAD_SELECTOR_INFO,
    GLOBAL_SPIRE_HEALTH_CHECK,
    GLOBAL_SPIRE_HEALTH_CHECKING,
    GLOBAL_SPIRE_HEALTH_CHECK_TIME,
    GLOBAL_DEBUG_SERVER_INFO,
    ServersReducerState,
    ServersAction,
} from '../actions/types';
import { selectors, workloadSelectors } from "data/data";

const initialState: ServersReducerState = {
    globalServerSelected: "",
    globalServerInfo: { trustDomain: "", nodeAttestorPlugin: "" },
    globalTornjakServerInfo: { "plugins": { "DataStore": [], "KeyManager": [], "NodeAttestor": [], "NodeResolver": [], "Notifier": [] }, "trustDomain": "", "verboseConfig": "" },
    globalServersList: [],
    globalSelectorInfo: selectors,
    globalWorkloadSelectorInfo: workloadSelectors,
    globalSpireHealthCheck: false,
    globalSpireHealthChecking: false,
    globalSpireHealthTime: {
        SpireHealtCheckTime: 120,
        SpireHealthCheckFreqDisplay: '2 Mins',
    },
    globalDebugServerInfo: {
        "svid_chain": [
            {
                "id": {
                    "trust_domain": "",
                    "path": ""
                },
                "expires_at": 0,
                "subject": ""
            },
            {
                "id": {
                    "trust_domain": ""
                },
                "expires_at": 0,
                "subject": ""
            }
        ],
        "uptime": 0,
        "federated_bundles_count": 0
    },
};

export default function serversReducer(state: ServersReducerState = initialState, action: ServersAction) {
    switch (action.type) {
        case GLOBAL_SERVER_SELECTED:
            return {
                ...state,
                globalServerSelected: action.payload
            };
        case GLOBAL_SERVER_INFO:
            return {
                ...state,
                globalServerInfo: action.payload
            };
        case GLOBAL_TORNJAK_SERVER_INFO:
            return {
                ...state,
                globalTornjakServerInfo: action.payload
            };
        case GLOBAL_SERVERS_LIST:
            return {
                ...state,
                globalServersList: action.payload
            };
        case GLOBAL_SELECTOR_INFO:
            return {
                ...state,
                globalSelectorInfo: action.payload
            };
        case GLOBAL_WORKLOAD_SELECTOR_INFO:
            return {
                ...state,
                globalWorkloadSelectorInfo: action.payload
            };
        case GLOBAL_SPIRE_HEALTH_CHECK:
            return {
                ...state,
                globalSpireHealthCheck: action.payload
            };
        case GLOBAL_SPIRE_HEALTH_CHECKING:
            return {
                ...state,
                globalSpireHealthChecking: action.payload
            };
        case GLOBAL_SPIRE_HEALTH_CHECK_TIME:
            return {
                ...state,
                globalSpireHealthTime: action.payload
            };
        case GLOBAL_DEBUG_SERVER_INFO:
            return {
                ...state,
                globalDebugServerInfo: action.payload
            };
        default:
            return state;
    }
}
