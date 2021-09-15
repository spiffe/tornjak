import {
    ClustersListUpdateAction,
    ClustersReducerStateType,
    ClusterTypeInfoAction,
    GLOBAL_CLUSTERS_LIST,
    GLOBAL_CLUSTER_TYPE_INFO,
} from '../actions/types';

const initialState: ClustersReducerStateType = {
    globalClustersList: [],
    globalClusterTypeInfo: [],
};

export default function clustersReducer(state: ClustersReducerStateType = initialState, action: ClustersListUpdateAction | ClusterTypeInfoAction) {
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