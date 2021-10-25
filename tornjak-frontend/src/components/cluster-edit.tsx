import React, { Component } from "react";
import { connect } from "react-redux";
import axios from "axios";
import {
  Dropdown,
  TextInput,
  FilterableMultiSelect,
  TextArea,
} from "carbon-components-react";
import GetApiServerUri from "./helpers";
import IsManager from "./is_manager";
import TornjakApi from "./tornjak-api-helpers";
import "./style.css";
// import PropTypes from "prop-types";
import {
  clustersListUpdateFunc,
  clusterTypeInfoFunc,
  serverSelectedFunc,
  selectorInfoFunc,
  agentsListUpdateFunc,
  tornjakMessageFunc,
  tornjakServerInfoUpdateFunc,
  serverInfoUpdateFunc,
} from "redux/actions";

type ClusterEditProp = {
  clusterTypeList: any[], 
  globalServerSelected: string,
  globalErrorMessage: string,
  clustersListUpdateFunc: Function,
  tornjakMessageFunc: Function,
  globalClustersList: any,
  globalAgentsList: [],
  globalServerInfo: [],
  agentsList: []

}

type ClusterEditState = {
  originalClusterName: string,
  clusterName: string,
  clusterType: string,
  clusterDomainName: string,
  clusterManagedBy: string,
  clusterAgentsList: any[],
  clusterNameList: any[],
  clusterTypeList: any[],
  clusterTypeManualEntryOption: string,
  clusterTypeManualEntry: boolean,
  message: string,
  statusOK: string,
  selectedServer: string,
  agentsListDisplay: string,
  agentsListSelected: any[],
  assignedAgentsListDisplay: string,
}

class ClusterEdit extends Component<ClusterEditProp, ClusterEditState> {
  TornjakApi: TornjakApi;
  constructor(props:ClusterEditProp) {
    super(props);
    this.TornjakApi = new TornjakApi();
    this.onChangeClusterNameList = this.onChangeClusterNameList.bind(this);
    this.onChangeClusterName = this.onChangeClusterName.bind(this);
    this.onChangeClusterType = this.onChangeClusterType.bind(this);
    this.onChangeManualClusterType = this.onChangeManualClusterType.bind(this);
    this.onChangeClusterDomainName = this.onChangeClusterDomainName.bind(this);
    this.onChangeClusterManagedBy = this.onChangeClusterManagedBy.bind(this);
    this.prepareClusterNameList = this.prepareClusterNameList.bind(this);
    this.onChangeAgentsList = this.onChangeAgentsList.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      originalClusterName: "",
      clusterName: "",
      clusterType: "",
      clusterDomainName: "",
      clusterManagedBy: "",
      clusterAgentsList: [],
      clusterNameList: [],
      clusterTypeList: this.props.clusterTypeList,
      clusterTypeManualEntryOption:
        "----Select this option and Enter Custom Cluster Type Below----",
      clusterTypeManualEntry: false,
      message: "",
      statusOK: "",
      selectedServer: "",
      agentsListDisplay: "Select Agents",
      agentsListSelected: [],
      assignedAgentsListDisplay: "",
    };
  }

  componentDidMount() {
    if (IsManager) {
      if (
        this.props.globalServerSelected !== "" &&
        (this.props.globalErrorMessage === "OK" ||
          this.props.globalErrorMessage === "")
      ) {
        this.TornjakApi.populateClustersUpdate(
          this.props.globalServerSelected,
          this.props.clustersListUpdateFunc,
          this.props.tornjakMessageFunc
        );
        this.setState({ selectedServer: this.props.globalServerSelected });
      }
    } else {
      this.TornjakApi.populateLocalClustersUpdate(
        this.props.clustersListUpdateFunc,
        this.props.tornjakMessageFunc
      );
    }
    this.prepareClusterNameList();
  }

  componentDidUpdate(prevProps:ClusterEditProp) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.setState({ selectedServer: this.props.globalServerSelected });
      }
    }
    if (prevProps.globalClustersList !== this.props.globalClustersList) {
      this.prepareClusterNameList();
    }
    if (prevProps.globalAgentsList !== this.props.globalAgentsList) {
      this.prepareClusterNameList();
    }
  }

  prepareClusterNameList() {
    var clusters = this.props.globalClustersList;
    let localClusterNameList = [];
    if (this.props.globalServerInfo === undefined || this.props.globalServerInfo.length === 0) {
      return;
    }
    for (let i = 0; i < clusters.length; i++) {
      localClusterNameList[i] = clusters[i].name;
    }
    this.setState({
      clusterNameList: localClusterNameList,
    });
  }

  onChangeClusterNameList(e: any) {
    if(e === undefined) {
      return;
    }
    var sid = e.selectedItem,
      clusters = this.props.globalClustersList,
      cluster = [],
      assignedAgentsDisplay = "",
      agentsDisplay = "",
      agentsListSelected: any = [];
    for (let i = 0; i < clusters.length; i++) {
      if (clusters[i].name === sid) {
        cluster = clusters[i];
      }
    }
    for (let i = 0; i < cluster.agentsList.length; i++) {
      agentsListSelected[i] = {};
      agentsListSelected[i]["label"] = cluster.agentsList[i];
    }
    assignedAgentsDisplay = cluster.agentsList.join("\n");
    agentsDisplay = cluster.agentsList.toString();
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
    return;
  }

  onChangeClusterName(e: { target: { value: string; }; } | undefined) {
    if(e === undefined) {
      return;
    }
    var sid = e.target.value;
    this.setState({
      clusterName: sid,
    });
    return;
  }

  onChangeClusterType = (selected: any) => {
    if(selected === undefined) {
      return;
    }
    var sid = selected.selectedItem;
    if (sid.length === 0) {
      this.setState({
        clusterType: sid,
      });
      return;
    }
    if (sid === this.state.clusterTypeManualEntryOption) {
      this.setState({
        clusterTypeManualEntry: true,
        clusterType: sid,
      });
      return;
    }
    this.setState({
      clusterTypeManualEntry: false,
      clusterType: sid,
    });
    return;
  };

  onChangeManualClusterType(e: { target: { value: string; }; } | undefined) {
    if(e === undefined) {
      return;
    }
    var sid = e.target.value;
    if (sid.length === 0) {
      this.setState({
        clusterType: sid,
      });
      return;
    }
    this.setState({
      clusterType: sid,
    });
    return;
  }

  onChangeClusterDomainName(e: { target: { value: string; }; } | undefined) {
    if(e === undefined) {
      return;
    }
    var sid = e.target.value;
    this.setState({
      clusterDomainName: sid,
    });
    return;
  }

  onChangeClusterManagedBy(e: { target: { value: string; }; } | undefined) {
    if(e === undefined) {
      return;
    }
    var sid = e.target.value;
    this.setState({
      clusterManagedBy: sid,
    });
    return;
  }

  onChangeAgentsList = (selected: { selectedItems: {label: string}[]; } | undefined) => {
    if(selected === undefined) {
      return;
    }
    var sid = selected.selectedItems,
      agents = [],
      agentsDisplay = "",
      assignedAgentsDisplay = "";
    let localAgentsIdList = [];
    for (let i = 0; i < sid.length; i++) {
      localAgentsIdList[i] = sid[i].label;
    }
    agents = localAgentsIdList;
    agentsDisplay = localAgentsIdList.toString();
    assignedAgentsDisplay = localAgentsIdList.join("\n");
    if (agentsDisplay.length === 0) {
      agentsDisplay = "Select Agents";
    }
    this.setState({
      clusterAgentsList: agents,
      agentsListDisplay: agentsDisplay,
      assignedAgentsListDisplay: assignedAgentsDisplay,
      agentsListSelected: sid,
    });
  };

  getApiEntryCreateEndpoint() {
    if (!IsManager) {
      return GetApiServerUri("/api/tornjak/clusters/edit");
    } else if (IsManager && this.state.selectedServer !== "") {
      return (
        GetApiServerUri("/manager-api/tornjak/clusters/edit") +
        "/" +
        this.state.selectedServer
      );
    } else {
      this.setState({ message: "Error: No server selected" });
      return "";
    }
  }

  onSubmit(e: { preventDefault: () => void; } | undefined) {
    if(e !== undefined) {
      e.preventDefault();
    }
    if (this.state.originalClusterName.length === 0) {
      this.setState({ message: "ERROR: Please Choose a Cluster" });
      return;
    }
    if (this.state.clusterName.length === 0) {
      this.setState({
        message: "ERROR: Cluster Name Can Not Be Empty - Enter Cluster Name",
      });
      return;
    }
    if (this.state.clusterType.length === 0) {
      this.setState({
        message:
          "ERROR: Cluster Type Can Not Be Empty - Choose/ Enter Cluster Type",
      });
      return;
    }
    var cjtData = {
      cluster: {
        Name: this.state.originalClusterName,
        EditedName: this.state.clusterName,
        PlatformType: this.state.clusterType,
        DomainName: this.state.clusterDomainName,
        ManagedBy: this.state.clusterManagedBy,
        AgentsList: this.state.clusterAgentsList,
      },
    };
    let endpoint = this.getApiEntryCreateEndpoint();
    if (endpoint === "") {
      return;
    }
    axios
      .post(endpoint, cjtData)
      .then((res) =>
        this.setState({
          message:
            "Request:" +
            JSON.stringify(cjtData, null, " ") +
            "\n\nSuccess:" +
            JSON.stringify(res.data, null, " "),
          statusOK: "OK",
        })
      )
      .catch((err) =>
        this.setState({
          message: "ERROR:" + err.response.data,
          statusOK: "ERROR",
        })
      );
    if (IsManager) {
      if (
        this.props.globalServerSelected !== "" &&
        (this.props.globalErrorMessage === "OK" ||
          this.props.globalErrorMessage === "")
      ) {
        this.TornjakApi.populateClustersUpdate(
          this.props.globalServerSelected,
          this.props.clustersListUpdateFunc,
          this.props.tornjakMessageFunc
        );
      }
    } else {
      this.TornjakApi.populateLocalClustersUpdate(
        this.props.clustersListUpdateFunc,
        this.props.tornjakMessageFunc
      );
    }
  }
  render() {
    const ClusterNames = this.state.clusterNameList,
      ClusterType = this.props.clusterTypeList;
    return (
      <div className="cluster-edit" data-test="cluster-edit">
        <div className="cluster-edit-title" data-test="cluster-edit-title">
          <h3>Edit Cluster</h3>
        </div>
        <form onSubmit={this.onSubmit} data-test="cluster-edit-form">
          <br />
          <br />
          <div className="entry-form">
            <div className="clusters-drop-down" data-test="clusters-drop-down">
              <Dropdown
                aria-required="true"
                ariaLabel="clustertype-drop-down"
                id="clustertype-drop-down"
                items={ClusterNames}
                label="Select Cluster"
                titleText="Choose Cluster [*required]"
                onChange={this.onChangeClusterNameList}
                //required
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
                required
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
                //required
              />
              <p className="cluster-helper">i.e. Kubernetes, VMs...</p>
            </div>
            {this.state.clusterTypeManualEntry === true && (
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
                  onChange={(e: { target: { value: string; }; } | undefined) => {
                    this.onChangeManualClusterType(e);
                  }}
                />
              </div>
            )}
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
            <div className="form-group" data-test="cluster-edit-button">
              <input
                type="submit"
                value="Edit Cluster"
                className="btn btn-primary"
              />
            </div>
            <div data-test="success-message">
              {this.state.statusOK === "OK" && (
                <p className="success-message">
                  --CLUSTER SUCCESSFULLY EDITED--
                </p>
              )}
              {this.state.statusOK === "ERROR" && (
                <p className="failed-message">--CLUSTER EDIT FAILED--</p>
              )}
            </div>
            <div
              className="alert-primary"
              data-test="alert-primary"
              role="alert"
            >
              <pre>{this.state.message}</pre>
            </div>
          </div>
        </form>
      </div>
    );
  }
}

const mapStateToProps = (state: { clusters: { globalClusterTypeInfo: []; globalClustersList: []; }; servers: { globalServerSelected: string; globalSelectorInfo: {}; globalServerInfo: []; globalTornjakServerInfo: {}; globalWorkloadSelectorInfo: []; }; agents: { globalAgentsList: []; globalAgentsWorkLoadAttestorInfo: []; }; tornjak: { globalErrorMessage: string; }; }) => ({
  globalClusterTypeInfo: state.clusters.globalClusterTypeInfo,
  globalClustersList: state.clusters.globalClustersList,
  globalServerSelected: state.servers.globalServerSelected,
  globalSelectorInfo: state.servers.globalSelectorInfo,
  globalAgentsList: state.agents.globalAgentsList,
  globalServerInfo: state.servers.globalServerInfo,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessage: state.tornjak.globalErrorMessage,
  globalWorkloadSelectorInfo: state.servers.globalWorkloadSelectorInfo,
  globalAgentsWorkLoadAttestorInfo:
    state.agents.globalAgentsWorkLoadAttestorInfo,
});

// WorkInProgress - Leaving comments for now
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

export default connect(mapStateToProps, {
  clusterTypeInfoFunc,
  serverSelectedFunc,
  selectorInfoFunc,
  agentsListUpdateFunc,
  tornjakMessageFunc,
  tornjakServerInfoUpdateFunc,
  serverInfoUpdateFunc,
  clustersListUpdateFunc,
})(ClusterEdit);

export { ClusterEdit };
