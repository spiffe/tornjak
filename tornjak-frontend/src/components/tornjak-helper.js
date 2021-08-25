// Additional objects the functions take
// entriesMetaData, agentsSpiffeIdDict, WorkLoadAttestorInfo, entryClusterMetadata
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
    var detailsLink = "";
    if (selectedRows.length !== 0) {
      detailsLink = dashboardDetailsLink + entity.toLowerCase() + "/" + encodeURIComponent(selectedRows.id); //encode URL since spiffeid contains special characters
    }
    return detailsLink;
  }

  // detailsDataParse takes in url parameters for a specific url and properties of a class
  // returns a parsed and filtered data for the specifed entity from the url parameteres 
  detailsDataParse(urlParams, props) {
    let selectedData = [{}], id = decodeURIComponent(urlParams.id);
    const { globalClustersList, globalAgentsList, globalEntriesList, globalAgentsWorkLoadAttestorInfo } = props;
    if (urlParams.entity === "clusters") {
      for (let i = 0; i < globalClustersList.length; i++) {
        if (globalClustersList[i].name === id) {
          selectedData = this.getClusterMetadata(globalClustersList[i], globalEntriesList)
        }
      }
    } else if (urlParams.entity === "agents") {
      for (let i = 0; i < globalAgentsList.length; i++) {
        let agentId = "spiffe://" + globalAgentsList[i].id.trust_domain + globalAgentsList[i].id.path;
        if (agentId === id) {
          let agentEntriesDict = this.SpiffeHelper.getAgentsEntries(globalAgentsList, globalEntriesList)
          selectedData = this.getChildEntries(globalAgentsList[i], agentEntriesDict, globalEntriesList, globalAgentsWorkLoadAttestorInfo)
        }
      }
    } else if (urlParams.entity === "entries") {
      for (let i = 0; i < globalEntriesList.length; i++) {
        if (globalEntriesList[i].id === id) {
          selectedData = this.workloadEntry(globalEntriesList[i], globalAgentsWorkLoadAttestorInfo)
        }
      }
    }
    return selectedData;
  }

  // numberAgentEntries takes in spiffe id of an agent and entries list 
  // returns number of entries for an agent
  numberAgentEntries(spiffeid, globalEntries) {
    if (typeof globalEntries !== 'undefined') {
      var entriesList = globalEntries.filter(entry => {
        return spiffeid === (this.SpiffeHelper.getEntryParentid(entry))
      })
      return entriesList.length
    } else {
      return NaN
    }
  }

  // numberClusterEntries takes in an entry cluster metadata and list of entries
  // returns number of entries in a cluster
  numberClusterEntries(entry, globalEntries) {
    var entriesPerAgent = entry.agentsList.map(currentAgent => {
      return this.numberAgentEntries(currentAgent, globalEntries);
    })
    var sum = entriesPerAgent.reduce((acc, curVal) => {
      return acc + curVal;
    }, 0)
    return sum
  }

  // getClusterMetadata takes in an entry cluster metadata and list of entries
  // returns cluster metadata info for dashboard table
  getClusterMetadata(entry, globalEntries) {
    return {
      id: entry.name,
      name: entry.name,
      created: entry.creationTime,
      numNodes: entry.agentsList.length,
      numEntries: this.numberClusterEntries(entry, globalEntries),
    }
  }

  // numberEntries takes in spiffe id of an agent, avialble agents' spiffeids and list of entries
  // agentEntriesDict is the output of the function SpiffeHelper.getAgentsEntries
  // returns cluster metadata info for dashboard table
  numberEntries(spiffeid, agentEntriesDict, globalEntries) {
    var validIds = new Set([spiffeid]);

    // Also check for parent IDs associated with the agent
    let agentEntries = agentEntriesDict[spiffeid];
    if (agentEntries !== undefined) {
      for (let j = 0; j < agentEntries.length; j++) {
        validIds.add(this.SpiffeHelper.getEntrySpiffeid(agentEntries[j]));
      }
    }

    if (typeof globalEntries !== 'undefined') {
      var entriesList = globalEntries.filter(entry => {
        return (typeof entry !== 'undefined') && validIds.has(this.SpiffeHelper.getEntryParentid(entry));
      });

      if (typeof entriesList === 'undefined') {
        return NaN
      } else {
        return entriesList.length
      }
    } else {
      return NaN
    }
  }

  // getChildEntries takes in an agent metadata, avialble agents' spiffeids, list of entries and workload attestor info for specified agents
  // returns agent metadata info for dashboard table
  getChildEntries(agent, agentEntriesDict, globalEntries, WorkLoadAttestorInfo) {
    var thisSpiffeid = this.SpiffeHelper.getAgentSpiffeid(agent);
    // get status
    var status = this.SpiffeHelper.getAgentStatusString(agent);
    // get tornjak metadata
    var metadata_entry = this.SpiffeHelper.getAgentMetadata(thisSpiffeid, WorkLoadAttestorInfo);
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
      numEntries: this.numberEntries(thisSpiffeid, agentEntriesDict, globalEntries),
      status: status,
      platformType: plugin,
      clusterName: cluster,
    }
  }

  // workloadEntry takes in an entry metadata and workload attestor info for specified agents
  // returns entry metadata info for dashboard table
  workloadEntry(entry, WorkLoadAttestorInfo) {
    var thisSpiffeId = this.SpiffeHelper.getEntrySpiffeid(entry)
    var thisParentId = this.SpiffeHelper.getEntryParentid(entry)
    // get tornjak metadata
    var metadata_entry = this.SpiffeHelper.getAgentMetadata(thisParentId, WorkLoadAttestorInfo);
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