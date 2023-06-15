import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { Dropdown, TextInput, FilterableMultiSelect, TextArea, InlineNotification } from 'carbon-components-react';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import TornjakApi from './tornjak-api-helpers';
import { clusterType } from '../data/data';
import { ToastContainer } from 'react-toastify';
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
import { RootState } from 'redux/reducers'
import {
  AgentLabels,
  AgentsList,
  ServerInfo,
  TornjakServerInfo
} from './types'
import { showResponseToast, showToast } from './error-api';

type ClusterCreateProp = {
  // dispatches a payload for the server trust domain and nodeAttestorPlugin as a ServerInfoType and has a return type of void
  serverInfoUpdateFunc: (globalServerInfo: ServerInfo) => void,
  // dispatches a payload for list of agents with their metadata info as an array of AgentListType and has a return type of void
  agentsListUpdateFunc: (globalAgentsList: AgentsList[]) => void,
  // dispatches a payload for the tornjak error messsege and has a return type of void
  tornjakMessageFunc: (globalErrorMessage: string) => void,
  // dispatches a payload for the tornjak server info of the selected server and has a return type of void
  tornjakServerInfoUpdateFunc: (globalTornjakServerInfo: TornjakServerInfo) => void,
  // dispatches a payload for cluster types as array of strings and has a return type of void
  clusterTypeInfoFunc: (globalClusterTypeInfo: string[]) => void,
  // list of agents' SPIFEE ID's as strings
  agentsList: AgentLabels[],
  // cluster types as array of strings
  clusterTypeList: string[],
  // the selected server for manager mode 
  globalServerSelected: string,
  // tornjak error messege
  globalErrorMessage: string,
  // tornjak server info of the selected server
  globalTornjakServerInfo: TornjakServerInfo,
}

type ClusterCreateState = {
  clusterName: string,
  clusterType: string,
  clusterDomainName: string,
  clusterManagedBy: string,
  clusterAgentsList: string[],
  clusterTypeList: string[],
  clusterTypeManualEntryOption: string,
  clusterTypeManualEntry: boolean,
  message: string,
  statusOK: string,
  selectedServer: string,
  agentsListDisplay: string,
  assignedAgentsListDisplay: string,
}

class ClusterCreate extends Component<ClusterCreateProp, ClusterCreateState> {
  TornjakApi: TornjakApi;
  constructor(props: ClusterCreateProp) {
    super(props);
    this.TornjakApi = new TornjakApi(props);
    this.onChangeClusterName = this.onChangeClusterName.bind(this);
    this.onChangeClusterType = this.onChangeClusterType.bind(this);
    this.onChangeManualClusterType = this.onChangeManualClusterType.bind(this);
    this.onChangeClusterDomainName = this.onChangeClusterDomainName.bind(this);
    this.onChangeClusterManagedBy = this.onChangeClusterManagedBy.bind(this);
    this.onChangeAgentsList = this.onChangeAgentsList.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      clusterName: "",
      clusterType: "",
      clusterDomainName: "",
      clusterManagedBy: "",
      clusterAgentsList: [],
      clusterTypeList: this.props.clusterTypeList,
      clusterTypeManualEntryOption: "----Select this option and Enter Custom Cluster Type Below----",
      clusterTypeManualEntry: false,
      message: "",
      statusOK: "",
      selectedServer: "",
      agentsListDisplay: "Select Agents",
      assignedAgentsListDisplay: "",
    }
  }

  componentDidMount() {
    this.props.clusterTypeInfoFunc(clusterType); //set cluster type info
    if (IsManager) {
      if (this.props.globalServerSelected !== "" && (this.props.globalErrorMessage === "OK" || this.props.globalErrorMessage === "")) {
        this.TornjakApi.populateAgentsUpdate(this.props.globalServerSelected, this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
        this.TornjakApi.populateTornjakServerInfo(this.props.globalServerSelected, this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
        this.setState({ selectedServer: this.props.globalServerSelected });
      }
    } else {
      this.TornjakApi.populateLocalAgentsUpdate(this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
      this.TornjakApi.populateLocalTornjakServerInfo(this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
      this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
    }
  }

  componentDidUpdate(prevProps: ClusterCreateProp) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.setState({ selectedServer: this.props.globalServerSelected });
      }
    }
  }

  onChangeAgentsList = (selected: { selectedItems: AgentLabels[]; } | undefined): void => {
    if (selected === undefined) {
      return;
    }
    var sid = selected.selectedItems, agents = [], agentsDisplay = "", assignedAgentsDisplay = "";
    let localAgentsIdList = [];
    for (let i = 0; i < sid.length; i++) {
      localAgentsIdList[i] = sid[i].label;
    }
    agents = localAgentsIdList;
    agentsDisplay = localAgentsIdList.toString();
    assignedAgentsDisplay = localAgentsIdList.join("\n");
    if (agentsDisplay.length === 0) {
      agentsDisplay = "Select Agents"
    }
    this.setState({
      clusterAgentsList: agents,
      agentsListDisplay: agentsDisplay,
      assignedAgentsListDisplay: assignedAgentsDisplay,
    });
  }

  onChangeClusterName(e: { target: { value: string; }; } | undefined): void {
    if (e === undefined) {
      return;
    }
    var sid = e.target.value;
    this.setState({
      clusterName: sid
    });
    return
  }

  onChangeClusterType = (selected: { selectedItem: string }): void => {
    if (selected === undefined) {
      return;
    }
    var sid = selected.selectedItem;
    if (sid === this.state.clusterTypeManualEntryOption) {
      this.setState({
        clusterTypeManualEntry: true,
        clusterType: sid,
      });
    } else {
      this.setState({
        clusterType: sid,
        clusterTypeManualEntry: false
      });
    }
    return
  }

  onChangeManualClusterType(e: { target: { value: string; }; } | undefined): void {
    if (e === undefined) {
      return;
    }
    var sid = e.target.value;
    this.setState({
      clusterType: sid
    });
    return
  }

  onChangeClusterDomainName(e: { target: { value: string; }; } | undefined): void {
    if (e === undefined) {
      return;
    }
    var sid = e.target.value;
    this.setState({
      clusterDomainName: sid
    });
    return
  }

  onChangeClusterManagedBy(e: { target: { value: string; }; } | undefined): void {
    if (e === undefined) {
      return;
    }
    var sid = e.target.value;
    this.setState({
      clusterManagedBy: sid
    });
    return
  }

  getApiEntryCreateEndpoint(): string {
    if (!IsManager) {
      return GetApiServerUri('/api/tornjak/clusters/create')
    } else if (IsManager && this.state.selectedServer !== "") {
      return GetApiServerUri('/manager-api/tornjak/clusters/create') + "/" + this.state.selectedServer
    } else {
      this.setState({ message: "Error: No server selected" })
      return ""
    }
  }

  onSubmit(e: { preventDefault: () => void; } | undefined): void {
    if (e !== undefined) {
      e.preventDefault()
    }

    if (!this.state.clusterName) {
      showToast({ caption: "The cluster name cannot be empty." })
      return
    }

    if ((this.state.clusterTypeManualEntry && this.state.clusterType === this.state.clusterTypeManualEntryOption) || !this.state.clusterType) {
      showToast({ caption: "The cluster type cannot be empty." })
      return
    }

    var cjtData = {
      cluster: {
        name: this.state.clusterName,
        platformType: this.state.clusterType,
        domainName: this.state.clusterDomainName,
        managedBy: this.state.clusterManagedBy,
        agentsList: this.state.clusterAgentsList ? this.state.clusterAgentsList : []
      }
    }

    let endpoint = this.getApiEntryCreateEndpoint()

    if (!endpoint) {
      return
    }

    axios.post(endpoint, cjtData)
      .then(
        res => {
          this.setState({
            message: "Request:" + JSON.stringify(cjtData, null, ' ') + "\n\nSuccess:" + JSON.stringify(res.data, null, ' '),
            statusOK: "OK",
          })
        }
      )
      .catch(err => showResponseToast(err))
    //scroll to bottom of page after submission  
    setTimeout(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }, 100);
  }

  render() {
    const ClusterType = this.props.clusterTypeList;
    return (
      <div>
        <div className="cluster-create" data-test="cluster-create">
          <div className="create-create-title" data-test="create-title">
            <h3>Create Cluster</h3>
          </div>
          <form onSubmit={this.onSubmit} data-test="create-cluster-form">
            <br /><br />
            <div className="entry-form">
              <div
                className="clustername-input-field"
                data-test="clustername-input-field">
                <TextInput
                  data-test="clustername-Text-input-field"
                  aria-required="true"
                  helperText="i.e. exampleabc"
                  id="clusterNameInputField"
                  invalidText="A valid value is required - refer to helper text below"
                  labelText="Cluster Name [*required]"
                  placeholder="Enter CLUSTER NAME"
                  onChange={this.onChangeClusterName}
                  role="cluster-name"
                />
              </div>
              <div
                className="clustertype-drop-down"
                data-test="clustertype-drop-down">
                <Dropdown
                  aria-required="true"
                  ariaLabel="clustertype-drop-down"
                  id="clustertype-drop-down"
                  items={ClusterType}
                  label="Select Cluster Type"
                  titleText="Cluster Type [*required]"
                  onChange={this.onChangeClusterType}
                  role="cluster-type"
                // typescript throws an error when enabled - need to explore more to enable feature for now "aria-required" is enabled
                />
                <p className="cluster-helper">i.e. Kubernetes, VMs...</p>
              </div>
              {this.state.clusterTypeManualEntry &&
                <div className="clustertype-manual-input-field">
                  <TextInput
                    helperText="i.e. Kubernetes, VMs..."
                    id="clusterTypeManualInputField"
                    invalidText="A valid value is required - refer to helper text below"
                    labelText="Cluster Type - Manual Entry"
                    placeholder="Enter Cluster Type"
                    onChange={(e) => {
                      this.onChangeManualClusterType(e);
                    }}
                  />
                </div>}
              <div
                className="cluster-domain-name-input-field"
                data-test="cluster-domain-name-input-field"
              >
                <TextInput
                  helperText="i.e. example.org"
                  id="clusterDomainNameInputField"
                  invalidText="A valid value is required - refer to helper text below"
                  labelText="Cluster Domain Name/ URL"
                  placeholder="Enter CLUSTER DOMAIN NAME/ URL"
                  onChange={this.onChangeClusterDomainName}
                />
              </div>
              <div className="cluster-managed-by-input-field">
                <TextInput
                  data-test="cluster-domain-name-input-text-field"
                  helperText="i.e. person-A"
                  id="clusterNameInputField"
                  invalidText="A valid value is required - refer to helper text below"
                  labelText="Cluster Managed By"
                  placeholder="Enter CLUSTER MANAGED BY"
                  onChange={this.onChangeClusterManagedBy}
                />
              </div>
              <div className="agents-multiselect" data-test="agents-multiselect">
                <FilterableMultiSelect
                  titleText="Assign Agents To Cluster"
                  helperText="i.e. spiffe://example.org/agent/myagent1..."
                  placeholder={this.state.agentsListDisplay}
                  id="selectors-multiselect"
                  items={this.props.agentsList}
                  label={this.state.agentsListDisplay}
                  onChange={this.onChangeAgentsList}
                />
              </div>
              <div className="selectors-textArea" data-test="selectors-textArea">
                <TextArea
                  cols={50}
                  helperText="i.e. spiffe://example.org/agent/myagent1..."
                  id="selectors-textArea"
                  invalidText="A valid value is required"
                  labelText="Assigned Agents"
                  placeholder="Assigned agents will be populated here - Refer to Assign Agents To Cluster"
                  defaultValue={this.state.assignedAgentsListDisplay}
                  rows={8}
                  disabled
                />
              </div>
              <div className="form-group" data-test="create-cluster-button">
                <input type="submit" value="Create Cluster" className="btn btn-primary" />
              </div>
              <div>
                {this.state.statusOK === "OK" &&
                  <InlineNotification
                    kind="success"
                    hideCloseButton
                    title="CLUSTER SUCCESSFULLY CREATED"
                    subtitle={
                      <div className="toast-messege" data-test="alert-primary">
                        <pre className="toast-messege-color">
                          {this.state.message}
                        </pre>
                      </div>
                    }
                  />
                }
                {(this.state.statusOK === "ERROR") &&
                  <InlineNotification
                    kind="error"
                    hideCloseButton
                    title="CLUSTER CREATION FAILED"
                    subtitle={
                      <div className="toast-messege" data-test="alert-primary">
                        <pre className="toast-messege-color">
                          {this.state.message}
                        </pre>
                      </div>
                    }
                  />
                }
              </div>
            </div>
          </form>
        </div>
        <ToastContainer
          className="carbon-toast"
          containerId="notifications"
          draggable={false}
        />
      </div>
    )
  }
}

// Note: Needed for UI testing - will be removed after
// ClusterCreate.propTypes = {
//   clusterTypeList: PropTypes.array,
//   agentsList: PropTypes.array,
//   // globalAgentsList: PropTypes.array,
//   agentsListUpdateFunc: PropTypes.func,
//   clusterTypeInfoFunc: PropTypes.func,
//   // globalAgentsWorkLoadAttestorInfo: PropTypes.array,
//   // globalClusterTypeInfo: PropTypes.array,
//   globalErrorMessage: PropTypes.string,
//   // globalSelectorInfo: PropTypes.object,
//   // globalServerInfo: PropTypes.object,
//   globalServerSelected: PropTypes.string,
//   globalTornjakServerInfo: PropTypes.object,
//   // globalWorkloadSelectorInfo: PropTypes.object,
//   // selectorInfoFunc: PropTypes.func,
//   serverInfoUpdateFunc: PropTypes.func,
//   // serverSelectedFunc: PropTypes.func,
//   tornjakMessageFunc: PropTypes.func,
//   tornjakServerInfoUpdateFunc: PropTypes.func,
//   // agentsList: PropTypes.arrayOf(PropTypes.shape({
//   //   key1: PropTypes.string,
//   //   key2: PropTypes.object
//   // })),
// };

const mapStateToProps = (state: RootState) => ({
  globalClusterTypeInfo: state.clusters.globalClusterTypeInfo,
  globalServerSelected: state.servers.globalServerSelected,
  globalSelectorInfo: state.servers.globalSelectorInfo,
  globalAgentsList: state.agents.globalAgentsList,
  globalServerInfo: state.servers.globalServerInfo,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessage: state.tornjak.globalErrorMessage,
  globalWorkloadSelectorInfo: state.servers.globalWorkloadSelectorInfo,
  globalAgentsWorkLoadAttestorInfo: state.agents.globalAgentsWorkLoadAttestorInfo,
})

export default connect(
  mapStateToProps,
  {
    clusterTypeInfoFunc,
    serverSelectedFunc,
    selectorInfoFunc,
    agentsListUpdateFunc,
    tornjakMessageFunc,
    tornjakServerInfoUpdateFunc,
    serverInfoUpdateFunc
  }
)(ClusterCreate)

export { ClusterCreate }