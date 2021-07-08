import {
    GLOBAL_CLUSTERS_LIST,
    GLOBAL_CLUSTER_TYPE_INFO,
} from '../actions/types';

const initialState = {
    globalClustersList: [],
    globalClusterTypeInfo: [],
};

export default function clustersReducer(state = initialState, action) {
    switch (action.type) {
        case GLOBAL_CLUSTERS_LIST:
            return {
                ...state,
                globalClustersList: action.payload
            };
        case GLOBAL_CLUSTER_TYPE_INFO:
            return {
                ...state,
                globalClusterTypeInfo: action.payload
            };
        default:
            return state;
    }
}