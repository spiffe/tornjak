import {
    GLOBAL_MESSAGE,
    GLOBAL_CLICKED_DASHBOARD_TABLE,
} from '../actions/types';

const initialState = {
    globalErrorMessage: "",
    globalClickedDashboardTable: "",
};

export default function tornjakReducer(state = initialState, action) {
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