import {
    EntriesListAction,
    NewEntriesAction,
    EntryExpiryAction,
    EntriesReducerState,
    GLOBAL_ENTRIES_LIST,
    GLOBAL_NEW_ENTRIES,
    GLOBAL_ENTRY_EXPIRY
} from '../actions/types';

const initialState: EntriesReducerState = {
    globalEntriesList: [],
    globalNewEntries: [],
    globalEntryExpiryTime: 0,
};

export default function entriesReducer(state: EntriesReducerState = initialState, action: EntriesListAction | NewEntriesAction | EntryExpiryAction) {
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
        case GLOBAL_ENTRY_EXPIRY:
            return {
                ...state,
                globalEntryExpiryTime: action.payload
            };
        default:
            return state;
    }
}