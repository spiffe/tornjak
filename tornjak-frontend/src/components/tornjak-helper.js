// Additional objects the functions take
// agentsSpiffeIdDict - list of avaialble agent's spiffe ids
// workLoadAttestorInfo - https://github.com/spiffe/tornjak/blob/main/docs/tornjak-ui-api-documentation.md#:~:text=AgentWorkloadSelectorInfo
// clusterEntry = single cluster metadata entry
import { Component } from 'react';
import SpiffeHelper from './spiffe-helper';

class TornjakHelper extends Component {
  constructor(props) {
    super(props);
    this.SpiffeHelper = new SpiffeHelper();
    this.state = {
    };
  }
  
  // detailsLink takes in selectedRows/ specified data and entity
  // returns a specfic routing link/ URL for an entity
  detailsLink(selectedRows, entity) {
    const dashboardDetailsLink = "/tornjak/dashboard/details/";
    var detailsLink = "", searchParams = new URLSearchParams(window.location.search);;
    if (selectedRows.length !== 0) {
      searchParams.set("id", encodeURIComponent(selectedRows.id)); //encode URL since spiffeid contains special characters
      detailsLink = dashboardDetailsLink + entity.toLowerCase() + "?" + searchParams.toString();
    }
    return detailsLink;
  }

  // detailsDataParse takes in url parameters for a specific url for details page and
  // properties of a class including clustersList, agentsList, entriesList and agentsWorkLoadAttestorInfo
  // returns a parsed and filtered data for the specifed entity from the url parameteres 
  detailsDataParse(urlParams, props) {
    if(urlParams === undefined) {
      return
    }
    const searchParams = new URLSearchParams(window.location.search);
    const parsed = searchParams.get("id")
    let selectedData = [{}], id = decodeURIComponent(parsed);
    const { globalClustersList, globalAgentsList, globalEntriesList, globalAgentsWorkLoadAttestorInfo } = props;
    if (urlParams.entity === "clusters") {
      for (let i = 0; i < globalClustersList.length; i++) {
        if (globalClustersList[i].name === id) {
          selectedData = this.getClusterMetadata(globalClustersList[i], globalEntriesList, globalAgentsList);
        }
      }
    } else if (urlParams.entity === "agents") {
      for (let i = 0; i < globalAgentsList.length; i++) {
        let agentId = this.SpiffeHelper.getAgentSpiffeid(globalAgentsList[i]);
        if (agentId === id) {
          selectedData = this.getDashboardAgentMetaData(globalAgentsList[i], globalEntriesList, globalAgentsList, globalAgentsWorkLoadAttestorInfo);
        }
      }
    } else if (urlParams.entity === "entries") {
      for (let i = 0; i < globalEntriesList.length; i++) {
        if (globalEntriesList[i].id === id) {
          selectedData = this.workloadEntry(globalEntriesList[i], globalAgentsWorkLoadAttestorInfo);
        }
      }
    }
    return selectedData;
  }

  // numberEntriesFromAgent takes in spiffe id of an agent and entries list 
  // returns number of workload/child entries for an agent
  numberEntriesFromAgent(spiffeid, globalEntries, globalAgents) {
    if (typeof globalEntries !== 'undefined') {
      var entriesList = this.SpiffeHelper.getChildEntries(spiffeid, globalAgents, globalEntries);
      return entriesList.length
    } else {
      return NaN
    }
  }

  // entryClusterMetadata takes in an clusterEntry and list of entries
  // returns number of workload/child entries for a cluster
  entryClusterMetadata(entry, globalEntries, globalAgents) {
    var entriesPerAgent = entry.agentsList.map(currentAgent => {
      return this.numberEntriesFromAgent(currentAgent, globalEntries, globalAgents);
    })
    var sum = entriesPerAgent.reduce((acc, curVal) => {
      return acc + curVal;
    }, 0)
    return sum
  }

  // getClusterMetadata takes in an clusterEntry and list of entries
  // returns cluster metadata info for dashboard table
  getClusterMetadata(entry, globalEntries, globalAgents) {
    if(entry === undefined || entry.agentsList === undefined) {
      return;
    }
    return {
      id: entry.name,
      name: entry.name,
      created: entry.creationTime,
      numNodes: entry.agentsList.length,
      numEntries: this.entryClusterMetadata(entry, globalEntries, globalAgents),
    }
  }

  // getDashboardAgentMetaData takes in an agent metadata, list of entries and workload attestor info for specified agents
  // returns agent metadata info for dashboard table
  getDashboardAgentMetaData(agent, globalEntries, globalAgents, workLoadAttestorInfo) {
    var thisSpiffeid = this.SpiffeHelper.getAgentSpiffeid(agent);
    // get status
    var status = this.SpiffeHelper.getAgentStatusString(agent);
    // get tornjak metadata
    var metadata_entry = this.SpiffeHelper.getAgentMetadata(thisSpiffeid, workLoadAttestorInfo);
    var plugin = "None"
    var cluster = "None"
    if (typeof metadata_entry["plugin"] !== 'undefined' && metadata_entry["plugin"].length !== 0) {
      plugin = metadata_entry["plugin"]
    }
    if (typeof metadata_entry["cluster"] !== 'undefined' && metadata_entry["cluster"].length !== 0) {
      cluster = metadata_entry["cluster"]
    }
    return {
      id: thisSpiffeid,
      spiffeid: thisSpiffeid,
      numEntries: this.SpiffeHelper.numberEntries(thisSpiffeid, globalEntries, globalAgents),
      status: status,
      platformType: plugin,
      clusterName: cluster,
    }
  }

  // workloadEntry takes in an entry metadata and workload attestor info for specified agents
  // returns entry metadata info for dashboard table
  workloadEntry(entry, workLoadAttestorInfo) {
    var thisSpiffeId = this.SpiffeHelper.getEntrySpiffeid(entry)
    var thisParentId = this.SpiffeHelper.getEntryParentid(entry)
    // get tornjak metadata
    var metadata_entry = this.SpiffeHelper.getAgentMetadata(thisParentId, workLoadAttestorInfo);
    var plugin = "None"
    var cluster = "None"
    if (metadata_entry["plugin"].length !== 0) {
      plugin = metadata_entry["plugin"]
    }
    if (metadata_entry["cluster"].length !== 0) {
      cluster = metadata_entry["cluster"]
    }
    // get spire data
    var admin = this.SpiffeHelper.getEntryAdminFlag(entry)
    var expTime = "No Expiry Time"
    if (typeof entry.expires_at !== 'undefined') {
      var d = new Date(this.SpiffeHelper.getEntryExpiryMillisecondsFromEpoch(entry))
      expTime = d.toLocaleDateString("en-US", { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false })
    }
    return {
      id: entry.id,
      spiffeid: thisSpiffeId,
      parentId: thisParentId,
      adminFlag: admin,
      entryExpireTime: expTime,
      platformType: plugin,
      clusterName: cluster,
    }
  }

}

export default TornjakHelper;