import {
    GLOBAL_MESSEGE,
} from '../actions/types';

const initialState = {
    globalErrorMessege: "",
};

export default function tornjakReducer(state = initialState, action) {
    switch (action.type) {
        case GLOBAL_MESSEGE:
            return {
                ...state,
                globalErrorMessege: action.payload
            };
        default:
            return state;
    }
}