import { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { Dropdown, TextInput, FilterableMultiSelect, TextArea, InlineNotification } from 'carbon-components-react';
import { Button } from '@mui/material';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import TornjakApi from './tornjak-api-helpers';
import { ToastContainer } from 'react-toastify';
import './style.css';
import {
  clustersListUpdateFunc,
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
  ClustersList,
  ServerInfo,
  DebugServerInfo,
} from './types';
import { showResponseToast, showToast } from './error-api';
import apiEndpoints from './apiConfig';

type ClusterEditProp = {
  // tornjak server debug info of the selected server
  globalDebugServerInfo: DebugServerInfo,
  // dispatches a payload for list of clusters with their metadata info as an array of ClustersList Type and has a return type of void
  clustersListUpdateFunc: (globalClustersList: ClustersList[]) => void,
  // dispatches a payload for the tornjak error messsege and has a return type of void
  tornjakMessageFunc: (globalErrorMessage: string) => void,
  // cluster types as array of strings
  clusterTypeList: string[],
  // the selected server for manager mode 
  globalServerSelected: string,
  // tornjak error messege
  globalErrorMessage: string,
  // list of clusters with their metadata info as an array of ClustersList Type
  globalClustersList: ClustersList[],
  // list of available agents as array of AgentsListType
  globalAgentsList: AgentsList[],
  // the server trust domain and nodeAttestorPlugin as a ServerInfoType
  globalServerInfo: ServerInfo,
  // list of agents' SPIFEE ID's as strings
  agentsList: AgentLabels[]
}

type ClusterEditState = {
  originalClusterName: string,
  clusterName: string,
  clusterType: string,
  clusterDomainName: string,
  clusterManagedBy: string,
  clusterAgentsList: string[],
  clusterNameList: string[],
  clusterTypeList: string[],
  clusterTypeManualEntryOption: string,
  clusterTypeManualEntry: boolean,
  message: string,
  statusOK: string,
  selectedServer: string,
  agentsListDisplay: string,
  agentsListSelected: AgentLabels[],
  assignedAgentsListDisplay: string,
}

class ClusterEdit extends Component<ClusterEditProp, ClusterEditState> {
  TornjakApi: TornjakApi;
  constructor(props: ClusterEditProp) {
    super(props);
    this.TornjakApi = new TornjakApi(props);
    this.onChangeClusterNameList = this.onChangeClusterNameList.bind(this);
    this.onChangeClusterName = this.onChangeClusterName.bind(this);
    this.onChangeClusterType = this.onChangeClusterType.bind(this);
    this.onChangeManualClusterType = this.onChangeManualClusterType.bind(this);
    this.onChangeClusterDomainName = this.onChangeClusterDomainName.bind(this);
    this.onChangeClusterManagedBy = this.onChangeClusterManagedBy.bind(this);
    this.prepareClusterNameList = this.prepareClusterNameList.bind(this);
    this.onChangeAgentsList = this.onChangeAgentsList.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.deleteCluster = this.deleteCluster.bind(this);

    this.state = {
      originalClusterName: "",
      clusterName: "",
      clusterType: "",
      clusterDomainName: "",
      clusterManagedBy: "",
      clusterAgentsList: [],
      clusterNameList: [],
      clusterTypeList: this.props.clusterTypeList,
      clusterTypeManualEntryOption: "----Select this option and Enter Custom Cluster Type Below----",
      clusterTypeManualEntry: false,
      message: "",
      statusOK: "",
      selectedServer: "",
      agentsListDisplay: "Select Agents",
      agentsListSelected: [],
      assignedAgentsListDisplay: "",
    }
  }

  componentDidMount() {
    if (IsManager) {
      if (this.props.globalServerSelected !== "" && (this.props.globalErrorMessage === "OK" || this.props.globalErrorMessage === "")) {
        this.TornjakApi.populateClustersUpdate(this.props.globalServerSelected, this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc)
        this.setState({ selectedServer: this.props.globalServerSelected });
      }
    } else {
      this.TornjakApi.populateLocalClustersUpdate(this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
    }
    this.prepareClusterNameList()
  }

  componentDidUpdate(prevProps: ClusterEditProp) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.setState({ selectedServer: this.props.globalServerSelected })
      }
    }
    if (prevProps.globalClustersList !== this.props.globalClustersList || prevProps.globalAgentsList !== this.props.globalAgentsList) {
      this.prepareClusterNameList()
    }
  }

  prepareClusterNameList(): void {
    var clusters = this.props.globalClustersList
    if (clusters === undefined || this.props.globalDebugServerInfo === undefined || Object.keys(this.props.globalDebugServerInfo).length === 0) return
    let localClusterNameList = []
    for (let i = 0; i < clusters.length; i++) {
      localClusterNameList[i] = clusters[i].name
    }
    this.setState({ clusterNameList: localClusterNameList })
  }

  onChangeClusterNameList = (selected: { selectedItem: string }): void => {
    if (selected === undefined) {
      return;
    }
    var sid = selected.selectedItem,
      clusters = this.props.globalClustersList,
      cluster: ClustersList | undefined = undefined,
      assignedAgentsDisplay = "",
      agentsDisplay = "",
      agentsListSelected: AgentLabels[] = [];
    if (clusters === undefined) {
      return
    }
    for (let i = 0; i < clusters.length; i++) {
      if (clusters[i].name === sid) {
        cluster = clusters[i];
      }
    }
    if (cluster === undefined) {
      return
    }
    for (let i = 0; i < cluster.agentsList.length; i++) {
      agentsListSelected[i] = { "label": "" }
      agentsListSelected[i]["label"] = cluster.agentsList[i];
    }
    assignedAgentsDisplay = cluster.agentsList.join("\n");
    agentsDisplay = cluster.agentsList.toString();
    console.log(cluster)
    this.setState({
      originalClusterName: cluster.name,
      clusterName: cluster.name,
      clusterType: cluster.platformType,
      clusterDomainName: cluster.domainName,
      clusterManagedBy: cluster.managedBy,
      clusterAgentsList: cluster.agentsList,
      agentsListDisplay: agentsDisplay, //agents list multiselect display
      assignedAgentsListDisplay: assignedAgentsDisplay, //agents list text box display
      agentsListSelected: agentsListSelected, //initial selected agents
    });
  }

  onChangeClusterName(e: { target: { value: string } } | undefined): void {
    if (e === undefined) return
    this.setState({ clusterName: e.target.value })
  }

  onChangeClusterType = (selected: { selectedItem: string }): void => {
    if (selected === undefined) {
      return;
    }
    var sid = selected.selectedItem;
    if (sid.length === 0) {
      this.setState({
        clusterType: sid,
      });
      return
    }
    if (sid === this.state.clusterTypeManualEntryOption) {
      this.setState({
        clusterTypeManualEntry: true,
        clusterType: sid,
      });
      return
    }
    this.setState({
      clusterTypeManualEntry: false,
      clusterType: sid,
    });
    return
  }

  onChangeManualClusterType(e: { target: { value: string; }; } | undefined): void {
    if (e === undefined) return
    this.setState({ clusterType: e.target.value })
  }

  onChangeClusterDomainName(e: { target: { value: string; }; } | undefined): void {
    if (e === undefined) return
    var sid = e.target.value
    this.setState({ clusterDomainName: sid })
  }

  onChangeClusterManagedBy(e: { target: { value: string; }; } | undefined): void {
    if (e === undefined) return
    var sid = e.target.value
    this.setState({ clusterManagedBy: sid })
  }

  onChangeAgentsList = (selected: { selectedItems: AgentLabels[]; } | undefined): void => {
    if (selected === undefined) return

    var sid = selected.selectedItems,
      agents = [],
      agentsDisplay = "",
      assignedAgentsDisplay = ""

    let localAgentsIdList = []

    for (let i = 0; i < sid.length; i++) {
      localAgentsIdList[i] = sid[i].label;
    }

    agents = localAgentsIdList;
    agentsDisplay = localAgentsIdList.toString()
    assignedAgentsDisplay = localAgentsIdList.join("\n")

    if (agentsDisplay.length === 0) {
      agentsDisplay = "Select Agents"
    }

    this.setState({
      clusterAgentsList: agents,
      agentsListDisplay: agentsDisplay,
      assignedAgentsListDisplay: assignedAgentsDisplay,
      agentsListSelected: sid,
    });
  }

  getApiEntryCreateEndpoint(): string {
    if (!IsManager) {
      return GetApiServerUri(apiEndpoints.tornjakClustersApi)
    }
    if (IsManager && this.state.selectedServer !== "") {
      return GetApiServerUri('/manager-api/tornjak/clusters/edit') + "/" + this.state.selectedServer
    }
    this.setState({ message: "Error: No server selected" })
    return ""
  }

  deleteCluster() {
    var cluster = this.state.clusterName, successMessage;
    var inputData =
    {
      "cluster": {
        "name": cluster
      }
    }
    if (cluster === "") {
      return window.alert("Please Choose a Cluster!");
    }
    var confirm = window.confirm("Are you sure you want to delete the cluster?");
    if (!confirm) {
      return
    }
    if (IsManager) {
      successMessage = this.TornjakApi.clusterDelete(this.props.globalServerSelected, inputData, this.props.clustersListUpdateFunc, this.props.globalClustersList);
    } else {
      successMessage = this.TornjakApi.localClusterDelete(inputData, this.props.clustersListUpdateFunc, this.props.globalClustersList);
    }
    successMessage.then(function (result) {
      if (result === "SUCCESS") {
        window.alert("CLUSTER DELETED SUCCESSFULLY!");
        window.location.reload();
      } else {
        window.alert("Error deleting cluster: " + result);
      }
      return;
    })
  }

  onSubmit(e: { preventDefault: () => void } | undefined): void {

    if (e !== undefined) {
      e.preventDefault()
    }

    if (!this.state.originalClusterName) {
      showToast({ caption: "Please select an existing cluster." })
      return
    }

    if (!this.state.clusterName) {
      showToast({ caption: "The new cluster name cannot be empty." })
      return
    }

    if (this.state.clusterTypeManualEntry && this.state.clusterType === this.state.clusterTypeManualEntryOption) {
      showToast({ caption: "The cluster type cannot be empty." })
      return
    }

    if (!this.state.clusterName) {
      showToast({ caption: "The cluster name cannot be empty." })
      return
    }

    var cjtData = {
      cluster: {
        Name: this.state.originalClusterName,
        EditedName: this.state.clusterName,
        PlatformType: this.state.clusterType,
        DomainName: this.state.clusterDomainName,
        ManagedBy: this.state.clusterManagedBy,
        AgentsList: this.state.clusterAgentsList
      }
    }

    let endpoint = this.getApiEntryCreateEndpoint()

    if (!endpoint) {
      return
    }

    axios.patch(endpoint, cjtData)
      .then(
        res => this.setState({
          message: "Request:" + JSON.stringify(cjtData, null, ' ') + "\n\nSuccess:" + JSON.stringify(res.data, null, ' '),
          statusOK: "OK"
        })
      )
      .catch(err => showResponseToast(err))

    //scroll to bottom of page after submission  
    setTimeout(() => {
      window.scrollTo({ top: document.documentElement.scrollHeight, behavior: 'smooth' });
    }, 100);

    if (IsManager) {
      if (this.props.globalServerSelected !== "" && (this.props.globalErrorMessage === "OK" || this.props.globalErrorMessage === "")) {
        this.TornjakApi.populateClustersUpdate(this.props.globalServerSelected, this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
      }
    } else {
      this.TornjakApi.populateLocalClustersUpdate(this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
    }
  }

  render() {
    const ClusterNames = this.state.clusterNameList, ClusterType = this.props.clusterTypeList;
    return (
      <div className="cluster-edit" data-test="cluster-edit">
        <div className="create-edit-title" data-test="cluster-edit-title">
          <h3>Edit Cluster</h3>
        </div>
        <form onSubmit={this.onSubmit} data-test="cluster-edit-form">
          <br /><br />
          <div className="entry-form">
            <div className="clustertype-drop-down" data-test="clusters-drop-down">
              <Dropdown
                aria-required="true"
                ariaLabel="clustertype-drop-down"
                id="clustertype-drop-down"
                items={ClusterNames}
                label="Select Cluster"
                titleText="Choose Cluster [*required]"
                onChange={this.onChangeClusterNameList}
              />
              <p className="cluster-helper">i.e. Choose Cluster Name To Edit</p>
            </div>
            <div
              className="clustername-input-field"
              data-test="clustername-input-field"
            >
              <TextInput
                helperText="i.e. exampleabc"
                id="clusterNameInputField"
                invalidText="A valid value is required - refer to helper text below"
                labelText="Edit Cluster Name"
                placeholder="Edit CLUSTER NAME"
                defaultValue={this.state.clusterName}
                onChange={this.onChangeClusterName}
              />
            </div>
            <div
              className="clustertype-drop-down"
              data-test="clustertype-drop-down"
            >
              <Dropdown
                ariaLabel="clustertype-drop-down"
                id="clustertype-drop-down"
                items={ClusterType}
                label="Select Cluster Type"
                selectedItem={this.state.clusterType}
                titleText="Edit Cluster Type"
                onChange={this.onChangeClusterType}
              />
              <p className="cluster-helper">i.e. Kubernetes, VMs...</p>
            </div>
            {this.state.clusterTypeManualEntry === true &&
              <div
                className="clustertype-manual-input-field"
                data-test="clustertype-manual-input-field"
              >
                <TextInput
                  helperText="i.e. Kubernetes, VMs..."
                  id="clusterTypeManualInputField"
                  invalidText="A valid value is required - refer to helper text below"
                  labelText="Cluster Type - Manual Entry"
                  placeholder="Enter Cluster Type"
                  onChange={(e) => this.onChangeManualClusterType(e)}
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
                labelText="Edit Cluster Domain Name/ URL"
                placeholder="Edit CLUSTER DOMAIN NAME/ URL"
                defaultValue={this.state.clusterDomainName}
                onChange={this.onChangeClusterDomainName}
              />
            </div>
            <div
              className="cluster-managed-by-input-field"
              data-test="cluster-managed-by-input-field"
            >
              <TextInput
                helperText="i.e. person-A"
                id="clusterNameInputField"
                invalidText="A valid value is required - refer to helper text below"
                labelText="Edit Cluster Managed By"
                placeholder="Edit CLUSTER MANAGED BY"
                defaultValue={this.state.clusterManagedBy}
                onChange={this.onChangeClusterManagedBy}
              />
            </div>
            <div className="agents-multiselect" data-test="agents-multiselect">
              <FilterableMultiSelect
                key={this.state.agentsListDisplay}
                titleText="Edit Assigned Agents To Cluster"
                helperText="i.e. spiffe://example.org/agent/myagent1..."
                placeholder={this.state.agentsListDisplay}
                //ariaLabel="selectors-multiselect"
                id="selectors-multiselect"
                initialSelectedItems={this.state.agentsListSelected}
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
            <div className="edit-cluster-button">
              <input type="submit" value="EDIT CLUSTER" className="btn btn-primary" />
            </div>
            <div className="delete-cluster-button">
              <Button
                variant="contained"
                color="error"
                onClick={this.deleteCluster}>
                Delete Cluster
              </Button>
            </div>
            <div>
              {this.state.statusOK === "OK" &&
                <InlineNotification
                  kind="success"
                  hideCloseButton
                  title="CLUSTER SUCCESSFULLY EDITED"
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
                  title="CLUSTER EDIT FAILED"
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
// ClusterEdit.propTypes = {
//   clusterTypeList: PropTypes.array,
//   agentsList: PropTypes.array,
//   globalAgentsList: PropTypes.array,
//   //agentsListUpdateFunc: PropTypes.func,
//   clustersListUpdateFunc: PropTypes.func,
//   globalClustersList: PropTypes.array,
//   //clusterTypeInfoFunc: PropTypes.func,
//   // globalAgentsWorkLoadAttestorInfo: PropTypes.array,
//   // globalClusterTypeInfo: PropTypes.array,
//   globalErrorMessage: PropTypes.string,
//   // globalSelectorInfo: PropTypes.object,
//   globalServerInfo: PropTypes.object,
//   globalServerSelected: PropTypes.string,
//   //globalTornjakServerInfo: PropTypes.object,
//   // globalWorkloadSelectorInfo: PropTypes.object,
//   // selectorInfoFunc: PropTypes.func,
//   //serverInfoUpdateFunc: PropTypes.func,
//   // serverSelectedFunc: PropTypes.func,
//   tornjakMessageFunc: PropTypes.func,
//   //tornjakServerInfoUpdateFunc: PropTypes.func,
//   // agentsList: PropTypes.arrayOf(PropTypes.shape({
//   //   key1: PropTypes.string,
//   //   key2: PropTypes.object
//   // })),
// };

const mapStateToProps = (state: RootState) => ({
  globalClusterTypeInfo: state.clusters.globalClusterTypeInfo,
  globalClustersList: state.clusters.globalClustersList,
  globalServerSelected: state.servers.globalServerSelected,
  globalSelectorInfo: state.servers.globalSelectorInfo,
  globalAgentsList: state.agents.globalAgentsList,
  globalServerInfo: state.servers.globalServerInfo,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessage: state.tornjak.globalErrorMessage,
  globalWorkloadSelectorInfo: state.servers.globalWorkloadSelectorInfo,
  globalAgentsWorkLoadAttestorInfo: state.agents.globalAgentsWorkLoadAttestorInfo,
  globalDebugServerInfo: state.servers.globalDebugServerInfo,
})

export default connect(
  mapStateToProps,
  { clusterTypeInfoFunc, serverSelectedFunc, selectorInfoFunc, agentsListUpdateFunc, tornjakMessageFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc, clustersListUpdateFunc }
)(ClusterEdit)

export { ClusterEdit };