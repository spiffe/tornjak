import React, { Component } from 'react';
import { Tabs, Tab } from 'carbon-components-react';
import ClusterCreate from './cluster-create';
import ClusterEdit from './cluster-edit';
import { connect } from 'react-redux';
import IsManager from './is_manager';
import TornjakApi from './tornjak-api-helpers';
import './style.css';
import {
  clusterTypeInfoFunc,
  serverSelectedFunc,
  selectorInfoFunc,
  agentsListUpdateFunc,
  tornjakMessageFunc,
  tornjakServerInfoUpdateFunc,
  serverInfoUpdateFunc
} from 'redux/actions';
// import PropTypes from "prop-types";

type ClusterManagementProp = {
  globalServerSelected: string,
  globalErrorMessage: string,
  agentsListUpdateFunc: Function,
  tornjakMessageFunc: Function,
  tornjakServerInfoUpdateFunc: Function,
  globalTornjakServerInfo: string,
  serverInfoUpdateFunc: Function,
  globalServerInfo: [],
  globalClusterTypeInfo: [],
  globalAgentsList: any[],
}

type ClusterManagementState = {
  clusterTypeList: any[],
  agentsList: any,
  agentsListDisplay: string,
  clusterTypeManualEntryOption: string,
  selectedServer: string,
  

}

class ClusterManagement extends Component<ClusterManagementProp, ClusterManagementState> {
  TornjakApi: TornjakApi;
  constructor(props:ClusterManagementProp) {
    super(props);
    this.TornjakApi = new TornjakApi();
    this.prepareClusterTypeList = this.prepareClusterTypeList.bind(this);
    this.prepareAgentsList = this.prepareAgentsList.bind(this);
    this.state = {
      clusterTypeList: [],
      agentsList: [],
      agentsListDisplay: "Select Agents",
      clusterTypeManualEntryOption: "----Select this option and Enter Custom Cluster Type Below----",
      selectedServer: "",
    }
  }

  componentDidMount() {
    if (IsManager) {
      if (this.props.globalServerSelected !== "" && (this.props.globalErrorMessage === "OK" || this.props.globalErrorMessage === "")) {
        this.TornjakApi.populateAgentsUpdate(this.props.globalServerSelected, this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
        this.TornjakApi.populateTornjakServerInfo(this.props.globalServerSelected, this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
        this.setState({ selectedServer: this.props.globalServerSelected });
        this.prepareClusterTypeList();
        this.prepareAgentsList();
      }
    } else {
      this.TornjakApi.populateLocalAgentsUpdate(this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
      this.TornjakApi.populateLocalTornjakServerInfo(this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
      this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
      this.prepareClusterTypeList();
      this.prepareAgentsList();
    }
  }

  componentDidUpdate(prevProps:ClusterManagementProp,) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.setState({ selectedServer: this.props.globalServerSelected });
      }
      if (prevProps.globalServerInfo !== this.props.globalServerInfo) {
        this.prepareAgentsList();
      }
    } else {
      if (prevProps.globalServerInfo !== this.props.globalServerInfo) {
        this.prepareAgentsList();
      }
    }
  }

  prepareClusterTypeList() {
    let localClusterTypeList = [];
    // user prefered option
    localClusterTypeList[0] = this.state.clusterTypeManualEntryOption;
    // cluster type list
    for (let i = 0; i < this.props.globalClusterTypeInfo.length; i++) {
      localClusterTypeList[i + 1] = this.props.globalClusterTypeInfo[i];
    }
    this.setState({
      clusterTypeList: localClusterTypeList
    });
  }

  prepareAgentsList() {
    var prefix = "spiffe://";
    let localAgentsIdList:any = [];
    //agents
    if(this.props.globalAgentsList === undefined) {
      return
    }
    for (let i = 0; i < this.props.globalAgentsList.length; i++) {
      localAgentsIdList[i] = {}
      if(this.props.globalAgentsList[i].id !== undefined) {
        localAgentsIdList[i]["label"] = prefix + this.props.globalAgentsList[i].id.trust_domain + this.props.globalAgentsList[i].id.path;
      }
    }
    this.setState({
      agentsList: localAgentsIdList,
    });
  }

  render() {
    return (
      <div className="cluster-management-tabs" data-test="cluster-management">
        <Tabs scrollIntoView={false} >
          <Tab className="cluster-management-tab1"
            id="tab-1"
            label="Create Cluster"
          >
            <ClusterCreate
              clusterTypeList={this.state.clusterTypeList}
              agentsList={this.state.agentsList}
            />
          </Tab>
          <Tab
            id="tab-2"
            label="Edit Cluster"
          >
            <ClusterEdit
              clusterTypeList={this.state.clusterTypeList}
              agentsList={this.state.agentsList}
            />
          </Tab>
        </Tabs>
      </div>
    )
  }
}

const mapStateToProps = (state: { clusters: { globalClusterTypeInfo: []; }; servers: { globalServerSelected: string; globalServerInfo: []; globalTornjakServerInfo: string; }; agents: { globalAgentsList: []; }; tornjak: { globalErrorMessage: string; }; }) => ({
  globalClusterTypeInfo: state.clusters.globalClusterTypeInfo,
  globalServerSelected: state.servers.globalServerSelected,
  globalAgentsList: state.agents.globalAgentsList,
  globalServerInfo: state.servers.globalServerInfo,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessage: state.tornjak.globalErrorMessage,
})

// ClusterManagement.propTypes = {
//   globalClusterTypeInfo: PropTypes.array,
//   globalServerSelected: PropTypes.string,
//   globalAgentsList: PropTypes.array,
//   globalServerInfo: PropTypes.object,
//   globalTornjakServerInfo: PropTypes.object,
//   globalErrorMessage: PropTypes.string,
//   clusterTypeInfoFunc: PropTypes.func,
//   serverSelectedFunc: PropTypes.func,
//   agentsListUpdateFunc: PropTypes.func,
//   tornjakServerInfoUpdateFunc: PropTypes.func,
//   serverInfoUpdateFunc: PropTypes.func,
//   selectorInfoFunc: PropTypes.func,
//   tornjakMessageFunc: PropTypes.func,
// };

export default connect(
  mapStateToProps,
  { clusterTypeInfoFunc, serverSelectedFunc, selectorInfoFunc, agentsListUpdateFunc, tornjakMessageFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc }
)(ClusterManagement)

export { ClusterManagement };