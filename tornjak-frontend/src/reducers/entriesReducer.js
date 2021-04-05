import {
    GLOBAL_ENTRIES_LIST,
} from '../actions/types';

const initialState = {
    globalentriesList: [],
};

export default function entriesReducer(state = initialState, action) {
    switch (action.type) {
        case GLOBAL_ENTRIES_LIST:
            return {
                ...state,
                globalentriesList: action.payload
            };
        default:
            return state;
    }
}