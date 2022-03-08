import {
    EntriesListAction,
    NewEntriesAction,
    EntriesReducerState,
    GLOBAL_ENTRIES_LIST,
    GLOBAL_NEW_ENTRIES,
} from '../actions/types';

const initialState: EntriesReducerState = {
    globalEntriesList: [],
    globalNewEntries: {
        id: "", 
        spiffe_id: { trust_domain: "", path: ""}, 
        parent_id: { trust_domain: "", path: ""}, 
        selectors: [], 
        ttl: 1, 
        federates_with: [], 
        admin: false, 
        downstream: false, 
        expires_at: 1, 
        dns_names: [], 
        revision_number: 1, 
        store_svid: false}
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