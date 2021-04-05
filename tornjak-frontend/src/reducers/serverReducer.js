import {
    GLOBAL_SERVER_SELECTED,
} from '../actions/types';

const initialState = {
    globalServerSelected: "",
};

export default function serverReducer(state = initialState, action) {
    switch (action.type) {
        case GLOBAL_SERVER_SELECTED:
            return {
                ...state,
                globalServerSelected: action.payload
            };
        default:
            return state;
    }
}