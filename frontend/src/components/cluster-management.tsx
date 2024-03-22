import { Component } from 'react';
import { Tabs, TabList, Tab, TabPanels, TabPanel } from '@carbon/react';
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
import { RootState } from 'redux/reducers';
import {
  AgentLabels,
  AgentsList,
  ServerInfo,
  TornjakServerInfo,
  DebugServerInfo
} from './types'
import { toast } from 'react-toastify';
// import PropTypes from "prop-types"; // needed for testing will be removed on last pr
type ClusterManagementProp = {
  // tornjak server debug info of the selected server
  globalDebugServerInfo: DebugServerInfo,
  // dispatches a payload for list of agents with their metadata info as an array of AgentListType and has a return type of void
  agentsListUpdateFunc: (globalAgentsList: AgentsList[]) => void,
  // dispatches a payload for an Error Message/ Success Message of an executed function as a string and has a return type of void
  tornjakMessageFunc: (globalErrorMessage: string) => void,
  // dispatches a payload for the tornjak server info of the selected server and has a return type of void
  tornjakServerInfoUpdateFunc: (globalTornjakServerInfo: TornjakServerInfo) => void,
  // dispatches a payload for the server trust domain and nodeAttestorPlugin as a ServerInfoType and has a return type of void
  serverInfoUpdateFunc: (globalServerInfo: ServerInfo) => void,
  // the selected server for manager mode
  globalServerSelected: string,
  // error/ success messege returned for a specific function
  globalErrorMessage: string,
  // tornjak server info of the selected server
  globalTornjakServerInfo: TornjakServerInfo,
  // the server trust domain and nodeAttestorPlugin as a ServerInfoType
  globalServerInfo: ServerInfo,
  // cluster types as array of strings
  globalClusterTypeInfo: string[],
  // list of available agents as array of AgentsListType
  globalAgentsList: AgentsList[],
}
type ClusterManagementState = {
  clusterTypeList: string[],
  agentsList: AgentLabels[],
  agentsListDisplay: string,
  clusterTypeManualEntryOption: string,
  selectedServer: string,
}
class ClusterManagement extends Component<ClusterManagementProp, ClusterManagementState> {
  TornjakApi: TornjakApi;
  constructor(props: ClusterManagementProp) {
    super(props);
    this.TornjakApi = new TornjakApi(props);
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
  componentDidUpdate(prevProps: ClusterManagementProp, prevState: ClusterManagementState) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.setState({ selectedServer: this.props.globalServerSelected });
      }
      if (prevProps.globalDebugServerInfo !== this.props.globalDebugServerInfo) {
        this.prepareAgentsList();
      }
    } else {
      if (prevProps.globalDebugServerInfo !== this.props.globalDebugServerInfo) {
        this.prepareAgentsList();
      }
    }
  }
  prepareClusterTypeList(): void {
    // user prefered option
    let localClusterTypeList = [this.state.clusterTypeManualEntryOption]
    // cluster type list
    for (let i = 0; i < this.props.globalClusterTypeInfo.length; i++) {
      localClusterTypeList.push(this.props.globalClusterTypeInfo[i])
    }
    this.setState({ clusterTypeList: localClusterTypeList })
  }
  prepareAgentsList(): void {
    var prefix = "spiffe://";
    let localAgentsIdList: AgentLabels[] = [];
    //agents
    if (this.props.globalAgentsList === undefined) {
      return
    }
    for (let i = 0; i < this.props.globalAgentsList.length; i++) {
      localAgentsIdList[i] = { "label": "" }
      localAgentsIdList[i]["label"] = prefix + this.props.globalAgentsList[i].id.trust_domain + this.props.globalAgentsList[i].id.path;
    }
    this.setState({
      agentsList: localAgentsIdList,
    });
  }
  handleTabSelect(): void {
    toast.dismiss()
  }
  render() {
    return (
      <div className="cluster-management-tabs" data-test="cluster-management">
        <Tabs>
          <TabList aria-label='hi'>
            <Tab
              className="cluster-management-tab1"
              id="tab-1"
              // label="Create Cluster"
              onClick={this.handleTabSelect}
            >
              Create Cluster
            </Tab>
            <Tab
              id="tab-2"
              // label="Edit Cluster"
              onClick={this.handleTabSelect}
            >
              Edit Cluster
            </Tab>
          </TabList>
          <TabPanels>
            <TabPanel>
              <ClusterCreate
                clusterTypeList={this.state.clusterTypeList}
                agentsList={this.state.agentsList}
              />
            </TabPanel>
            <TabPanel>
              <ClusterEdit
                clusterTypeList={this.state.clusterTypeList}
                agentsList={this.state.agentsList}
              />
            </TabPanel>
          </TabPanels>
        </Tabs>
      </div>
    )
  }
}
// Note: Needed for UI testing - will be removed after
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
const mapStateToProps = (state: RootState) => ({
  globalClusterTypeInfo: state.clusters.globalClusterTypeInfo,
  globalServerSelected: state.servers.globalServerSelected,
  globalAgentsList: state.agents.globalAgentsList,
  globalServerInfo: state.servers.globalServerInfo,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessage: state.tornjak.globalErrorMessage,
  globalDebugServerInfo: state.servers.globalDebugServerInfo,
})
export default connect(
  mapStateToProps,
  { clusterTypeInfoFunc, serverSelectedFunc, selectorInfoFunc, agentsListUpdateFunc, tornjakMessageFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc }
)(ClusterManagement)
export { ClusterManagement }