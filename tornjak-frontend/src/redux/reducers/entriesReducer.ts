import {
    EntriesListAction,
    EntriesReducerStateType,
    GLOBAL_ENTRIES_LIST,
} from '../actions/types';

const initialState: EntriesReducerStateType = {
    globalEntriesList: [],
};

export default function entriesReducer(state: EntriesReducerStateType = initialState, action: EntriesListAction) {
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