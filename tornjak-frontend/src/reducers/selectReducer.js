import {
    GLOBAL_SERVER_SELECTED,
    GLOBAL_ENTRIES_LIST,
    GLOBAL_AGENTS_LIST
} from '../actions/types';

const initialState = {
    globalServerSelected: "",
    globalentriesList: [],
    globalagentsList: [],
};

export default function (state = initialState, action) {
    switch (action.type) {
        case GLOBAL_SERVER_SELECTED:
            return {
                ...state,
                globalServerSelected: action.payload
            };
        case GLOBAL_ENTRIES_LIST:
            return {
                ...state,
                globalentriesList: action.payload
            };
        case GLOBAL_AGENTS_LIST:
            return {
                ...state,
                globalagentsList: action.payload
            };
        default:
            return state;
    }
}