import {
    GLOBAL_MESSAGE,
    GLOBAL_CLICKED_DASHBOARD_TABLE,
    TornjakReducerStateType,
    TornjakAction,
} from '../actions/types';

const initialState: TornjakReducerStateType = {
    globalErrorMessage: "",
    globalClickedDashboardTable: "",
};

export default function tornjakReducer(state: TornjakReducerStateType = initialState, action: TornjakAction) {
    switch (action.type) {
        case GLOBAL_MESSAGE:
            return {
                ...state,
                globalErrorMessage: action.payload
            };
        case GLOBAL_CLICKED_DASHBOARD_TABLE:
            return {
                ...state,
                globalClickedDashboardTable: action.payload
            };
        default:
            return state;
    }
}