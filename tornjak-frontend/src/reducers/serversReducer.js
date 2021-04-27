import {
    GLOBAL_SERVER_SELECTED,
    GLOBAL_SERVER_INFO,
    GLOBAL_TORNJAK_SERVER_INFO,
    GLOBAL_SERVERS_LIST,
    GLOBAL_SELECTOR_INFO,
} from '../actions/types';

const initialState = {
    globalServerSelected: "",
    globalTornjakServerInfo: "",
    globalServerInfo: [],
    globalServersList: [],
    globalSelectorInfo:[],
};

export default function serversReducer(state = initialState, action) {
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
        default:
            return state;
    }
}
