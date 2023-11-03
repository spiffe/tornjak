import {
    AuthReducerState,
    IsAuthenticatedAction,
    AccessTokenAction,
    UserRolesAction,
    GLOBAL_IS_AUTHENTICATED,
    GLOBAL_ACCESS_TOKEN,
    GLOBAL_USER_ROLES,
} from '../actions/types';

const initialState: AuthReducerState = {
    globalIsAuthenticated: false,
    globalAccessToken: "",
    globalUserRoles: [],
};

export default function authReducer(state: AuthReducerState = initialState, action: IsAuthenticatedAction | AccessTokenAction | UserRolesAction) {
    switch (action.type) {
        case GLOBAL_IS_AUTHENTICATED:
            return {
                ...state,
                globalIsAuthenticated: action.payload
            };
        case GLOBAL_ACCESS_TOKEN:
            return {
                ...state,
                globalAccessToken: action.payload
            };
         case GLOBAL_USER_ROLES:
            return {
                ...state,
                globalUserRoles: action.payload
            };
        default:
            return state;
    }
}