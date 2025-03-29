import React, { Component } from 'react';
import { connect } from 'react-redux';
import IsManager from '../is_manager';
import DashboardDetailsStyled from './dashboard-details';
import TornjakHelper from '../tornjak-helper';
import TornjakApi from '../tornjak-api-helpers';
import { RootState } from 'redux/reducers';
import {
    serverSelectedFunc,
    clustersListUpdateFunc,
    agentsListUpdateFunc,
    entriesListUpdateFunc,
    tornjakServerInfoUpdateFunc,
    serverInfoUpdateFunc,
    selectorInfoFunc,
    tornjakMessageFunc,
    workloadSelectorInfoFunc,
    agentworkloadSelectorInfoFunc,
    clusterTypeInfoFunc,
    clickedDashboardTableFunc,
} from 'redux/actions';

import {
    AgentsList,
    AgentsWorkLoadAttestorInfo,
    ClustersList,
    EntriesList,
    SelectorInfoLabels,
    ServerInfo,
    TornjakServerInfo,
    WorkloadSelectorInfoLabels,
    DebugServerInfo
} from "components/types";



type DashboardDetailsRenderProps ={
    params: { entity: string };
    // dispatches a payload for the server selected and has a return type of void
    serverSelectedFunc: (globalServerSelected: string) => void,
    // dispatches a payload for list of clusters with their metadata info as an array of ClustersList Type and has a return type of void
    clustersListUpdateFunc: (globalClustersList: ClustersList[]) => void,
    // dispatches a payload for list of agents with their metadata info as an array of AgentListType and has a return type of void
    agentsListUpdateFunc: (globalAgentsList: AgentsList[]) => void,  
    // dispatches a payload for list of entries with their metadata info as an array of EntriesListType and has a return type of void
    entriesListUpdateFunc: (globalEntriesList: EntriesList[]) => void,
    // dispatches a payload for the tornjak server info of the selected server and has a return type of void
    tornjakServerInfoUpdateFunc: (globalTornjakServerInfo: TornjakServerInfo) => void, 
    // dispatches a payload for the server trust domain and nodeAttestorPlugin and has a return type of void
    serverInfoUpdateFunc: (globalServerInfo: ServerInfo) => void,
    // dispatches a payload for list of available selectors and their options as an object and has a return type of void
    selectorInfoFunc: (globalSelectorInfo: SelectorInfoLabels) => void,
    // dispatches a payload for an Error Message/ Success Message of an executed function as a string and has a return type of void
    tornjakMessageFunc: (globalErrorMessage: string) => void,
    // dispatches a payload for list of available workload selectors and their options as an object and has a return type of void
    workloadSelectorInfoFunc: (globalWorkloadSelectorInfo: WorkloadSelectorInfoLabels) => void, 
    // dispatches a payload for the workload selector info for the agents as an array of AgentsWorkLoadAttestorInfoType and has a return type of void
    agentworkloadSelectorInfoFunc: (globalAgentsWorkLoadAttestorInfo: AgentsWorkLoadAttestorInfo[]) => void,  
    // dispatches a payload for list of available cluster types as array of strings and has a return type of void
    clusterTypeInfoFunc: (globalClusterTypeInfo: string[]) => void,
    // dispatches a payload for the clicked table in a dashboard as a string and has a return type of void
    clickedDashboardTableFunc: (globalClickedDashboardTable: string) => void,
    // the selected server for manager mode 
    globalServerSelected: string, 
    // tornjak server debug info of the selected server
    globalDebugServerInfo: DebugServerInfo,
    // tornjak server info of the selected server
    globalTornjakServerInfo: TornjakServerInfo, 

}
// DashboardDetailsRender takes in details url parameters
// returns details page for dashboard for a specific entity
class DashboardDetailsRender extends React.Component<DashboardDetailsRenderProps, {}> {
    TornjakApi:TornjakApi;
    TornjakHelper: TornjakHelper;
    constructor(props:DashboardDetailsRenderProps) {
        super(props);
        this.TornjakApi = new TornjakApi({});
        this.TornjakHelper = new TornjakHelper({});
        this.state = {};
    }

    componentDidMount() {
        const { params } = this.props;
        if (this.props.globalDebugServerInfo === undefined) {
            if (IsManager) {
                if (this.props.globalServerSelected !== "") {
                    this.props.clickedDashboardTableFunc(params.entity + "details");
                    this.TornjakApi.populateClustersUpdate(this.props.globalServerSelected, this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
                    this.TornjakApi.populateAgentsUpdate(this.props.globalServerSelected, this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
                    this.TornjakApi.populateEntriesUpdate(this.props.globalServerSelected, this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc);
                    this.TornjakApi.refreshSelectorsState(this.props.globalServerSelected, this.props.agentworkloadSelectorInfoFunc);
                    this.TornjakApi.populateTornjakAgentInfo(this.props.globalServerSelected, this.props.agentworkloadSelectorInfoFunc, "");
                    this.TornjakApi.populateTornjakServerInfo(this.props.globalServerSelected, this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
                }
            } else {
                this.props.clickedDashboardTableFunc(params.entity + "details");
                this.TornjakApi.refreshLocalSelectorsState(this.props.agentworkloadSelectorInfoFunc);
                this.TornjakApi.populateLocalClustersUpdate(this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
                this.TornjakApi.populateLocalAgentsUpdate(this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
                this.TornjakApi.populateLocalEntriesUpdate(this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc);
                this.TornjakApi.populateLocalTornjakAgentInfo(this.props.agentworkloadSelectorInfoFunc, "");
                this.TornjakApi.populateLocalTornjakServerInfo(this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
                if (this.props.globalTornjakServerInfo !== null) {
                    this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
                }
            }
        }
    }

    render() {
        const { params } = this.props;
        return (
            <DashboardDetailsStyled selectedData={this.TornjakHelper.detailsDataParse(params, this.props)} />
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    globalServerInfo: state.servers.globalServerInfo,
    globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
    globalClustersList: state.clusters.globalClustersList,
    globalAgentsList: state.agents.globalAgentsList,
    globalEntriesList: state.entries.globalEntriesList,
    globalAgentsWorkLoadAttestorInfo: state.agents.globalAgentsWorkLoadAttestorInfo,
    globalDebugServerInfo: state.servers.globalDebugServerInfo,
})

export default connect(
    mapStateToProps,
    { serverSelectedFunc, 
      clustersListUpdateFunc, 
      agentsListUpdateFunc, 
      entriesListUpdateFunc, 
      tornjakServerInfoUpdateFunc, 
      serverInfoUpdateFunc, 
      selectorInfoFunc, 
      tornjakMessageFunc, 
      workloadSelectorInfoFunc, 
      agentworkloadSelectorInfoFunc, 
      clusterTypeInfoFunc, 
      clickedDashboardTableFunc }
)(DashboardDetailsRender);