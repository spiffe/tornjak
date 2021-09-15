import {
    AgentsListAction,
    AgentsReducerStateType,
    AgentWorkloadSelectorInfoAction,
    GLOBAL_AGENTS_LIST,
    GLOBAL_AGENTS_WORKLOADATTESTOR_INFO,
} from '../actions/types';

const initialState: AgentsReducerStateType = {
    globalAgentsList: [],
    globalAgentsWorkLoadAttestorInfo: [],
};

export default function agentsReducer(state: AgentsReducerStateType = initialState, action: AgentsListAction | AgentWorkloadSelectorInfoAction) {
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