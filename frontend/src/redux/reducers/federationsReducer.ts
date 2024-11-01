import {
    FederationsListAction,
    FederationsReducerState,
    GLOBAL_FEDERATIONS_LIST,
} from '../actions/types';

const initialState: FederationsReducerState = {
    globalFederationsList: [],
};

export default function federationsReducer(state: FederationsReducerState = initialState, action: FederationsListAction) {
    switch (action.type) {
        case GLOBAL_FEDERATIONS_LIST:
            return {
                ...state,
                globalFederationsList: action.payload
            };
        default:
            return state;
    }
}