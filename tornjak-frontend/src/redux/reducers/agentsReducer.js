import {
    GLOBAL_AGENTS_LIST,
    GLOBAL_AGENTS_WORKLOADATTESTOR_INFO,
} from '../actions/types';

const initialState = {
    globalAgentsList: [],
    globalAgentsWorkLoadAttestorInfo: [],
};

export default function agentsReducer(state = initialState, action) {
    switch (action.type) {
        case GLOBAL_AGENTS_LIST:
            return {
                ...state,
                globalAgentsList: action.payload
            };
        case GLOBAL_AGENTS_WORKLOADATTESTOR_INFO:
            return {
                ...state,
                globalAgentsWorkLoadAttestorInfo: action.payload
            };
        default:
            return state;
    }
}