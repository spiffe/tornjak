import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { Dropdown, TextInput, MultiSelect, Checkbox, TextArea, NumberInput } from 'carbon-components-react';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import TornjakApi from './tornjak-api-helpers';
import './style.css';
import SpiffeHelper from './spiffe-helper';
import {
  serverSelectedFunc,
  selectorInfoFunc,
  agentsListUpdateFunc,
  entriesListUpdateFunc,
  tornjakMessageFunc,
  tornjakServerInfoUpdateFunc,
  serverInfoUpdateFunc,
  agentworkloadSelectorInfoFunc
} from 'redux/actions';

class CreateEntry extends Component {
  constructor(props) {
    super(props);
    this.TornjakApi = new TornjakApi();
    this.SpiffeHelper = new SpiffeHelper();
    this.onChangeSelectors = this.onChangeSelectors.bind(this);
    this.onChangeSpiffeId = this.onChangeSpiffeId.bind(this);
    this.onChangeParentId = this.onChangeParentId.bind(this);
    this.onChangeManualParentId = this.onChangeManualParentId.bind(this);
    this.onChangeAdminFlag = this.onChangeAdminFlag.bind(this);
    this.prepareParentIdAgentsList = this.prepareParentIdAgentsList.bind(this);
    this.prepareSelectorsList = this.prepareSelectorsList.bind(this);
    this.onChangeSelectorsRecommended = this.onChangeSelectorsRecommended.bind(this);
    this.onChangeTtl = this.onChangeTtl.bind(this);
    this.onChangeExpiresAt = this.onChangeExpiresAt.bind(this);
    this.onChangeFederatesWith = this.onChangeFederatesWith.bind(this);
    this.onChangeDownStream = this.onChangeDownStream.bind(this);
    this.onChangeDnsNames = this.onChangeDnsNames.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      name: "",

      // spiffe_id
      spiffeId: "",
      spiffeIdTrustDomain: "",
      spiffeIdPath: "",

      // parent_id
      parentId: "",
      parentIdTrustDomain: "",
      parentIdPath: "",

      // ',' delimetered selectors
      selectors: "",
      selectorsRecommendationList: "",
      adminFlag: false,

      ttl: 0,
      expiresAt: 0,
      dnsNames: [],
      federatesWith: [],
      downstream: false,
      //token: "",
      message: "",
      statusOK: "",
      successJsonMessege: "",
      servers: [],
      selectedServer: "",
      agentsIdList: [],
      spiffeIdPrefix: "",
      parentIdManualEntryOption: "----Select this option and Enter Custom Parent ID Below----",
      parentIDManualEntry: false,
      selectorsList: [],
      selectorsListDisplay: "Select Selectors",
    }
  }

  componentDidMount() {
    if (IsManager) {
      if (this.props.globalServerSelected !== "" && (this.props.globalErrorMessage === "OK" || this.props.globalErrorMessage === "")) {
        this.TornjakApi.populateAgentsUpdate(this.props.globalServerSelected, this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc)
        this.TornjakApi.populateEntriesUpdate(this.props.globalServerSelected, this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc)
        this.TornjakApi.refreshSelectorsState(this.props.globalServerSelected, this.props.agentworkloadSelectorInfoFunc);
        this.setState({ selectedServer: this.props.globalServerSelected });
        this.prepareParentIdAgentsList();
        this.prepareSelectorsList();
      }
    } else {
      // agent doesnt need to do anything
      this.TornjakApi.populateLocalAgentsUpdate(this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
      this.TornjakApi.populateLocalEntriesUpdate(this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc)
      this.TornjakApi.populateLocalTornjakServerInfo(this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
      this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
      this.setState({})
    }
  }

  componentDidUpdate(prevProps, prevState) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.setState({ selectedServer: this.props.globalServerSelected });
      }
      if (prevProps.globalServerInfo !== this.props.globalServerInfo) {
        this.prepareParentIdAgentsList();
        this.prepareSelectorsList();
      }
      if (prevProps.globalAgentsList !== this.props.globalAgentsList) {
        this.prepareParentIdAgentsList();
      }
      if (prevState.parentId !== this.state.parentId) {
        this.prepareSelectorsList();
      }
    } else {
      if (prevProps.globalServerInfo !== this.props.globalServerInfo) {
        this.prepareParentIdAgentsList();
        this.prepareSelectorsList();
      }
      if (prevState.parentId !== this.state.parentId)  {
        this.prepareSelectorsList();
      }
    }
  }

  prepareParentIdAgentsList() {
    var idx = 0, prefix = "spiffe://";
    let localAgentsIdList = [];
    if (this.props.globalServerInfo.length === 0) {
      return
    }
    //user prefered option
    localAgentsIdList[0] = this.state.parentIdManualEntryOption;
    //default option
    localAgentsIdList[1] = prefix + this.props.globalServerInfo.data.trustDomain + "/spire/server";

    //agents
    let agentEntriesDict = this.SpiffeHelper.getAgentsEntries(this.props.globalAgentsList, this.props.globalEntriesList)
    idx = 2
    for (let i = 0; i < this.props.globalAgentsList.length; i++) {
      let agentSpiffeid = this.SpiffeHelper.getAgentSpiffeid(this.props.globalAgentsList[i]);
      localAgentsIdList[idx] = agentSpiffeid;
      idx++;
      
      // Add entries associated with this agent
      let agentEntries = agentEntriesDict[agentSpiffeid];
      if (agentEntries !== undefined) {
        for (let j=0; j < agentEntries.length; j++) {
            localAgentsIdList[idx] = this.SpiffeHelper.getEntrySpiffeid(agentEntries[j]);
            idx++;
        }
      }
    }

    this.setState({
      agentsIdList: localAgentsIdList
    });
  }

  prepareSelectorsList() {
    var prefix = "spiffe://", agentSelectorSet = false;
    var parentId = this.state.parentId;
    var defaultServer = prefix + this.props.globalServerInfo.data.trustDomain + "/spire/server";
    var globalAgentsWorkLoadAttestorInfo = this.props.globalAgentsWorkLoadAttestorInfo;
    if (parentId === defaultServer) {
      if (this.props.globalServerInfo.length === 0) { return }
      let serverNodeAtt = this.props.globalServerInfo.data.nodeAttestorPlugin;
      this.setState({
        selectorsList: this.props.globalSelectorInfo[serverNodeAtt]
      });
    } else if (parentId !== "") {
      let agentId = parentId;
      // Check if parent ID is not canonical ID, best effort try to match it to an Agent ID for selectors
      if (!this.props.globalAgentsList.map(e => this.SpiffeHelper.getAgentSpiffeid(e)).includes(parentId)) {
          let fEntries= this.props.globalEntriesList.filter(e => this.SpiffeHelper.getEntrySpiffeid(e) === parentId);
          if (fEntries.length > 0) {
            let entry = fEntries[0];
            let canonicalAgentId = this.SpiffeHelper.getCanonicalAgentSpiffeid(entry, this.props.globalAgentsList)
            if (canonicalAgentId !== "") {
              agentId = canonicalAgentId;
            }
          }
      }

      for (let i = 0; i < globalAgentsWorkLoadAttestorInfo.length; i++) {
        if (agentId === globalAgentsWorkLoadAttestorInfo[i].spiffeid) {
          this.setState({
            selectorsList: this.props.globalWorkloadSelectorInfo[globalAgentsWorkLoadAttestorInfo[i].plugin]
          });
          agentSelectorSet = true;
        }
      }
      if (!agentSelectorSet) {
        this.setState({
          selectorsList: [],
          selectorsListDisplay: "Select Selectors",
        });
      }
    }
  }

  onChangeTtl(e) {
    this.setState({
      ttl: Number(e.imaginaryTarget.value)
    });
  }

  onChangeExpiresAt(e) {
    this.setState({
      expiresAt: Number(e.imaginaryTarget.value)
    });
  }

  onChangeDownStream = selected => {
    var sid = selected;
    this.setState({
      downstream: sid,
    });
  }

  onChangeDnsNames(e) {
    var sid = e.target.value;
    this.setState({
      dnsNames: sid,
    });
  }

  onChangeFederatesWith(e) {
    var sid = e.target.value;
    this.setState({
      federatesWith: sid,
    });
  }

  onChangeSelectorsRecommended = selected => {
    var sid = selected.selectedItems, selectors = "", selectorsDisplay = "";
    for (let i = 0; i < sid.length; i++) {
      if (i !== sid.length - 1) {
        selectors = selectors + sid[i].label + ":\n";
        selectorsDisplay = selectorsDisplay + sid[i].label + ",";
      }
      else {
        selectors = selectors + sid[i].label + ":"
        selectorsDisplay = selectorsDisplay + sid[i].label
      }
    }
    if (selectorsDisplay.length === 0)
      selectorsDisplay = "Select Selectors"
    this.setState({
      selectorsRecommendationList: selectors,
      selectorsListDisplay: selectorsDisplay,
    });
  }

  onChangeSelectors(e) {
    var sid = e.target.value, selectors = "";
    selectors = sid.replace(/\n/g, ",");
    this.setState({
      selectors: selectors,
    });
  }

  onChangeAdminFlag = selected => {
    var sid = selected;
    this.setState({
      adminFlag: sid,
    });
  }

  parseSpiffeId(sid) {
    if (sid.startsWith('spiffe://')) {
      var sub = sid.substr("spiffe://".length)
      var sp = sub.indexOf("/")
      if (sp > 0 && sp !== sub.length - 1) {
        var trustDomain = sub.substr(0, sp);
        var path = sub.substr(sp);
        return [true, trustDomain, path];
      }
    }
    return [false, "", ""];
  }

  onChangeSpiffeId(e) {
    var sid = e.target.value;
    if (sid.length === 0) {
      this.setState({
        spiffeId: sid,
        spiffeIdTrustDomain: "",
        spiffeIdPath: "",
        message: "",
      });
      return
    }

    const [validSpiffeId, trustDomain, path] = this.parseSpiffeId(sid)
    if (validSpiffeId) {
      this.setState({
        message: "",
        spiffeId: sid,
        spiffeIdTrustDomain: trustDomain,
        spiffeIdPath: path,
      });
      return
    }
    // else invalid spiffe ID
    this.setState({
      spiffeId: sid,
      message: "Invalid Spiffe ID",
      spiffeIdTrustDomain: "",
      spiffeIdPath: "",
    });
    return
  }

  onChangeParentId = selected => {
    var prefix = "spiffe://", sid = selected.selectedItem;
    if (sid.length === 0) {
      this.setState({
        parentId: sid,
        parentIdTrustDomain: "",
        parentIdPath: "",
        message: "",
      });
      return
    }
    if (sid === this.state.parentIdManualEntryOption) {
      this.setState({
        parentIDManualEntry: true,
        spiffeIdPrefix: "",
        parentId: sid,
      });
      return
    }
    this.setState({
      parentIDManualEntry: false
    });
    const [validSpiffeId, trustDomain, path] = this.parseSpiffeId(sid)
    var spiffeIdPrefix = prefix + trustDomain + "/";
    if (validSpiffeId) {
      this.setState({
        message: "",
        parentId: sid,
        parentIdTrustDomain: trustDomain,
        parentIdPath: path,
        spiffeIdPrefix: spiffeIdPrefix,
      });
      return
    }
    // else invalid spiffe ID
    this.setState({
      parentId: sid,
      message: "Invalid Parent ID",
      parentIdTrustDomain: "",
      parentIdPath: "",
    });
    return
  }

  onChangeManualParentId(e) {
    var prefix = "spiffe://", sid = e.target.value;
    if (sid.length === 0) {
      this.setState({
        parentId: sid,
        parentIdTrustDomain: "",
        parentIdPath: "",
        message: "",
      });
      return
    }
    const [validSpiffeId, trustDomain, path] = this.parseSpiffeId(sid)
    var spiffeIdPrefix = prefix + trustDomain + "/";
    if (validSpiffeId) {
      this.setState({
        message: "",
        parentId: sid,
        parentIdTrustDomain: trustDomain,
        parentIdPath: path,
        spiffeIdPrefix: spiffeIdPrefix,
      });
      return
    }
    // else invalid spiffe ID
    this.setState({
      parentId: sid,
      message: "Invalid Parent ID",
      parentIdTrustDomain: "",
      parentIdPath: "",
    });
    return
  }

  // Tag related things

  handleTagDelete(i) {
    const { tags } = this.state;
    this.setState({
      tags: tags.filter((tag, index) => index !== i),
    });
  }

  handleTagAddition(tag) {
    this.setState(state => ({ tags: [...state.tags, tag] }));
  }

  handleTagDrag(tag, currPos, newPos) {
    const tags = [...this.state.tags];
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    this.setState({ tags: newTags });
  }

  getApiEntryCreateEndpoint() {
    if (!IsManager) {
      return GetApiServerUri('/api/entry/create')
    } else if (IsManager && this.state.selectedServer !== "") {
      return GetApiServerUri('/manager-api/entry/create') + "/" + this.state.selectedServer
    } else {
      this.setState({ message: "Error: No server selected" })
      return ""
    }
  }

  onSubmit(e) {
    let selectorStrings = [], federatedWithList = [], dnsNamesWithList = [];
    e.preventDefault();

    const validSpiffeId = (this.parseSpiffeId(this.state.spiffeId))[0];
    if (!validSpiffeId) {
      this.setState({ message: "ERROR: invalid spiffe ID specified" });
      return
    }

    const validParentId = (this.parseSpiffeId(this.state.parentId))[0];
    if (!validParentId) {
      this.setState({ message: "ERROR: invalid parent ID specified" });
      return
    }

    if (this.state.selectors.length !== 0) {
      selectorStrings = this.state.selectors.split(',').map(x => x.trim())
    }
    if (selectorStrings.length === 0) {
      this.setState({ message: "ERROR: Selectors cannot be empty" })
      return
    }
    const selectorEntries = selectorStrings.map(x => x.indexOf(":") > 0 ?
      {
        "type": x.substr(0, x.indexOf(":")),
        "value": x.substr(x.indexOf(":") + 1)
      } : null)

    if (selectorEntries.some(x => x == null || x["value"].length === 0)) {
      this.setState({ message: "ERROR: Selectors not in the correct format should be type:value" })
      return
    }

    if (this.state.federatesWith.length !== 0) {
      federatedWithList = this.state.federatesWith.split(',').map(x => x.trim())
    }
    if (this.state.dnsNames.length !== 0) {
      dnsNamesWithList = this.state.dnsNames.split(',').map(x => x.trim())
    }

    var cjtData = {
      "entries": [{
        "spiffe_id": {
          "trust_domain": this.state.spiffeIdTrustDomain,
          "path": this.state.spiffeIdPath,
        },
        "parent_id": {
          "trust_domain": this.state.parentIdTrustDomain,
          "path": this.state.parentIdPath,
        },
        "selectors": selectorEntries,
        "admin": this.state.adminFlag,
        "ttl": this.state.ttl,
        "expires_at": this.state.expiresAt,
        "downstream": this.state.downstream,
        "federates_with": federatedWithList,
        "dns_names": dnsNamesWithList,
      }]
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
          successJsonMessege: res.data.results[0].status.message
        })
      )
      .catch(
        err => this.setState({ 
          message: "ERROR:" + err,
          statusOK: "ERROR"
         })
      )
  }

  render() {
    const ParentIdList = this.state.agentsIdList;
    return (
      <div>
        <div className="create-entry-title">
          <h3>Create New Entry</h3>
        </div>
        <form onSubmit={this.onSubmit}>
          <br /><br />
          <div className="entry-form">
            <div className="parentId-drop-down">
              <Dropdown
                aria-required="true"
                ariaLabel="parentId-drop-down"
                id="parentId-drop-down"
                items={ParentIdList}
                label="Select Parent ID"
                titleText="Parent ID [*required]"
                //value={this.state.parentId}
                onChange={this.onChangeParentId}
              />
              <p className="parentId-helper">i.e. spiffe://example.org/agent/myagent1 - For node entries, select spiffe server as parent i.e. spiffe://example.org/spire/server</p>
            </div>
            {this.state.parentIDManualEntry === true &&
              <div className="parentId-manual-input-field">
                <TextInput
                  aria-required="true"
                  helperText="i.e. spiffe://example.org/agent/myagent1 - For node entries, specify spiffe server as parent i.e. spiffe://example.org/spire/server"
                  id="parentIdManualInputField"
                  invalidText="A valid value is required - refer to helper text below"
                  labelText="Parent ID - Manual Entry [*required]"
                  placeholder="Enter Parent ID"
                  //value={this.state.spiffeId}
                  //defaultValue={this.state.spiffeIdPrefix}
                  onChange={(e) => {
                    this.onChangeManualParentId(e);
                  }}
                />
              </div>}
            <div className="spiffeId-input-field">
              <TextInput
                aria-required="true"
                helperText="i.e. spiffe://example.org/sample/spiffe/id"
                id="spiffeIdInputField"
                invalidText="A valid value is required - refer to helper text below"
                labelText="SPIFFE ID [*required]"
                placeholder="Enter SPIFFE ID"
                //value={this.state.spiffeId}
                defaultValue={this.state.spiffeIdPrefix}
                onChange={(e) => {
                  const input = e.target.value
                  e.target.value = this.state.spiffeIdPrefix + input.substr(this.state.spiffeIdPrefix.length);
                  this.onChangeSpiffeId(e);
                }}
              //onChange={this.onChangeSpiffeId}
              required/>
            </div>
            <div className="selectors-multiselect">
              <MultiSelect.Filterable
                aria-required="true"
                required
                titleText="Selectors Recommendation [*required]"
                helperText="i.e. k8s_sat:cluster,..."
                placeholder={this.state.selectorsListDisplay}
                ariaLabel="selectors-multiselect"
                id="selectors-multiselect"
                items={this.state.selectorsList}
                label={this.state.selectorsListDisplay}
                onChange={this.onChangeSelectorsRecommended}
              />
            </div>
            <div className="selectors-textArea">
              <TextArea
                cols={50}
                helperText="i.e. k8s_sat:cluster:demo-cluster,..."
                id="selectors-textArea"
                invalidText="A valid value is required"
                labelText="Selectors"
                placeholder="Enter Selectors - Refer to Selectors Recommendation"
                defaultValue={this.state.selectorsRecommendationList}
                rows={8}
                onChange={this.onChangeSelectors}
              />
            </div>
            <div className="advanced">
              <fieldset className="bx--fieldset">
                <legend className="bx--label">Advanced</legend>
                <div className="ttl-input">
                  <NumberInput
                    helperText="Ttl for identities issued for this entry (In seconds)"
                    id="ttl-input"
                    invalidText="Number is not valid"
                    label="Time to Leave (Ttl)"
                    //max={100}
                    min={0}
                    step={1}
                    value={0}
                    onChange={this.onChangeTtl}
                  />
                </div>
                <div className="expiresAt-input">
                  <NumberInput
                    helperText="Entry expires at (seconds since Unix epoch)"
                    id="expiresAt-input"
                    invalidText="Number is not valid"
                    label="Expires At"
                    //max={100}
                    min={0}
                    step={1}
                    value={0}
                    onChange={this.onChangeExpiresAt}
                  />
                </div>
                <div className="federates-with-input-field">
                  <TextInput
                    helperText="i.e. example.org,abc.com (Separated By Commas)"
                    id="federates-with-input-field"
                    invalidText="A valid value is required - refer to helper text below"
                    labelText="Federates With"
                    placeholder="Enter Names of trust domains the identity described by this entry federates with"
                    onChange={this.onChangeFederatesWith}
                  />
                </div>
                <div className="dnsnames-input-field">
                  <TextInput
                    helperText="i.e. example.org,abc.com (Separated By Commas)"
                    id="dnsnames-input-field"
                    invalidText="A valid value is required - refer to helper text below"
                    labelText="DNS Names"
                    placeholder="Enter DNS Names associated with the identity described by this entry"
                    onChange={this.onChangeDnsNames}
                  />
                </div>
                <div className="admin-flag-checkbox">
                  <Checkbox
                    labelText="Admin Flag"
                    id="admin-flag"
                    onChange={this.onChangeAdminFlag}
                  />
                </div>
                <div className="down-stream-checkbox">
                  <Checkbox
                    labelText="Down Stream"
                    id="down-steam"
                    onChange={this.onChangeDownStream}
                  />
                </div>
              </fieldset>
            </div>
            <div className="form-group">
              <input type="submit" value="Create Entry" className="btn btn-primary" />
            </div>
            <div role="alert">
              {this.state.statusOK==="OK" && this.state.successJsonMessege==="OK" &&
                <p className="success-message">--ENTRY SUCCESSFULLY CREATED--</p>
              }
              {(this.state.statusOK==="ERROR" || (this.state.successJsonMessege !== "OK" && this.state.successJsonMessege !== "")) &&
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
    )
  }
}


const mapStateToProps = (state) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalSelectorInfo: state.servers.globalSelectorInfo,
  globalAgentsList: state.agents.globalAgentsList,
  globalEntriesList: state.entries.globalEntriesList,
  globalServerInfo: state.servers.globalServerInfo,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessage: state.tornjak.globalErrorMessage,
  globalWorkloadSelectorInfo: state.servers.globalWorkloadSelectorInfo,
  globalAgentsWorkLoadAttestorInfo: state.agents.globalAgentsWorkLoadAttestorInfo,
})

export default connect(
  mapStateToProps,
  { serverSelectedFunc, agentworkloadSelectorInfoFunc, selectorInfoFunc, agentsListUpdateFunc, entriesListUpdateFunc, tornjakMessageFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc }
)(CreateEntry)
