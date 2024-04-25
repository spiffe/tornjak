import { Component } from 'react';
import { connect } from 'react-redux';
import IsManager from '../is_manager';
import DashboardDetailsStyled from './dashboard-details';
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
    clickedDashboardTableFunc,
} from 'redux/actions';

// DashboardDetailsRender takes in details url parameters
// returns details page for dashboard for a specific entity
class DashboardDetailsRender extends Component {
    constructor(props) {
        super(props);
        this.TornjakHelper = new TornjakHelper();
        this.state = {};
    }

    componentDidMount() {
        const { params } = this.props;
        if (this.props.globalDebugServerInfo === "") {
            if (IsManager) {
                if (this.props.globalServerSelected !== "") {
                    this.props.clickedDashboardTableFunc(params.entity + "details");
                    TornjakApi.populateClustersUpdate(this.props.globalServerSelected, this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
                    TornjakApi.populateAgentsUpdate(this.props.globalServerSelected, this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
                    TornjakApi.populateEntriesUpdate(this.props.globalServerSelected, this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc);
                    TornjakApi.refreshSelectorsState(this.props.globalServerSelected, this.props.agentworkloadSelectorInfoFunc);
                    TornjakApi.populateTornjakAgentInfo(this.props.globalServerSelected, this.props.agentworkloadSelectorInfoFunc, "");
                    TornjakApi.populateTornjakServerInfo(this.props.globalServerSelected, this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
                }
            } else {
                this.props.clickedDashboardTableFunc(params.entity + "details");
                TornjakApi.refreshLocalSelectorsState(this.props.agentworkloadSelectorInfoFunc);
                TornjakApi.populateLocalClustersUpdate(this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
                TornjakApi.populateLocalAgentsUpdate(this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
                TornjakApi.populateLocalEntriesUpdate(this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc);
                TornjakApi.populateLocalTornjakAgentInfo(this.props.agentworkloadSelectorInfoFunc, "");
                TornjakApi.populateLocalTornjakServerInfo(this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
                if (this.props.globalTornjakServerInfo !== "") {
                    TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
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

const mapStateToProps = (state) => ({
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
