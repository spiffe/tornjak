import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { Dropdown, TextInput, MultiSelect, TextArea } from 'carbon-components-react';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import TornjakApi from './tornjak-api-helpers';
import { clusterType } from '../data/data';
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

class ClusterCreate extends Component {
  constructor(props) {
    super(props);
    this.TornjakApi = new TornjakApi();
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
      clusterAgentsList: "",
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

  componentDidUpdate(prevProps, prevState) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.setState({ selectedServer: this.props.globalServerSelected });
      }
    }
  }

  onChangeAgentsList = selected => {
    var sid = selected.selectedItems, agents = "", agentsDisplay = "", assignedAgentsDisplay = "";
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

  onChangeClusterName(e) {
    var sid = e.target.value;
    this.setState({
      clusterName: sid
    });
    return
  }

  onChangeClusterType = selected => {
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

  onChangeManualClusterType(e) {
    var sid = e.target.value;
    this.setState({
      clusterType: sid
    });
    return
  }

  onChangeClusterDomainName(e) {
    var sid = e.target.value;
    this.setState({
      clusterDomainName: sid
    });
    return
  }

  onChangeClusterManagedBy(e) {
    var sid = e.target.value;
    this.setState({
      clusterManagedBy: sid
    });
    return
  }

  getApiEntryCreateEndpoint() {
    if (!IsManager) {
      return GetApiServerUri('/api/tornjak/clusters/create')
    } else if (IsManager && this.state.selectedServer !== "") {
      return GetApiServerUri('/manager-api/tornjak/clusters/create') + "/" + this.state.selectedServer
    } else {
      this.setState({ message: "Error: No server selected" })
      return ""
    }
  }

  onSubmit(e) {
    var agentsList = [];
    e.preventDefault();

    if (this.state.clusterName.length === 0) {
      this.setState({ message: "ERROR: Cluster Name Can Not Be Empty - Enter Cluster Name" });
      return
    }

    if (this.state.clusterType.length === 0) {
      this.setState({ message: "ERROR: Cluster Type Can Not Be Empty - Choose/ Enter Cluster Type" });
      return
    }

    if (this.state.clusterAgentsList !== "") {
      agentsList = this.state.clusterAgentsList;
    }

    var cjtData = {
      "cluster": {
        "name": this.state.clusterName,
        "platformType": this.state.clusterType,
        "domainName": this.state.clusterDomainName,
        "managedBy": this.state.clusterManagedBy,
        "agentsList": agentsList
      }
    }

    let endpoint = this.getApiEntryCreateEndpoint();
    if (endpoint === "") {
      return
    }
    axios.post(endpoint, cjtData)
      .then(
        res => this.setState({
          message: "Request:" + JSON.stringify(cjtData, null, ' ') + "\n\nSuccess:" + JSON.stringify(res.data, null, ' '),
          statusOK: "OK",
        })
      )
      .catch(
        err => this.setState({
          message: "ERROR:" + err.response.data,
          statusOK: "ERROR"
        })
      )
  }
  render() {
    const ClusterType = this.props.clusterTypeList;
    return (
      <div>
        <div className="cluster-create">
          <div className="create-create-title">
            <h3>Create Cluster</h3>
          </div>
          <form onSubmit={this.onSubmit}>
            <br /><br />
            <div className="entry-form">
              <div className="clustername-input-field">
                <TextInput
                  aria-required="true"
                  helperText="i.e. exampleabc"
                  id="clusterNameInputField"
                  invalidText="A valid value is required - refer to helper text below"
                  labelText="Cluster Name [*required]"
                  placeholder="Enter CLUSTER NAME"
                  onChange={this.onChangeClusterName}
                  required />
              </div>
              <div className="clustertype-drop-down">
                <Dropdown
                  aria-required="true"
                  ariaLabel="clustertype-drop-down"
                  id="clustertype-drop-down"
                  items={ClusterType}
                  label="Select Cluster Type"
                  titleText="Cluster Type [*required]"
                  onChange={this.onChangeClusterType}
                  required />
                <p className="cluster-helper">i.e. Kubernetes, VMs...</p>
              </div>
              {this.state.clusterTypeManualEntry === true &&
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
              <div className="cluster-domain-name-input-field">
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
                  helperText="i.e. person-A"
                  id="clusterNameInputField"
                  invalidText="A valid value is required - refer to helper text below"
                  labelText="Cluster Managed By"
                  placeholder="Enter CLUSTER MANAGED BY"
                  onChange={this.onChangeClusterManagedBy}
                />
              </div>
              <div className="agents-multiselect">
                <MultiSelect.Filterable
                  titleText="Assign Agents To Cluster"
                  helperText="i.e. spiffe://example.org/agent/myagent1..."
                  placeholder={this.state.agentsListDisplay}
                  ariaLabel="selectors-multiselect"
                  id="selectors-multiselect"
                  items={this.props.agentsList}
                  label={this.state.agentsListDisplay}
                  onChange={this.onChangeAgentsList}
                />
              </div>
              <div className="selectors-textArea">
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
              <div className="form-group">
                <input type="submit" value="Create Cluster" className="btn btn-primary" />
              </div>
              <div>
                {this.state.statusOK === "OK" &&
                  <p className="success-message">--ENTRY SUCCESSFULLY CREATED--</p>
                }
                {(this.state.statusOK === "ERROR") &&
                  <p className="failed-message">--ENTRY CREATION FAILED--</p>
                }
              </div>
              <div className="alert-primary" role="alert">
                <pre>
                  {this.state.message}
                </pre>
              </div>
            </div>
          </form>
        </div>
      </div>
    )
  }
}


const mapStateToProps = (state) => ({
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
  { clusterTypeInfoFunc, serverSelectedFunc, selectorInfoFunc, agentsListUpdateFunc, tornjakMessageFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc }
)(ClusterCreate)
