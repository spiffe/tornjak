import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import IsManager from '../is_manager';
import DashboardDetails from './dashboard-details';
import TornjakHelper from '../tornjak-helper';
import TornjakApi from '../tornjak-api-helpers';
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
    clickedDashboardTabelFunc,
} from 'redux/actions';

class DashboardDetailsRender extends Component {
    constructor(props) {
        super(props);
        this.TornjakApi = new TornjakApi();
        this.TornjakHelper = new TornjakHelper();
        this.state = {};
    }

    componentDidMount() {
        const { params } = this.props;
        if (this.props.globalTornjakServerInfo === "" || this.props.globalServerInfo === undefined) {
            if (IsManager) {
                if (this.props.globalServerSelected !== "") {
                    this.props.clickedDashboardTabelFunc(params.entity + "details");
                    this.TornjakApi.populateClustersUpdate(this.props.globalServerSelected, this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
                    this.TornjakApi.populateAgentsUpdate(this.props.globalServerSelected, this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
                    this.TornjakApi.populateEntriesUpdate(this.props.globalServerSelected, this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc);
                    this.TornjakApi.refreshSelectorsState(this.props.globalServerSelected, this.props.agentworkloadSelectorInfoFunc);
                    this.TornjakApi.populateTornjakAgentInfo(this.props.globalServerSelected, this.props.agentworkloadSelectorInfoFunc, "");
                    this.TornjakApi.populateTornjakServerInfo(this.props.globalServerSelected, this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
                }
            } else {
                this.props.clickedDashboardTabelFunc(params.entity + "details");
                this.TornjakApi.refreshLocalSelectorsState(this.props.agentworkloadSelectorInfoFunc);
                this.TornjakApi.populateLocalClustersUpdate(this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
                this.TornjakApi.populateLocalAgentsUpdate(this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
                this.TornjakApi.populateLocalEntriesUpdate(this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc);
                this.TornjakApi.populateLocalTornjakAgentInfo(this.props.agentworkloadSelectorInfoFunc, "");
                this.TornjakApi.populateLocalTornjakServerInfo(this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
                if (this.props.globalTornjakServerInfo !== "") {
                    this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
                }
            }
        }
    }

    render() {
        const { params } = this.props;
        return (
            <DashboardDetails selectedData={this.TornjakHelper.detailsDataParse(params, this.props)} />
        );
    }
}

const mapStateToProps = (state) => ({
    globalServerInfo: state.servers.globalServerInfo,
    globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
    globalClustersList: state.clusters.globalClustersList,
    globalAgentsList: state.agents.globalAgentsList,
    globalEntriesList: state.entries.globalEntriesList,
    globalAgentsWorkLoadAttestorInfo: state.agents.globalAgentsWorkLoadAttestorInfo,
})

export default connect(
    mapStateToProps,
    { serverSelectedFunc, clustersListUpdateFunc, agentsListUpdateFunc, entriesListUpdateFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc, selectorInfoFunc, tornjakMessageFunc, workloadSelectorInfoFunc, agentworkloadSelectorInfoFunc, clusterTypeInfoFunc, clickedDashboardTabelFunc }
)(DashboardDetailsRender)
