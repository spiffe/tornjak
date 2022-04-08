import { Component } from 'react';
import axios from 'axios';
import GetApiServerUri from './helpers';
import {logError, logDebug} from './helpers';

class TornjakApi extends Component {
  constructor(props) {
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

  registerSelectors = (serverName, wLoadAttdata, refreshSelectorsState, agentworkloadSelectorInfoFunc) => {
    axios.post(GetApiServerUri('/manager-api/tornjak/selectors/register/') + serverName, wLoadAttdata)
      .then(res => {
        //console.log(JSON.stringify(wLoadAttdata, null, ' ') + "\n\nSuccess:" + JSON.stringify(res.data, null, ' '));
        refreshSelectorsState(serverName, agentworkloadSelectorInfoFunc);
      }
      )
      .catch((error) => {
        logError(error);
      })
  }

  registerLocalSelectors = (wLoadAttdata, refreshLocalSelectorsState, agentworkloadSelectorInfoFunc) => {
    //console.log(wLoadAttdata)
    axios.post(GetApiServerUri('/api/tornjak/selectors/register'), wLoadAttdata)
      .then(res => {
        //console.log(JSON.stringify(wLoadAttdata, null, ' ') + "\n\nSuccess:" + JSON.stringify(res.data, null, ' '));
        refreshLocalSelectorsState(agentworkloadSelectorInfoFunc);
      }
      )
      .catch((error) => {
        logError(error);
      })
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
  refreshSelectorsState = (serverName, agentworkloadSelectorInfoFunc) => {
    axios.get(GetApiServerUri("/manager-api/tornjak/selectors/list/") + serverName, { crossdomain: true })
      .then(response => {
        //console.log(response.data);
        agentworkloadSelectorInfoFunc(response.data["agents"]);
      })
      .catch((error) => {
        logError(error);
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
  refreshLocalSelectorsState = (agentworkloadSelectorInfoFunc) => {
    axios.get(GetApiServerUri("/api/tornjak/selectors/list"), { crossdomain: true })
      .then(response => {
        //console.log(response.data);
        agentworkloadSelectorInfoFunc(response.data["agents"]);
      })
      .catch((error) => {
        logError(error);
      })
  }

  // populateTornjakAgentInfo returns tornjak info of requested agents including cluster name and selector
  populateTornjakAgentInfo = (serverName, agentworkloadSelectorInfoFunc, inputData) => {
    axios.post(GetApiServerUri("/manager-api/tornjak/agents/list/") + serverName, inputData,
              { crossdomain: true,
              })
      .then(response => {
        agentworkloadSelectorInfoFunc(response.data["agents"]);
      })
      .catch((error) => {
        logError(error);
      })
  }

  // populateLocalTornjakAgentInfo returns tornjak info of requested agents including cluster name and selector
  populateLocalTornjakAgentInfo = (agentworkloadSelectorInfoFunc, inputData) => {
    axios.post(GetApiServerUri("/api/tornjak/agents/list"), inputData,
              { crossdomain: true,
              })
      .then(response => {
        agentworkloadSelectorInfoFunc(response.data["agents"])
      })
      .catch((error) => {
        logError(error);
      })
  }

  // populateTornjakServerInfo returns the tornjak server info of the selected server in manager mode
  populateTornjakServerInfo = (serverName, tornjakServerInfoUpdateFunc, tornjakMessageFunc) => {
    axios.get(GetApiServerUri('/manager-api/tornjak/serverinfo/') + serverName, { crossdomain: true })
      .then(response => {
        tornjakServerInfoUpdateFunc(response.data);
        tornjakMessageFunc(response.statusText);
      }).catch(error => {
        logError(error);
        tornjakServerInfoUpdateFunc([]);
        tornjakMessageFunc("Error retrieving " + serverName + " : " + error.message);
      });
  }

  // populateLocalTornjakServerInfo returns the torjak server info of the server in local mode
  populateLocalTornjakServerInfo = (tornjakServerInfoUpdateFunc, tornjakMessageFunc) => {
    axios.get(GetApiServerUri('/api/tornjak/serverinfo'), { crossdomain: true })
      .then(response => {
        tornjakServerInfoUpdateFunc(response.data);
        tornjakMessageFunc(response.statusText);
      })
      .catch((error) => {
        logError(error);
        tornjakMessageFunc("Error retrieving: " + error.message);
      })
  }

  // populateServerInfo returns the server trust domain and nodeAttestorPlugin
  populateServerInfo = (serverInfo, serverInfoUpdateFunc) => {
    //node attestor plugin
    if (serverInfo === "" || serverInfo === undefined || JSON.stringify(serverInfo) === '{}') {
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

  populateEntriesUpdate = (serverName, entriesListUpdateFunc, tornjakMessageFunc) => {
    axios.get(GetApiServerUri('/manager-api/entry/list/') + serverName, {crossdomain: true})
    .then(response => {
      if(!response.data["entries"]) {
        entriesListUpdateFunc([]);
      } else {entriesListUpdateFunc(response.data["entries"]);}
      tornjakMessageFunc(response.statusText);
    }).catch(error => {
      entriesListUpdateFunc([]);
      tornjakMessageFunc("Error retrieving " + serverName + " : " + error + (typeof (error.response) !== "undefined" ? ":" + error.response.data : ""));
    })
  }

  populateLocalEntriesUpdate = (entriesListUpdateFunc, tornjakMessageFunc) => {
    axios.get(GetApiServerUri('/api/entry/list'), {crossdomain: true})
    .then(response => {
      if(!response.data["entries"]) {
        entriesListUpdateFunc([]);
      } else {entriesListUpdateFunc(response.data["entries"]);}
      tornjakMessageFunc(response.statusText);
    }).catch(error => {
      logError(error);
      entriesListUpdateFunc([]);
      tornjakMessageFunc(error.message);
    })
  }

  // populateAgentsUpdate returns the list of agents with their info in manager mode for the selected server
  populateAgentsUpdate = (serverName, agentsListUpdateFunc, tornjakMessageFunc) => {
    axios.get(GetApiServerUri('/manager-api/agent/list/') + serverName, { crossdomain: true })
      .then(response => {
        if(!response.data["agents"]) {
          agentsListUpdateFunc([]);
        } else {agentsListUpdateFunc(response.data["agents"]);}
        tornjakMessageFunc(response.statusText);
      }).catch(error => {
        logError(error);
        agentsListUpdateFunc([]);
        tornjakMessageFunc("Error retrieving " + serverName + " : " + error.message);
      });

  }

  // populateLocalAgentsUpdate - returns the list of agents with their info in Local mode for the server
  populateLocalAgentsUpdate = (agentsListUpdateFunc, tornjakMessageFunc) => {
    axios.get(GetApiServerUri('/api/agent/list'), { crossdomain: true })
      .then(response => {
        if(!response.data["agents"]) {
          agentsListUpdateFunc([]);
        } else {agentsListUpdateFunc(response.data["agents"]);}
        tornjakMessageFunc(response.statusText);
      })
      .catch((error) => {
        logError(error);
        agentsListUpdateFunc([]);
        tornjakMessageFunc("Error retrieving: " + error.message);
      })
  }

  // populateClustersUpdate returns the list of clusters with their info in manager mode for the selected server
  populateClustersUpdate = (serverName, clustersListUpdateFunc, tornjakMessageFunc) => {
    axios.get(GetApiServerUri('/manager-api/tornjak/clusters/list/') + serverName, { crossdomain: true })
      .then(response => {
        clustersListUpdateFunc(response.data["clusters"]);
        tornjakMessageFunc(response.statusText);
      }).catch(error => {
        logError(error);
        clustersListUpdateFunc([]);
        tornjakMessageFunc("Error retrieving " + serverName + " : " + error.message);
      });
  }

  // populateLocalClustersUpdate - returns the list of clusters with their info in Local mode for the server
  populateLocalClustersUpdate = (clustersListUpdateFunc, tornjakMessageFunc) => {
    axios.get(GetApiServerUri('/api/tornjak/clusters/list'), { crossdomain: true })
      .then(response => {
        clustersListUpdateFunc(response.data["clusters"]);
        tornjakMessageFunc(response.statusText);
      })
      .catch((error) => {
        logError(error);
        clustersListUpdateFunc([]);
        tornjakMessageFunc("Error retrieving: " + error.message);
      })
  }

}

export default TornjakApi;