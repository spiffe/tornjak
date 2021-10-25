import React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';
import IsManager from '../is_manager';
import DashboardDetails from './dashboard-details';
import TornjakHelper from '../tornjak-helper';
import TornjakApi from '../tornjak-api-helpers';
// import PropTypes from "prop-types";
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

type DashboardDetailsRenderProp = {
    params: { entity: string; },
    globalTornjakServerInfo: Object,
    globalServerInfo: [],
    globalServerSelected: string | undefined,
    clickedDashboardTableFunc: Function,
    clustersListUpdateFunc: Function,
    agentsListUpdateFunc: Function,
    tornjakMessageFunc: Function,
    entriesListUpdateFunc: Function,
    agentworkloadSelectorInfoFunc: Function,
    tornjakServerInfoUpdateFunc: Function,
    serverInfoUpdateFunc: Function,
}

type DashboardDetailsRenderState = {}
// DashboardDetailsRender takes in details url parameters
// returns details page for dashboard for a specific entity
class DashboardDetailsRender extends Component<DashboardDetailsRenderProp, DashboardDetailsRenderState> {
    TornjakApi: TornjakApi;
    TornjakHelper: TornjakHelper;
    constructor(props:DashboardDetailsRenderProp) {
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
                if (this.props.globalTornjakServerInfo !== "") {
                    this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
                }
            }
        }
    }

    render() {
        const { params } = this.props;
        return (
            <DashboardDetails data-test="dashboard-details" selectedData={this.TornjakHelper.detailsDataParse(params, this.props)} />
        );
    }
}

const mapStateToProps = (state: { servers: { globalServerInfo: []; globalTornjakServerInfo: {}; }; clusters: { globalClustersList: []; }; agents: { globalAgentsList: []; globalAgentsWorkLoadAttestorInfo: []; }; entries: { globalEntriesList: []; }; }) => ({
    globalServerInfo: state.servers.globalServerInfo,
    globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
    globalClustersList: state.clusters.globalClustersList,
    globalAgentsList: state.agents.globalAgentsList,
    globalEntriesList: state.entries.globalEntriesList,
    globalAgentsWorkLoadAttestorInfo: state.agents.globalAgentsWorkLoadAttestorInfo,
})

// DashboardDetailsRender.propTypes = {
//     params: PropTypes.object,
//     globalServerInfo: PropTypes.object,
//     globalTornjakServerInfo: PropTypes.object,
//     globalClustersList: PropTypes.array,
//     globalAgentsList: PropTypes.array,
//     globalEntriesList: PropTypes.array,
//     globalAgentsWorkLoadAttestorInfo: PropTypes.array,
//   };

export default connect(
    mapStateToProps,
    { serverSelectedFunc, clustersListUpdateFunc, agentsListUpdateFunc, entriesListUpdateFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc, selectorInfoFunc, tornjakMessageFunc, workloadSelectorInfoFunc, agentworkloadSelectorInfoFunc, clusterTypeInfoFunc, clickedDashboardTableFunc }
)(DashboardDetailsRender)

export { DashboardDetailsRender };