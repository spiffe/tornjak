import {
    GLOBAL_SERVER_SELECTED,
    GLOBAL_SERVER_INFO,
    GLOBAL_TORNJAK_SERVER_INFO,
    GLOBAL_SERVERS_LIST,
    GLOBAL_SELECTOR_INFO,
    GLOBAL_WORKLOAD_SELECTOR_INFO,
    ServersReducerStateType,
    ServersAction,
} from '../actions/types';
import { selectors, workloadSelectors } from "data/data";

const initialState: ServersReducerStateType = {
    globalServerSelected: "",
    globalServerInfo: {"data" : {trustDomain: "", nodeAttestorPlugin: ""}},
    globalTornjakServerInfo: {"plugins": {"DataStore": [], "KeyManager": [], "NodeAttestor": [], "NodeResolver": [], "Notifier": [] }, "trustDomain": "", "verboseConfig": ""},
    globalServersList: [],
    globalSelectorInfo: selectors,
    globalWorkloadSelectorInfo: workloadSelectors,
};

export default function serversReducer(state: ServersReducerStateType = initialState, action: ServersAction) {
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
        default:
            return state;
    }
}
