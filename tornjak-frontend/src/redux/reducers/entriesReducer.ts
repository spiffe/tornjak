import {
    EntriesListAction,
    EntriesReducerState,
    GLOBAL_ENTRIES_LIST,
} from '../actions/types';

const initialState: EntriesReducerState = {
    globalEntriesList: [],
};

export default function entriesReducer(state: EntriesReducerState = initialState, action: EntriesListAction) {
    switch (action.type) {
        case GLOBAL_ENTRIES_LIST:
            return {
                ...state,
                globalEntriesList: action.payload
            };
        default:
            return state;
    }
}