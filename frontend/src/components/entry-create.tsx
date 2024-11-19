import { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { 
  Dropdown, 
  TextInput, 
  FilterableMultiSelect, 
  Checkbox, 
  TextArea, 
  NumberInput, 
  Accordion, 
  AccordionItem, 
  ToastNotification 
} from 'carbon-components-react';
import {
  Button,
} from '@mui/material';
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
  agentworkloadSelectorInfoFunc,
  newEntriesUpdateFunc,
} from 'redux/actions';
import {
  EntriesList,
  AgentsList,
  AgentsWorkLoadAttestorInfo,
  ServerInfo,
  TornjakServerInfo,
  SelectorLabels,
  SelectorInfoLabels,
  WorkloadSelectorInfoLabels,
  DebugServerInfo
} from './types';
import { RootState } from 'redux/reducers';
import EntryExpiryFeatures from './entry-expiry-features';
import CreateEntryJson from './entry-create-json';
import { ToastContainer } from "react-toastify"
import { showResponseToast, showToast } from './error-api';
import apiEndpoints from './apiConfig';
// import PropTypes from "prop-types"; // needed for testing will be removed on last pr

type CreateEntryProp = {
  // tornjak server debug info of the selected server
  globalDebugServerInfo: DebugServerInfo,
  // entry expiry time
  globalEntryExpiryTime: number,
  // dispatches a payload for the server selected and has a return type of void
  serverSelectedFunc: (globalServerSelected: string) => void,
  // dispatches a payload for list of agents with their metadata info as an array of AgentListType and has a return type of void
  agentsListUpdateFunc: (globalAgentsList: AgentsList[]) => void,
  // dispatches a payload for the tornjak server info of the selected server and has a return type of void
  tornjakServerInfoUpdateFunc: (globalTornjakServerInfo: TornjakServerInfo) => void,
  // dispatches a payload for the server trust domain and nodeAttestorPlugin as a ServerInfoType and has a return type of void
  serverInfoUpdateFunc: (globalServerInfo: ServerInfo) => void,
  // dispatches a payload for list of entries with their metadata info as an array of EntriesListType and has a return type of void
  entriesListUpdateFunc: (globalEntriesList: EntriesList[]) => void,
  // dispatches a payload for list of new entries uploaded with their metadata info as an array of EntriesListType and has a return type of void
  newEntriesUpdateFunc: (globalNewEntries: EntriesList[]) => void,
  // dispatches a payload for list of available selectors and their options as an object and has a return type of void
  selectorInfoFunc: (globalSelectorInfo: SelectorInfoLabels) => void,
  // dispatches a payload for the tornjak error messsege and has a return type of void
  tornjakMessageFunc: (globalErrorMessage: string) => void,
  // dispatches a payload for the workload selector info for the agents as an array of AgentsWorkLoadAttestorInfoType and has a return type of void
  agentworkloadSelectorInfoFunc: (globalAgentsWorkLoadAttestorInfo: AgentsWorkLoadAttestorInfo[]) => void,
  // the selected server for manager mode 
  globalServerSelected: string,
  // tornjak error messege
  globalErrorMessage: string,
  // tornjak server info of the selected server
  globalTornjakServerInfo: TornjakServerInfo,
  // list of available selectors and their options
  globalSelectorInfo: SelectorInfoLabels,
  // list of available agents as array of AgentsListType
  globalAgentsList: AgentsList[],
  // list of available entries as array of EntriesListType
  globalEntriesList: EntriesList[],
  // list of new entries to be created as array of EntriesListType
  globalNewEntries: EntriesList[],
  // list of available workload selectors and their options
  globalWorkloadSelectorInfo: WorkloadSelectorInfoLabels,
  // the workload selector info for the agents as an array of AgentsWorkLoadAttestorInfoType
  globalAgentsWorkLoadAttestorInfo: AgentsWorkLoadAttestorInfo[],
  // the server trust domain and nodeAttestorPlugin as a ServerInfoType
  globalServerInfo: ServerInfo,
}

type CreateEntryState = {
  name: string,
  spiffeId: string,
  spiffeIdTrustDomain: string,
  spiffeIdPath: string,
  parentId: string,
  parentIdTrustDomain: string,
  parentIdPath: string,
  selectors: string,
  selectorsRecommendationList: string,
  adminFlag: boolean,
  jwt_svid_ttl: number,
  x509_svid_ttl: number,
  expiresAt: number,
  dnsNames: string,
  federatesWith: string,
  downstream: boolean,
  message: string,
  statusOK: string,
  successNumEntries: { "success": number, "fail": number },
  successJsonMessege: string,
  selectedServer: string,
  agentsIdList: string[],
  agentsIdList_noManualOption: string[],
  spiffeIdPrefix: string,
  parentIdManualEntryOption: string,
  parentIDManualEntry: boolean,
  selectorsList: SelectorLabels[],
  selectorsListDisplay: string,
}

class CreateEntry extends Component<CreateEntryProp, CreateEntryState> {
  TornjakApi: TornjakApi;
  SpiffeHelper: SpiffeHelper;
  constructor(props: CreateEntryProp) {
    super(props);
    this.TornjakApi = new TornjakApi(props);
    this.SpiffeHelper = new SpiffeHelper(props);
    this.onChangeSelectors = this.onChangeSelectors.bind(this);
    this.onChangeSpiffeId = this.onChangeSpiffeId.bind(this);
    this.onChangeParentId = this.onChangeParentId.bind(this);
    this.onChangeManualParentId = this.onChangeManualParentId.bind(this);
    this.onChangeAdminFlag = this.onChangeAdminFlag.bind(this);
    this.prepareParentIdAgentsList = this.prepareParentIdAgentsList.bind(this);
    this.prepareSelectorsList = this.prepareSelectorsList.bind(this);
    this.onChangeSelectorsRecommended = this.onChangeSelectorsRecommended.bind(this);
    this.onChangeJwtTtl = this.onChangeJwtTtl.bind(this);
    this.onChangex509Ttl = this.onChangex509Ttl.bind(this);
    this.onChangeExpiresAt = this.onChangeExpiresAt.bind(this);
    this.onChangeFederatesWith = this.onChangeFederatesWith.bind(this);
    this.onChangeDownStream = this.onChangeDownStream.bind(this);
    this.onChangeDnsNames = this.onChangeDnsNames.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.onYAMLEntryCreate = this.onYAMLEntryCreate.bind(this);

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
      x509_svid_ttl: 0,
      jwt_svid_ttl: 0,
      expiresAt: 0,
      dnsNames: "",
      federatesWith: "",
      downstream: false,
      //token: "",
      message: "",
      statusOK: "",
      successNumEntries: { "success": 0, "fail": 0 },
      successJsonMessege: "",
      selectedServer: "",
      agentsIdList: [],
      agentsIdList_noManualOption: [],
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
      }
    } else {
      // agent doesnt need to do anything
      this.TornjakApi.populateLocalAgentsUpdate(this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
      this.TornjakApi.populateLocalEntriesUpdate(this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc)
      this.TornjakApi.populateLocalTornjakServerInfo(this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
      this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
      this.props.newEntriesUpdateFunc([]);
      this.setState({})
    }
  }

  componentDidUpdate(prevProps: CreateEntryProp, prevState: CreateEntryState) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.setState({ selectedServer: this.props.globalServerSelected });
      }

      if (prevProps.globalDebugServerInfo !== this.props.globalDebugServerInfo) {
        if (this.props.globalAgentsList !== undefined && this.props.globalEntriesList !== undefined) {
          this.prepareParentIdAgentsList();
        }
        this.prepareSelectorsList();
      }

      if (prevProps.globalAgentsList !== this.props.globalAgentsList || prevProps.globalEntriesList !== this.props.globalEntriesList) {
        if (this.props.globalAgentsList !== undefined && this.props.globalEntriesList !== undefined) {
          this.prepareParentIdAgentsList();
        }
        this.prepareSelectorsList();
      }

      if (prevState.parentId !== this.state.parentId) {
        this.prepareSelectorsList();
      }
    } else {
      if (prevProps.globalDebugServerInfo !== this.props.globalDebugServerInfo) {
        if (this.props.globalAgentsList !== undefined && this.props.globalEntriesList !== undefined) {
          this.prepareParentIdAgentsList();
        }
        this.prepareSelectorsList();
      }

      if (prevProps.globalAgentsList !== this.props.globalAgentsList || prevProps.globalEntriesList !== this.props.globalEntriesList) {
        if (this.props.globalAgentsList !== undefined && this.props.globalEntriesList !== undefined) {
          this.prepareParentIdAgentsList();
        }
        this.prepareSelectorsList();
      }

      if (prevState.parentId !== this.state.parentId) {
        this.prepareSelectorsList();
      }
    }
  }

  prepareParentIdAgentsList(): void {
    var idx = 0, prefix = "spiffe://";
    let localAgentsIdList: string[] = [], localAgentsIdList_noManualOption: string[] = [];
    if (Object.keys(this.props.globalDebugServerInfo).length === 0) { return }
    //user prefered option
    localAgentsIdList[0] = this.state.parentIdManualEntryOption;
    //default option
    localAgentsIdList[1] = prefix + this.props.globalServerInfo.trustDomain + "/spire/server";

    //agents
    let agentEntriesDict: { [key: string]: EntriesList[]; } | undefined = this.SpiffeHelper.getAgentsEntries(this.props.globalAgentsList, this.props.globalEntriesList)
    //let agentEntriesDict: {[key: string]: []} | undefined = this.SpiffeHelper.getAgentsEntries(this.props.globalAgentsList, this.props.globalEntriesList)
    idx = 2
    if (this.props.globalAgentsList === undefined) {
      return
    }
    for (let i = 0; i < this.props.globalAgentsList.length; i++) {
      let agentSpiffeid: string = this.SpiffeHelper.getAgentSpiffeid(this.props.globalAgentsList[i]);
      localAgentsIdList[idx] = agentSpiffeid;
      idx++;

      // Add entries associated with this agent
      if (agentEntriesDict === undefined) {
        return
      }
      // note: array of objects for now - will be specifically typed when spiffehelper file is typed
      let agentEntries: EntriesList[] = agentEntriesDict[agentSpiffeid];
      if (agentEntries !== undefined) {
        for (let j = 0; j < agentEntries.length; j++) {
          localAgentsIdList[idx] = this.SpiffeHelper.getEntrySpiffeid(agentEntries[j]);
          idx++;
        }
      }
    }
    localAgentsIdList_noManualOption = [...localAgentsIdList];
    localAgentsIdList_noManualOption.shift();
    this.setState({
      agentsIdList: localAgentsIdList,
      agentsIdList_noManualOption: localAgentsIdList_noManualOption
    });
  }

  prepareSelectorsList(): void {
    if (this.props.globalDebugServerInfo === undefined || this.props.globalAgentsList === undefined || this.props.globalEntriesList === undefined) {
      return
    }
    var prefix = "spiffe://", agentSelectorSet = false;
    var parentId = this.state.parentId;
    if (this.props.globalDebugServerInfo !== undefined) {
      var defaultServer = prefix + this.props.globalDebugServerInfo.svid_chain[0].id.trust_domain + "/spire/server";
      var globalAgentsWorkLoadAttestorInfo = this.props.globalAgentsWorkLoadAttestorInfo;
      if (parentId === defaultServer) {
        if (Object.keys(this.props.globalDebugServerInfo).length === 0) { return }
        let serverNodeAtt = this.props.globalServerInfo.nodeAttestorPlugin;
        if (serverNodeAtt === "aws_iid") {
          this.setState({
            selectorsList: this.props.globalSelectorInfo["aws_iid"]
          });
        }
        else if (serverNodeAtt === "gcp_iit") {
          this.setState({
            selectorsList: this.props.globalSelectorInfo["gcp_iit"]
          });
        }
        else if (serverNodeAtt === "k8s_sat") {
          this.setState({
            selectorsList: this.props.globalSelectorInfo["k8s_sat"]
          });
        }
        else if (serverNodeAtt === "k8s_psat") {
          this.setState({
            selectorsList: this.props.globalSelectorInfo["k8s_psat"]
          });
        }
      } else if (parentId !== "") {
        let agentId = parentId;
        // Check if parent ID is not canonical ID, best effort try to match it to an Agent ID for selectors
        if (!this.props.globalAgentsList.map(e => this.SpiffeHelper.getAgentSpiffeid(e)).includes(parentId)) {
          let fEntries = this.props.globalEntriesList.filter(e => this.SpiffeHelper.getEntrySpiffeid(e) === parentId);
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
            let assignedPlugin = globalAgentsWorkLoadAttestorInfo[i].plugin;
            if (assignedPlugin === "Docker") {
              this.setState({
                selectorsList: this.props.globalWorkloadSelectorInfo["Docker"]
              });
            } else if (assignedPlugin === "Kubernetes") {
              this.setState({
                selectorsList: this.props.globalWorkloadSelectorInfo["Kubernetes"]
              });
            } else if (assignedPlugin === "Unix") {
              this.setState({
                selectorsList: this.props.globalWorkloadSelectorInfo["Unix"]
              });
            }
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
  }

  // TODO(mamy-CS): e - any for now will be explicitly typed on currently open entry create PR
  onChangex509Ttl(e: any): void {
    this.setState({
      x509_svid_ttl: Number(e.target.value)
    });
  }

  onChangeJwtTtl(e: any): void {
    this.setState({
      jwt_svid_ttl: Number(e.target.value)
    });
  }

  // TODO(mamy-CS): e - any for now will be explicitly typed on currently open entry create PR
  onChangeExpiresAt(e: any): void {
    this.setState({
      expiresAt: Number(e.target.value)
    });
  }

  onChangeDownStream = (selected: boolean): void => {
    var sid = selected;
    this.setState({
      downstream: sid,
    });
  }

  onChangeDnsNames(e: { target: { value: string; }; } | undefined): void {
    if (e === undefined) {
      return;
    }
    var sid = e.target.value;
    this.setState({
      dnsNames: sid,
    });
  }

  onChangeFederatesWith(e: { target: { value: string; }; } | undefined): void {
    if (e === undefined) {
      return;
    }
    var sid = e.target.value;
    this.setState({
      federatesWith: sid,
    });
  }

  onChangeSelectorsRecommended = (selected: { selectedItems: SelectorLabels[]; } | undefined): void => {
    if (selected === undefined) return
    
    var sid = selected.selectedItems, selectors = "", selectorsDisplay = ""

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

    if (selectorsDisplay.length === 0) {
      selectorsDisplay = "Select Selectors"
    }

    this.setState({
      selectorsRecommendationList: selectors,
      selectorsListDisplay: selectorsDisplay,
    })
  }

  onChangeSelectors(e: { target: { value: string; }; }): void {
    var sid = e.target.value, selectors = "";
    selectors = sid.replace(/\n/g, ",");
    this.setState({selectors: selectors});
  }

  onChangeAdminFlag = (selected: boolean): void => {
    var sid = selected;
    this.setState({adminFlag: sid,});
  }

  parseSpiffeId(sid: string): [boolean, string, string] {
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

  onChangeSpiffeId(e: { target: { value: string; }; }): void {
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

  onChangeParentId = (selected: { selectedItem: string; }): void => {
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

  onChangeManualParentId(e: { target: { value: string; }; }): void {
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

  getApiEntryCreateEndpoint(): string {
    if (!IsManager) {
      return GetApiServerUri(apiEndpoints.spireEntriesApi)
    } 
    if (IsManager && this.state.selectedServer !== "") {
      return GetApiServerUri('/manager-api/entry/create') + "/" + this.state.selectedServer
    } 
    showToast({caption: "No server selected."})
    return ""
  }

  onSubmit(e: { preventDefault: () => void; }): void {
    let selectorStrings: string[] = []
    let federatedWithList: string[] = []
    let dnsNamesWithList: string[] = []
    
    e.preventDefault()

    if (!this.state.parentId) {
      showToast({caption: "The parent SPIFFE id cannot be empty."})
      return
    }

    if (!this.state.spiffeId) {
      showToast({caption: "The SPIFFE id cannot be empty."})
      return
    }

    if (!this.parseSpiffeId(this.state.parentId)[0]) {
      showToast({caption: "The parent SPIFFE id is invalid."})
      return
    }

    if (!this.parseSpiffeId(this.state.spiffeId)[0]) {
      showToast({caption: "The SPIFFE id is invalid."})
      return
    }

    if (this.state.selectors.length !== 0) {
      selectorStrings = this.state.selectors.split(',').map(x => x.trim())
    }

    if (selectorStrings.length === 0) {
      showToast({caption: "The selectors cannot be empty."})
      return
    }

    const selectorEntries = selectorStrings.map(x => x.indexOf(":") > 0 ?
      {
        "type": x.substr(0, x.indexOf(":")),
        "value": x.substr(x.indexOf(":") + 1)
      } : null)

    if (selectorEntries.some(x => x == null || x["value"].length === 0)) {
      showToast({caption: "The selectors must be formatted 'type:value'."})
      return
    }

    if (this.state.federatesWith.length !== 0) {
      federatedWithList = this.state.federatesWith.split(',').map((x: string) => x.trim())
    }

    if (this.state.dnsNames.length !== 0) {
      dnsNamesWithList = this.state.dnsNames.split(',').map((x: string) => x.trim())
    }

    var cjtData = {
      entries: [{
        spiffe_id: {
          trust_domain: this.state.spiffeIdTrustDomain,
          path: this.state.spiffeIdPath,
        },
        parent_id: {
          trust_domain: this.state.parentIdTrustDomain,
          path: this.state.parentIdPath,
        },
        selectors: selectorEntries,
        admin: this.state.adminFlag,
        x509_svid_ttl: this.state.x509_svid_ttl,
        jwt_svid_ttl: this.state.jwt_svid_ttl,
        expires_at: this.props.globalEntryExpiryTime,
        downstream: this.state.downstream,
        federates_with: federatedWithList,
        dns_names: dnsNamesWithList,
      }]
    }

    let endpoint = this.getApiEntryCreateEndpoint()
    
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
      .catch(err => showResponseToast(err, {caption: "Could not create entry."}))
  }

  onYAMLEntryCreate(): void {
    var entriesStatus: any[] = [], sucessEntriesCount = 0;
    if (this.props.globalNewEntries === undefined) {
      return
    }
    let endpoint = this.getApiEntryCreateEndpoint();
    if (endpoint === "") {
      return
    }
    var entries = { "entries": this.props.globalNewEntries };
    axios.post(endpoint, entries)
      .then(
        res => {
          console.log(res.data)
          for (var i = 0; i < res.data.results.length; i++) {
            entriesStatus[i] = res.data.results[i].status.message;
            if (res.data.results[i].status.message === "OK") {
              sucessEntriesCount++;
            }
          }
          console.log(entriesStatus)
          this.setState({
            message: "REQUEST:" + JSON.stringify(entries, null, ' ') + "\n\nRESPONSE:" + JSON.stringify(res.data, null, ' '),
            successNumEntries: { "success": sucessEntriesCount, "fail": entries.entries.length - sucessEntriesCount },
            statusOK: "Multiple",
          })
        }
      )
      .catch(err => showResponseToast(err, {caption: "Could not create entry from YAML."}))
  }

  render() {
    const ParentIdList = this.state.agentsIdList, ParentIdList_noManualOption = this.state.agentsIdList_noManualOption;;
    return (
      <div data-test="create-entry">
        <div className="create-entry-title" data-test="create-entry-title">
          <h3>Create New Entry/ Entries</h3>
        </div>
        <br /><br />
        {this.state.message !== "" &&
          <div>
            <ToastNotification 
              className="toast-entry-creation-notification"
              kind="info"
              iconDescription="close notification"
              subtitle={
                <span>
                  <br></br>
                  <div role="alert" data-test="success-message">
                    {this.state.statusOK === "Multiple" &&
                      <div>
                        <p className="success-message">{"-- " + this.state.successNumEntries.success + " ENTRY/ ENTRIES SUCCESSFULLY CREATED--"}</p>
                        {this.state.successNumEntries.fail !== 0 &&
                          <p className="failed-message">{"-- " + this.state.successNumEntries.fail + " ENTRY/ ENTRIES FAILED TO BE CREATED--"}</p>
                        }
                      </div>
                    }
                    {this.state.statusOK === "OK" && this.state.successJsonMessege === "OK" &&
                      <p className="success-message">--ENTRY SUCCESSFULLY CREATED--</p>
                    }
                    {(this.state.statusOK === "ERROR" || (this.state.successJsonMessege !== "OK" && this.state.successJsonMessege !== "")) &&
                      <p className="failed-message">--ALL ENTRIES CREATION FAILED--</p>
                    }
                  </div>
                  <br></br>
                  <div className="toast-messege" data-test="alert-primary">
                    <pre className="toast-messege-color">
                      {this.state.message}
                    </pre>
                  </div>
                </span>
              }
              timeout={0}
              title="Entry Creation Notification"
            />
            {window.scrollTo({top: 0, behavior: 'smooth'})}
          </div>
        }
        <Accordion className="accordion-entry-form">
          <AccordionItem
            title={<h5>Upload New Entry/ Entries</h5>} open>
            <div className="entry-form">
              <CreateEntryJson
                ParentIdList={ParentIdList_noManualOption} />
              <br></br>
              {this.props.globalNewEntries.length === 0 &&
                <div>
                  <Button
                    size="medium"
                    color="primary"
                    variant="contained"
                    disabled
                    >
                    Create Entries
                  </Button>
                  <p style={{ fontSize: 13}}>(Upload JSON File to Enable)</p>
                </div>
              }
              {this.props.globalNewEntries.length !== 0 &&
                <Button
                  size="medium"
                  color="primary"
                  variant="contained"
                  onClick={() => {
                    this.onYAMLEntryCreate();
                  }}>
                  Create Entries
                </Button>
              }
            </div>
          </AccordionItem>
          <AccordionItem
            title={
              <div>
                <h5 className="custom-entry-form-title">
                  Custom Entry Form
                </h5>
                <p>(click to expand)</p>
              </div>}>
            <form onSubmit={this.onSubmit} data-test="entry-create-form">
              <br /><br />
              <div className="entry-form">
                <div className="parentId-drop-down" data-test="parentId-drop-down">
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
                  <p className="parentId-helper">e.g. spiffe://example.org/agent/myagent1 - For node entries, select spiffe server as parent e.g. spiffe://example.org/spire/server</p>
                </div>
                {this.state.parentIDManualEntry === true &&
                  <div className="parentId-manual-input-field" data-test="parentId-manual-input-field">
                    <TextInput
                      aria-required="true"
                      helperText="e.g. spiffe://example.org/agent/myagent1 - For node entries, specify spiffe server as parent e.g. spiffe://example.org/spire/server"
                      id="parentIdManualInputField"
                      invalidText="A valid value is required - refer to helper text below"
                      labelText="Parent ID - Manual Entry [*required]"
                      placeholder="Enter Parent ID"
                      //value={this.state.spiffeId}
                      //defaultValue={this.state.spiffeIdPrefix}
                      onChange={(e: { target: { value: string; }; }) => {
                        this.onChangeManualParentId(e);
                      }}
                    />
                  </div>}
                <div className="spiffeId-input-field" data-test="spiffeId-input-field">
                  <TextInput
                    aria-required="true"
                    helperText="e.g. spiffe://example.org/sample/spiffe/id"
                    id="spiffeIdInputField"
                    invalidText="A valid value is required - refer to helper text below"
                    labelText="SPIFFE ID [*required]"
                    placeholder="Enter SPIFFE ID"
                    //value={this.state.spiffeId}
                    defaultValue={this.state.spiffeIdPrefix}
                    onChange={(e: { target: { value: string; }; }) => {
                      const input = e.target.value
                      e.target.value = this.state.spiffeIdPrefix + input.substr(this.state.spiffeIdPrefix.length);
                      this.onChangeSpiffeId(e);
                    }}
                    //onChange={this.onChangeSpiffeId}
                  />
                </div>
                <div className="selectors-multiselect" data-test="selectors-multiselect">
                  <FilterableMultiSelect
                    aria-required="true"
                    //required
                    titleText="Selectors Recommendation [*required]"
                    helperText="e.g. k8s_sat:cluster,..."
                    placeholder={this.state.selectorsListDisplay}
                    //ariaLabel="selectors-multiselect"
                    id="selectors-multiselect"
                    items={this.state.selectorsList}
                    label={this.state.selectorsListDisplay}
                    onChange={this.onChangeSelectorsRecommended}
                  />
                </div>
                <div className="selectors-textArea" data-test="selectors-textArea">
                  <TextArea
                    cols={50}
                    helperText="e.g. k8s_sat:cluster:demo-cluster,..."
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
                      <div className="ttl-input" data-test="ttl-input">
                        <NumberInput
                            helperText="x509 SVID Ttl for identities issued for this entry (In seconds) Overrides JWT TTL if set"
                            id="ttl-input"
                            invalidText="Number is not valid"
                            label="x509 Time to Leave (Ttl)"
                            //max={100}
                            min={0}
                            step={1}
                            value={this.state.x509_svid_ttl}
                            onChange={this.onChangex509Ttl}
                        />
                      </div>
                      <div className="ttl-input" data-test="ttl-input">
                        <NumberInput
                            helperText="JWT SVID ttl for identities issued for this entry (In seconds) "
                            id="ttl-input"
                            invalidText="Number is not valid"
                            label="JWT Time to Leave (Ttl)"
                            //max={100}
                            min={0}
                            step={1}
                            value={this.state.jwt_svid_ttl}
                            onChange={this.onChangeJwtTtl}
                        />
                      </div>
                    <div className="expiresAt-input" data-test="expiresAt-input">
                      <EntryExpiryFeatures />
                    </div>
                    <div className="federates-with-input-field" data-test="federates-with-input-field">
                      <TextInput
                        helperText="e.g. example.org,abc.com (Separated By Commas)"
                        id="federates-with-input-field"
                        invalidText="A valid value is required - refer to helper text below"
                        labelText="Federates With"
                        placeholder="Enter Names of trust domains the identity described by this entry federates with"
                        onChange={this.onChangeFederatesWith}
                      />
                    </div>
                    <div className="dnsnames-input-field" data-test="dnsnames-input-field">
                      <TextInput
                        helperText="e.g. example.org,abc.com (Separated By Commas)"
                        id="dnsnames-input-field"
                        invalidText="A valid value is required - refer to helper text below"
                        labelText="DNS Names"
                        placeholder="Enter DNS Names associated with the identity described by this entry"
                        onChange={this.onChangeDnsNames}
                      />
                    </div>
                    <div className="admin-flag-checkbox" data-test="admin-flag-checkbox">
                      <Checkbox
                        labelText="Admin Flag"
                        id="admin-flag"
                        onChange={this.onChangeAdminFlag}
                      />
                    </div>
                    <div className="down-stream-checkbox" data-test="down-stream-checkbox">
                      <Checkbox
                        labelText="Down Stream"
                        id="down-steam"
                        onChange={this.onChangeDownStream}
                      />
                    </div>
                  </fieldset>
                </div>
                <div className="form-group">
                  <input type="submit" value="CREATE ENTRY" className="btn btn-primary" />
                </div>
              </div>
            </form>
          </AccordionItem>
        </Accordion>
        <ToastContainer
          className="carbon-toast"
          containerId="notifications"
          draggable={false}
        />
      </div>
    )
  }
}


const mapStateToProps = (state: RootState) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalSelectorInfo: state.servers.globalSelectorInfo,
  globalAgentsList: state.agents.globalAgentsList,
  globalEntriesList: state.entries.globalEntriesList,
  globalEntryExpiryTime: state.entries.globalEntryExpiryTime,
  globalNewEntries: state.entries.globalNewEntries,
  globalServerInfo: state.servers.globalServerInfo,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessage: state.tornjak.globalErrorMessage,
  globalWorkloadSelectorInfo: state.servers.globalWorkloadSelectorInfo,
  globalAgentsWorkLoadAttestorInfo: state.agents.globalAgentsWorkLoadAttestorInfo,
  globalDebugServerInfo: state.servers.globalDebugServerInfo,
})

// Note: Needed for UI testing - will be removed after
// CreateEntry.propTypes = {
//   globalServerSelected: PropTypes.string,
//   globalSelectorInfo: PropTypes.array,
//   globalAgentsList: PropTypes.array,
//   globalEntriesList: PropTypes.array,
//   globalServerInfo: PropTypes.object,
//   globalTornjakServerInfo: PropTypes.object,
//   globalErrorMessage: PropTypes.string,
//   globalWorkloadSelectorInfo: PropTypes.object,
//   globalAgentsWorkLoadAttestorInfo: PropTypes.array,
//   serverSelectedFunc: PropTypes.func,
//   agentsListUpdateFunc: PropTypes.func,
//   tornjakServerInfoUpdateFunc: PropTypes.func,
//   serverInfoUpdateFunc: PropTypes.func,
//   entriesListUpdateFunc: PropTypes.func,
//   selectorInfoFunc: PropTypes.func,
//   tornjakMessageFunc: PropTypes.func,
//   agentworkloadSelectorInfoFunc: PropTypes.func,
// };

export default connect(
  mapStateToProps,
  { serverSelectedFunc, agentworkloadSelectorInfoFunc, selectorInfoFunc, agentsListUpdateFunc, entriesListUpdateFunc, tornjakMessageFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc, newEntriesUpdateFunc }
)(CreateEntry)

export { CreateEntry }