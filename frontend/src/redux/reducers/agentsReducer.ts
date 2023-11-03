import {
    AgentsListAction,
    AgentsReducerState,
    AgentWorkloadSelectorInfoAction,
    GLOBAL_AGENTS_LIST,
    GLOBAL_AGENTS_WORKLOADATTESTOR_INFO,
} from '../actions/types';

const initialState: AgentsReducerState = {
    globalAgentsList: [],
    globalAgentsWorkLoadAttestorInfo: [],
};

export default function agentsReducer(state: AgentsReducerState = initialState, action: AgentsListAction | AgentWorkloadSelectorInfoAction) {
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