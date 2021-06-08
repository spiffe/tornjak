import {
    GLOBAL_MESSAGE,
} from '../actions/types';

const initialState = {
    globalErrorMessage: "",
};

export default function tornjakReducer(state = initialState, action) {
    switch (action.type) {
        case GLOBAL_MESSAGE:
            return {
                ...state,
                globalErrorMessage: action.payload
            };
        default:
            return state;
    }
}