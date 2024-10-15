import { Component } from 'react';
import axios from 'axios';
// eslint-disable-next-line
import AxiosRequestConfig from '../../axios'
import GetApiServerUri from './helpers';
import {
  AgentsList,
  AgentsWorkLoadAttestorInfo,
  TornjakServerInfo,
  ServerInfo,
  EntriesList,
  ClustersList,
  DebugServerInfo, FederationsList
} from './types';
import KeycloakService from "auth/KeycloakAuth";
import { showResponseToast } from './error-api';
// const Auth_Server_Uri = process.env.REACT_APP_AUTH_SERVER_URI;
// import { logError } from './helpers';
// import { displayResponseError } from './error-api';
import { env } from '../env';
import apiEndpoints from './apiConfig';
const Auth_Server_Uri = env.REACT_APP_AUTH_SERVER_URI;

type TornjakApiProp = {}
type TornjakApiState = {}

if (Auth_Server_Uri) { // inject token if app is in auth mode and check token status/ refresh as needed
  axios.interceptors.request.use(
    async (config: any): Promise<any> => {
      console.log("Checking token status...")
      if (KeycloakService.isLoggedIn()) {
        const setAuthorization = () => {
          config.headers.Authorization = `Bearer ${KeycloakService.getToken()}`;
          return Promise.resolve(config);
        };
        return KeycloakService.updateToken(setAuthorization);
      }
    }
  )
}

class TornjakApi extends Component<TornjakApiProp, TornjakApiState> {
  constructor(props: TornjakApiProp) {
    super(props);
    this.state = {};
    this.registerSelectors = this.registerSelectors.bind(this);
    this.registerLocalSelectors = this.registerLocalSelectors.bind(this);
    this.refreshSelectorsState = this.refreshSelectorsState.bind(this);
    this.refreshLocalSelectorsState = this.refreshLocalSelectorsState.bind(this);
    this.populateTornjakServerInfo = this.populateTornjakServerInfo.bind(this);
    this.populateLocalTornjakServerInfo = this.populateLocalTornjakServerInfo.bind(this);
    this.populateServerInfo = this.populateServerInfo.bind(this);
    this.populateAgentsUpdate = this.populateAgentsUpdate.bind(this);
    this.populateLocalAgentsUpdate = this.populateLocalAgentsUpdate.bind(this);
    this.populateClustersUpdate = this.populateClustersUpdate.bind(this);
    this.populateLocalClustersUpdate = this.populateLocalClustersUpdate.bind(this);
  }

  // spireHealthCheck returns the health of the SPIRE server
  spireHealthCheck = (
    spireHealthCheckFunc: { (globalSpireHealthCheck: boolean): void; },
    spireHealthCheckingFunc: { (globalSpireHealthChecking: boolean): void; },
  ) => {
    spireHealthCheckingFunc(false);
    axios.get(GetApiServerUri(apiEndpoints.spireHealthCheckApi), { crossdomain: true })
      .then(response => {
        console.log("SPIRE HEALTH:", response.data.status);
        if (response.data.status === 1) {
          spireHealthCheckFunc(true);
        } else (spireHealthCheckFunc(false))
        spireHealthCheckingFunc(true);
      })
      .catch((error) => {
        spireHealthCheckingFunc(true);
        spireHealthCheckFunc(false);
        //logError(error)
        showResponseToast(error, { caption: "Could not register SPIRE healthcheck." })
      })
  }

  // registerLocalSelectors registers the selected selectors in local mode
  registerLocalSelectors = (wLoadAttdata: { spiffeid: string; plugin: string; },
    refreshLocalSelectorsState: { (agentworkloadSelectorInfoFunc: (globalAgentsWorkLoadAttestorInfo: AgentsWorkLoadAttestorInfo[]) => void): void; },
    agentworkloadSelectorInfoFunc: (globalAgentsWorkLoadAttestorInfo: AgentsWorkLoadAttestorInfo[]) => void) => {
    axios.post(GetApiServerUri(apiEndpoints.tornjakSelectorsApi), wLoadAttdata)
      .then(res => refreshLocalSelectorsState(agentworkloadSelectorInfoFunc))
      .catch((error) => {
        showResponseToast(error, { caption: "Could not register local selectors." })
      })
  }

  // refreshLocalSelectorsState returns the list agent's with their workload plugin info for the local server
  // [
  //  "agent1workloadselectorinfo": [
  //      {
  //        "id": "agentid",
  //        "spiffeid": "agentspiffeeid",  
  //        "selectors": "agentworkloadselectors"
  //      }
  //    ],
  //    "agent2workloadselectorinfo": [
  //      {
  //        "id": "agentid",
  //        "spiffeid": "agentspiffeeid",  
  //        "selectors": "agentworkloadselectors"  
  //      }
  //    ]
  // ]
  refreshLocalSelectorsState = (agentworkloadSelectorInfoFunc: {
    (globalAgentsWorkLoadAttestorInfo: AgentsWorkLoadAttestorInfo[]): void;
  }) => {
    axios.get(GetApiServerUri(apiEndpoints.tornjakSelectorsApi), { crossdomain: true })
      .then(response => {
        console.log(response.data)
        agentworkloadSelectorInfoFunc(response.data["agents"])
      })
      .catch((error) => showResponseToast(error, { caption: "Could not refresh local selector states." }))
  }

  // populateLocalTornjakAgentInfo returns tornjak info of requested agents including cluster name and selector
  populateLocalTornjakAgentInfo = (
    agentworkloadSelectorInfoFunc: (globalAgentsWorkLoadAttestorInfo: AgentsWorkLoadAttestorInfo[]) => void,
    inputData: string // Assuming this input data is used as query parameters
  ) => {
    axios.get(GetApiServerUri(apiEndpoints.tornjakAgentsApi), {
      params: { input: inputData }, // Add inputData as query parameter
      crossdomain: true
    })
      .then(response => {
        agentworkloadSelectorInfoFunc(response.data["agents"]);
      })
      .catch((error) => showResponseToast(error, { caption: "Could not populate local tornjak agent info." }));
  }

  // populateLocalTornjakDebugServerInfo returns the debug server info of the server in local mode
  populateLocalTornjakDebugServerInfo = (
    spireDebugServerInfoUpdateFunc: { (globalDebugServerInfo: DebugServerInfo): void },
    tornjakMessageFunc: { (globalErrorMessage: string): void }
  ) => {
    axios.get(GetApiServerUri(apiEndpoints.spireServerInfoApi), { crossdomain: true })
      .then(response => {
        spireDebugServerInfoUpdateFunc(response.data)
        tornjakMessageFunc(response.statusText)
      })
      .catch((error) => {
        showResponseToast(error, { caption: "Could not populate tornjak debug info." })
      })
  }

  // populateLocalTornjakServerInfo returns the torjak server info of the server in local mode
  populateLocalTornjakServerInfo = (
    tornjakServerInfoUpdateFunc: { (globalTornjakServerInfo: TornjakServerInfo): void },
    tornjakMessageFunc: { (globalErrorMessage: string): void }
  ) => {
    axios.get(GetApiServerUri(apiEndpoints.tornjakServerInfoApi), { crossdomain: true })
      .then(response => {
        if (response.status === 200) {
          tornjakServerInfoUpdateFunc(response.data)
          tornjakMessageFunc(response.statusText)
        }
        else {
          tornjakMessageFunc(response.statusText)
        }
      })
      .catch((error) => {
        showResponseToast(error, { caption: "Could not populate local tornjak server info." })
        tornjakMessageFunc(error)
      })
  }

  // populateServerInfo returns the server trust domain and nodeAttestorPlugin
  populateServerInfo = (serverInfo: TornjakServerInfo | undefined,
    serverInfoUpdateFunc: { (globalServerInfo: ServerInfo): void; }) => {
    //node attestor plugin
    if (serverInfo === undefined || JSON.stringify(serverInfo) === '{}') {
      return
    }
    if (serverInfo.plugins === undefined) {
      return
    }
    if (serverInfo.plugins["NodeAttestor"].length === 0) {
      return
    }
    let nodeAtt = serverInfo.plugins["NodeAttestor"][0];
    let trustDomain = serverInfo.trustDomain;
    var reqInfo =
    {
      "trustDomain": trustDomain,
      "nodeAttestorPlugin": nodeAtt
    }
    serverInfoUpdateFunc(reqInfo);
  }

  // populateLocalEntriesUpdate - returns the list of entries with their info in Local mode for the server
  populateLocalEntriesUpdate = (entriesListUpdateFunc: { (globalEntriesList: EntriesList[]): void; },
    tornjakMessageFunc: { (globalErrorMessage: string): void; }) => {
    axios.get(GetApiServerUri(apiEndpoints.spireEntriesApi), { crossdomain: true })
      .then(response => {
        if (!response.data["entries"]) {
          entriesListUpdateFunc([])
        } else {
          entriesListUpdateFunc(response.data["entries"]);
        }
        tornjakMessageFunc(response.statusText);
      }).catch(error => {
        showResponseToast(error, { caption: "Could not populate local entries." })
        entriesListUpdateFunc([])
        tornjakMessageFunc(error.message)
      })
  }

  // populateLocalAgentsUpdate - returns the list of agents with their info in Local mode for the server
  populateLocalAgentsUpdate = (agentsListUpdateFunc: {
    (globalAgentsList: AgentsList[]): void;
  },
    tornjakMessageFunc: { (globalErrorMessage: string): void; }) => {
    axios.get(GetApiServerUri(apiEndpoints.spireAgentsApi), { crossdomain: true })
      .then(response => {
        if (!response.data["agents"]) {
          agentsListUpdateFunc([]);
        } else { agentsListUpdateFunc(response.data["agents"]); }
        tornjakMessageFunc(response.statusText);
      })
      .catch((error) => {
        showResponseToast(error, { caption: "Could not populate local agents." })
        agentsListUpdateFunc([]);
        tornjakMessageFunc("Error retrieving: " + error.message);
      })
  }

  // populateLocalFederationsUpdate - returns the list of federations with their info in Local mode for the server
  populateLocalFederationsUpdate = (federationsListUpdateFunc: {
    (globalFederationsList: FederationsList[]): void;
  },
    tornjakMessageFunc: { (globalErrorMessage: string): void; }) => {
    axios.get(GetApiServerUri(apiEndpoints.spireFederationsApi), { crossdomain: true })
      .then(response => {
        if (!response.data["federations"]) {
          federationsListUpdateFunc([]);
        } else { federationsListUpdateFunc(response.data["federations"]); }
        tornjakMessageFunc(response.statusText);
      })
      .catch((error) => {
        showResponseToast(error, { caption: "Could not populate local federations." })
        federationsListUpdateFunc([]);
        tornjakMessageFunc("Error retrieving: " + error.message);
      })
  }

  // populateLocalClustersUpdate - returns the list of clusters with their info in Local mode for the server
  populateLocalClustersUpdate = (
    clustersListUpdateFunc: { (globalClustersList: ClustersList[]): void },
    tornjakMessageFunc: { (globalErrorMessage: string): void }
  ) => {
    axios.get(GetApiServerUri(apiEndpoints.tornjakClustersApi), { crossdomain: true })
      .then(response => {
        clustersListUpdateFunc(response.data["clusters"])
        tornjakMessageFunc(response.statusText)
      })
      .catch((error) => {
        showResponseToast(error, { caption: "Could not populate local clusters." })
        clustersListUpdateFunc([])
        tornjakMessageFunc("Error retrieving: " + error.message)
      })
  }

  // localClusterDelete - returns success message after successful deletion of a cluster in Local mode for the server

  async localClusterDelete(
    inputData: { cluster: { name: string } },
    clustersListUpdateFunc: { (globalClustersList: ClustersList[]): void },
    globalClustersList: any[]
  ) {
    try {
      const response = await axios.delete(GetApiServerUri(apiEndpoints.tornjakClustersApi), {
        data: inputData,
        headers: {
          'Content-Type': 'application/json'
        },
        crossdomain: true,
      });
      clustersListUpdateFunc(globalClustersList.filter(el => el.name !== inputData.cluster.name));
      return response.data;
    } catch (error) {
      return error;
    }
  }

  // localEntryDelete - returns success message after successful deletion of a entry in Local mode for the server
  async localEntryDelete(
    inputData: { ids: string[] },
    entriesListUpdateFunc: { (globalEntriesList: EntriesList[]): void },
    globalEntriesList: EntriesList[]
  ) {
    try {
      const response = await axios.delete(GetApiServerUri(apiEndpoints.spireEntriesApi), {
        data: { ids: inputData.ids },
        headers: {
          'Content-Type': 'application/json'
        },
        crossdomain: true,
      });
      entriesListUpdateFunc(globalEntriesList.filter(el => !inputData.ids.includes(el.id)));
      return response.data;
    } catch (error) {
      return error;
    }
  }

  // manager apis

  // entryDelete - returns success message after successful deletion of a entry in manager mode
  async entryDelete(serverName: string, inputData: { ids: string[] }, entriesListUpdateFunc: { (globalEntriesList: EntriesList[]): void }, globalEntriesList: any[]) {
    const response = await axios.post(GetApiServerUri("/manager-api/tornjak/entry/delete/") + serverName, inputData,
      {
        crossdomain: true,
      })
      .then(function (response) {
        entriesListUpdateFunc(globalEntriesList.filter(el =>
          el.name !== inputData))
        return response.data;
      })
      .catch(function (error) {
        return error.message;
      })
    return response.data;
  }

  // clusterDelete - returns success message after successful deletion of a cluster in manager mode
  async clusterDelete(serverName: string, inputData: { cluster: { name: string; }; }, clustersListUpdateFunc: { (globalClustersList: ClustersList[]): void }, globalClustersList: any[]) {
    const response = await axios.post(GetApiServerUri("/manager-api/tornjak/clusters/delete/") + serverName, inputData,
      {
        crossdomain: true,
      })
      .then(function (response) {
        clustersListUpdateFunc(globalClustersList.filter(el =>
          el.name !== inputData))
        return response.data;
      })
      .catch(function (error) {
        return error.message;
      })
    return response.data;
  }

  // populateClustersUpdate returns the list of clusters with their info in manager mode for the selected server
  populateClustersUpdate = (serverName: string,
    clustersListUpdateFunc: { (globalClustersList: ClustersList[]): void; },
    tornjakMessageFunc: { (globalErrorMessage: string): void; }) => {
    axios.get(GetApiServerUri('/manager-api/tornjak/clusters/list/') + serverName, { crossdomain: true })
      .then(response => {
        clustersListUpdateFunc(response.data["clusters"]);
        tornjakMessageFunc(response.statusText);
      }).catch(error => {
        showResponseToast(error, { caption: "Could not populate clusters." })
        clustersListUpdateFunc([]);
        tornjakMessageFunc("Error retrieving " + serverName + " : " + error.message);
      });
  }

  // populateAgentsUpdate returns the list of agents with their info in manager mode for the selected server
  populateAgentsUpdate = (serverName: string,
    agentsListUpdateFunc: { (globalAgentsList: AgentsList[]): void; },
    tornjakMessageFunc: { (globalErrorMessage: string): void; }) => {
    axios.get(GetApiServerUri('/manager-api/agent/list/') + serverName, { crossdomain: true })
      .then(response => {
        if (!response.data["agents"]) {
          agentsListUpdateFunc([]);
        } else { agentsListUpdateFunc(response.data["agents"]); }
        tornjakMessageFunc(response.statusText);
      }).catch(error => {
        showResponseToast(error, { caption: "Could not populate agents." })
        agentsListUpdateFunc([]);
        tornjakMessageFunc("Error retrieving " + serverName + " : " + error.message);
      });
  }

  // populateEntriesUpdate - returns the list of entries with their info in manager mode for the server
  populateEntriesUpdate = (serverName: string,
    entriesListUpdateFunc: { (globalEntriesList: EntriesList[]): void; },
    tornjakMessageFunc: { (globalErrorMessage: string): void; }) => {
    axios.get(GetApiServerUri('/manager-api/entry/list/') + serverName, { crossdomain: true })
      .then(response => {
        if (!response.data["entries"]) {
          entriesListUpdateFunc([]);
        } else { entriesListUpdateFunc(response.data["entries"]); }
        tornjakMessageFunc(response.statusText);
      }).catch(error => {
        entriesListUpdateFunc([]);
        tornjakMessageFunc("Error retrieving " + serverName + " : " + error + (typeof (error.response) !== "undefined" ? ":" + error.response.data : ""));
        showResponseToast(error, { caption: "Could not populate entries." })
      })
  }

  // populateTornjakServerInfo returns the tornjak server info of the selected server in manager mode
  populateTornjakServerInfo = (
    serverName: string,
    tornjakServerInfoUpdateFunc: { (globalTornjakServerInfo: TornjakServerInfo): void },
    tornjakMessageFunc: { (globalErrorMessage: string): void }
  ) => {
    axios.get(GetApiServerUri('/manager-api/tornjak/serverinfo/') + serverName, { crossdomain: true })
      .then(response => {
        tornjakServerInfoUpdateFunc(response.data)
        tornjakMessageFunc(response.statusText)
      }).catch(error => {
        showResponseToast(error, { caption: "Could not populate tornjak server info." })
        tornjakServerInfoUpdateFunc({
          plugins: {
            DataStore: [],
            KeyManager: [],
            NodeAttestor: [],
            NodeResolver: [],
            Notifier: []
          },
          trustDomain: "",
          verboseConfig: ""
        });
      });
  }

  // populateTornjakAgentInfo returns tornjak info of requested agents including cluster name and selector
  populateTornjakAgentInfo = (serverName: string,
    agentworkloadSelectorInfoFunc: (globalAgentsWorkLoadAttestorInfo: AgentsWorkLoadAttestorInfo[]) => void,
    inputData: string) => {
    axios.post(GetApiServerUri("/manager-api/tornjak/agents/list/") + serverName, inputData,
      {
        crossdomain: true,
      })
      .then(response => {
        agentworkloadSelectorInfoFunc(response.data["agents"]);
      })
      .catch((error) => showResponseToast(error, { caption: "Could not populate tornjak agent info." }))
  }

  // refreshSelectorsState returns the list agent's with their workload plugin info for the selected server in manager mode
  // [
  //  "agent1workloadselectorinfo": [
  //      {
  //        "id": "agentid",
  //        "spiffeid": "agentspiffeeid",  
  //        "selectors": "agentworkloadselectors"
  //      }
  //    ],
  //    "agent2workloadselectorinfo": [
  //      {
  //        "id": "agentid",
  //        "spiffeid": "agentspiffeeid",  
  //        "selectors": "agentworkloadselectors"  
  //      }
  //    ]
  // ]
  refreshSelectorsState = (serverName: string,
    agentworkloadSelectorInfoFunc: {
      (globalAgentsWorkLoadAttestorInfo: AgentsWorkLoadAttestorInfo[]): void;
      (globalAgentsWorkLoadAttestorInfo: AgentsWorkLoadAttestorInfo[]): void;
    }) => {
    axios.get(GetApiServerUri("/manager-api/tornjak/selectors/list/") + serverName, { crossdomain: true })
      .then(response => {
        agentworkloadSelectorInfoFunc(response.data["agents"]);
      })
      .catch((error) => showResponseToast(error, { caption: "Could not refresh selector state." }))
  }

  // registerSelectors registers the selected selectors in manager mode
  registerSelectors = (serverName: string, wLoadAttdata: { spiffeid: string; plugin: string; },
    refreshSelectorsState: { (serverName: string, agentworkloadSelectorInfoFunc: (globalAgentsWorkLoadAttestorInfo: AgentsWorkLoadAttestorInfo[]) => void): void; },
    agentworkloadSelectorInfoFunc: (globalAgentsWorkLoadAttestorInfo: AgentsWorkLoadAttestorInfo[]) => void) => {
    axios.post(GetApiServerUri('/manager-api/tornjak/selectors/register/') + serverName, wLoadAttdata)
      .then(res => {
        refreshSelectorsState(serverName, agentworkloadSelectorInfoFunc);
      }
      )
      .catch((error) => {
        showResponseToast(error, { caption: "Could not register selectors." })
      })
  }
}

export default TornjakApi;