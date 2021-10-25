//types
import { 
    //agentsReducer
    GLOBAL_AGENTS_LIST,
    GLOBAL_AGENTS_WORKLOADATTESTOR_INFO,
    //clusterReducer
    GLOBAL_CLUSTERS_LIST,
    GLOBAL_CLUSTER_TYPE_INFO,
    //entriesReducer
    GLOBAL_ENTRIES_LIST,
    //serverReducer
    GLOBAL_SERVER_SELECTED,
    GLOBAL_TORNJAK_SERVER_INFO,
    GLOBAL_SERVER_INFO,
    GLOBAL_SERVERS_LIST,
    GLOBAL_SELECTOR_INFO,
    GLOBAL_WORKLOAD_SELECTOR_INFO,
    //tornjakReducer
    GLOBAL_MESSAGE,
    GLOBAL_CLICKED_DASHBOARD_TABLE
} from '../redux/actions/types';
//reducers
import agentsReducer from '../redux/reducers/agentsReducer';
import clustersReducer from '../redux/reducers/clustersReducer';
import entriesReducer from '../redux/reducers/entriesReducer';
import serversReducer from '../redux/reducers/serversReducer';
import tornjakReducer from '../redux/reducers/tornjakReducer';

describe('Agent Reducer', () => {
    const initialState = {
        globalAgentsList: [],
        globalAgentsWorkLoadAttestorInfo: [],
    };
    test('Should return default state for agents reducer', () => {
        const newState = agentsReducer(undefined, {});
        expect(newState).toEqual(initialState);
    });

    test('Should return new state for GLOBAL_AGENTS_LIST if receiving type', () => {
        const updatedState = {...initialState};
        updatedState.globalAgentsList = [{"agent": "Agent 1"}, {"agent": "Agent 2"}, {"agent": "Agent 3"}];
        const newState = agentsReducer(undefined, {
            type: GLOBAL_AGENTS_LIST,
            payload: updatedState.globalAgentsList
        });
        expect(newState).toEqual(updatedState);
    });

    test('Should return new state for GLOBAL_AGENTS_WORKLOADATTESTOR_INFO if receiving type', () => {
        const updatedState = {...initialState};
        updatedState.globalAgentsWorkLoadAttestorInfo = [{"agentWorkloadSelectorInfo": "AgentWorkloadSelectorInfo 1"}, {"agentWorkloadSelectorInfo": "AgentWorkloadSelectorInfo 2"}, {"agentWorkloadSelectorInfo": "AgentWorkloadSelectorInfo 3"}];
        const newState = agentsReducer(undefined, {
            type: GLOBAL_AGENTS_WORKLOADATTESTOR_INFO,
            payload: updatedState.globalAgentsWorkLoadAttestorInfo
        });
        expect(newState).toEqual(updatedState);
    });

});

describe('Cluster Reducer', () => {
    const initialState = {
        globalClustersList: [],
        globalClusterTypeInfo: [],
    };
    test('Should return default state for clusters reducer', () => {
        const newState = clustersReducer(undefined, {});
        expect(newState).toEqual(initialState);
    });

    test('Should return new state for GLOBAL_CLUSTERS_LIST if receiving type', () => {
        const updatedState = {...initialState};
        updatedState.globalClustersList = [{"cluster": "Cluster 1"}, {"cluster": "Cluster 2"}, {"cluster": "Cluster 3"}];
        const newState = clustersReducer(undefined, {
            type: GLOBAL_CLUSTERS_LIST,
            payload: updatedState.globalClustersList
        });
        expect(newState).toEqual(updatedState);
    });

    test('Should return new state for GLOBAL_CLUSTER_TYPE_INFO if receiving type', () => {
        const updatedState = {...initialState};
        updatedState.globalClusterTypeInfo = [{"clustertype": "Clustertype 1"}, {"clustertype": "Clustertype 2"}, {"clustertype": "Clustertype 3"}];
        const newState = clustersReducer(undefined, {
            type: GLOBAL_CLUSTER_TYPE_INFO,
            payload: updatedState.globalClusterTypeInfo
        });
        expect(newState).toEqual(updatedState);
    });
});

describe('Entries Reducer', () => {
    const initialState = {
        globalEntriesList: [],
    };
    test('Should return default state for entries reducer', () => {
        const newState = entriesReducer(undefined, {});
        expect(newState).toEqual(initialState);
    });

    test('Should return new state for GLOBAL_ENTRIES_LIST if receiving type', () => {
        const updatedState = {...initialState};
        updatedState.globalEntriesList = [{"entry": "Entry 1"}, {"entry": "Entry 2"}, {"entry": "Entry 3"}];
        const newState = entriesReducer(undefined, {
            type: GLOBAL_ENTRIES_LIST,
            payload: updatedState.globalEntriesList
        });
        expect(newState).toEqual(updatedState);
    });
});

describe('Server Reducer', () => {
    const initialState = {
        globalServerSelected: "",
        globalTornjakServerInfo: {},
        globalServerInfo: {},
        globalServersList: [],
        globalSelectorInfo:{},
        globalWorkloadSelectorInfo:[],
    };
    test('Should return default state for servers reducer', () => {
        const newState = serversReducer(undefined, {});
        expect(newState).toEqual(initialState);
    });

    test('Should return new state for GLOBAL_SERVER_SELECTED if receiving type', () => {

        const updatedState = {...initialState};
        updatedState.globalServerSelected = "testServer";
        const newState = serversReducer(undefined, {
            type: GLOBAL_SERVER_SELECTED,
            payload: updatedState.globalServerSelected
        });
        expect(newState).toEqual(updatedState);
    });

    test('Should return new state for GLOBAL_TORNJAK_SERVER_INFO if receiving type', () => {
        const updatedState = {...initialState};
        updatedState.globalTornjakServerInfo = "testTornjakServerInfo";
        const newState = serversReducer(undefined, {
            type: GLOBAL_TORNJAK_SERVER_INFO,
            payload: updatedState.globalTornjakServerInfo
        });
        expect(newState).toEqual(updatedState);
    });

    test('Should return new state for GLOBAL_SERVER_INFO if receiving type', () => {
        const updatedState = {...initialState};
        updatedState.globalServerInfo = {"data": "testData"};
        const newState = serversReducer(undefined, {
            type: GLOBAL_SERVER_INFO,
            payload: updatedState.globalServerInfo
        });
        expect(newState).toEqual(updatedState);
    });

    test('Should return new state for GLOBAL_SERVERS_LIST if receiving type', () => {
        const updatedState = {...initialState};
        updatedState.globalServersList = [{"server": "Server 1"}, {"server": "Server 2"}, {"server": "Server 3"}];
        const newState = serversReducer(undefined, {
            type: GLOBAL_SERVERS_LIST,
            payload: updatedState.globalServersList
        });
        expect(newState).toEqual(updatedState);
    });

    test('Should return new state for GLOBAL_SELECTOR_INFO if receiving type', () => {
        const updatedState = {...initialState};
        updatedState.globalSelectorInfo = [{"selector": "Selector 1"}, {"selector": "Selector 2"}, {"selector": "Selector 3"}];
        const newState = serversReducer(undefined, {
            type: GLOBAL_SELECTOR_INFO,
            payload: updatedState.globalSelectorInfo
        });
        expect(newState).toEqual(updatedState);
    });

    test('Should return new state for GLOBAL_WORKLOAD_SELECTOR_INFO if receiving type', () => {
        const updatedState = {...initialState};
        updatedState.globalWorkloadSelectorInfo = [{"workloadselector": "WorkloadSelector 1"}, {"workloadselector": "WorkloadSelector 2"}, {"workloadselector": "WorkloadSelector 3"}];
        const newState = serversReducer(undefined, {
            type: GLOBAL_WORKLOAD_SELECTOR_INFO,
            payload: updatedState.globalWorkloadSelectorInfo
        });
        expect(newState).toEqual(updatedState);
    });

});

describe('Tornjak Reducer', () => {
    const initialState = {
        globalErrorMessage: "",
        globalClickedDashboardTable: "",
    };
    test('Should return default state for tornjak reducer', () => {
        const newState = tornjakReducer(undefined, {});
        expect(newState).toEqual(initialState);
    });

    test('Should return new state for GLOBAL_MESSAGE if receiving type', () => {
        const updatedState = {...initialState};
        updatedState.globalErrorMessage = "testErrorMessage";
        const newState = tornjakReducer(undefined, {
            type: GLOBAL_MESSAGE,
            payload: updatedState.globalErrorMessage
        });
        expect(newState).toEqual(updatedState);
    });

    test('Should return new state for GLOBAL_CLICKED_DASHBOARD_TABLE if receiving type', () => {
        const updatedState = {...initialState};
        updatedState.globalClickedDashboardTable = "testClickedDashboardTable";
        const newState = tornjakReducer(undefined, {
            type: GLOBAL_CLICKED_DASHBOARD_TABLE,
            payload: updatedState.globalClickedDashboardTable
        });
        expect(newState).toEqual(updatedState);
    });

});