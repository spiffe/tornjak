import {
    GLOBAL_AGENTS_LIST,
} from '../actions/types';

const initialState = {
    globalagentsList: [],
};

export default function agentsReducer(state = initialState, action) {
    switch (action.type) {
        case GLOBAL_AGENTS_LIST:
            return {
                ...state,
                globalagentsList: action.payload
            };
        default:
            return state;
    }
}