import {
    EntriesListAction,
    NewEntriesAction,
    EntriesReducerState,
    GLOBAL_ENTRIES_LIST,
    GLOBAL_NEW_ENTRIES,
} from '../actions/types';

const initialState: EntriesReducerState = {
    globalEntriesList: [],
    globalNewEntries: []
};

export default function entriesReducer(state: EntriesReducerState = initialState, action: EntriesListAction | NewEntriesAction) {
    switch (action.type) {
        case GLOBAL_ENTRIES_LIST:
            return {
                ...state,
                globalEntriesList: action.payload
            };
        case GLOBAL_NEW_ENTRIES:
            return {
                ...state,
                globalNewEntries: action.payload
            };
        default:
            return state;
    }
}