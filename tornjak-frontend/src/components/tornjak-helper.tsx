// Additional objects the functions take
// agentsSpiffeIdDict - list of avaialble agent's spiffe ids
// workLoadAttestorInfo - https://github.com/spiffe/tornjak/blob/main/docs/tornjak-ui-api-documentation.md#:~:text=AgentWorkloadSelectorInfo
// clusterEntry = single cluster metadata entry
import { Component, ReactNode } from 'react';
import SpiffeHelper from './spiffe-helper';
import { AgentsList, AgentsWorkLoadAttestorInfo, ClustersList, EntriesList } from './types';

interface DetailDataParseProp {
  globalClustersList: ClustersList[],
  globalAgentsList: AgentsList[],
  globalEntriesList: EntriesList[],
  globalAgentsWorkLoadAttestorInfo: AgentsWorkLoadAttestorInfo[],
}

type TornjakHelperProp = {}

type TornjakHelperState = {}

class TornjakHelper extends Component<TornjakHelperProp, TornjakHelperState> {
  SpiffeHelper: SpiffeHelper;
  constructor(props: TornjakHelperProp) {
    super(props);
    this.SpiffeHelper = new SpiffeHelper(props);
    this.state = {
    };
  }

  // checkRolesAdminUser takes in userRoles
  // return whether the user is granted admin role or not
  checkRolesAdminUser(userRoles: string[]) {
    const adminString = "admin";
    const isAdmin = userRoles.find(element => {
      return element.toLowerCase().includes(adminString.toLowerCase())
    });
    return isAdmin;
  }

  // detailsLink takes in selectedRows/ specified data and entity
  // returns a specfic routing link/ URL for an entity
  detailsLink(selectedRows: string, entity: string) {
    const dashboardDetailsLink = "/tornjak/dashboard/details/";
    var detailsLink = "", searchParams = new URLSearchParams(window.location.search);;
    if (selectedRows.length !== 0) {
      searchParams.set("id", encodeURIComponent(selectedRows)); //encode URL since spiffeid contains special characters
      detailsLink = dashboardDetailsLink + entity.toLowerCase() + "?" + searchParams.toString();
    }
    return detailsLink;
  }

  // detailsDataParse takes in url parameters for a specific url for details page and
  // properties of a class including clustersList, agentsList, entriesList and agentsWorkLoadAttestorInfo
  // returns a parsed and filtered data for the specifed entity from the url parameteres 
  detailsDataParse(urlParams: { entity: string; }, props: DetailDataParseProp & Readonly<{ children?: ReactNode; }>) {
    const searchParams: URLSearchParams = new URLSearchParams(window.location.search);
    const parsed: string | null = searchParams.get("id")
    let selectedData: {} = [{}], id: string = "";
    if (parsed !== null) {
      id = decodeURIComponent(parsed);
    }
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
          selectedData = this.workloadEntry(globalEntriesList[i], globalAgentsWorkLoadAttestorInfo, globalAgentsList, globalEntriesList);
        }
      }
    }
    return selectedData;
  }

  // numberEntriesOfCluster takes in an clusterEntry and list of entries
  // returns number of workload/child entries for a cluster
  numberEntriesOfCluster(clusterEntry: { agentsList: string | string[]; }, globalEntries: EntriesList[], globalAgents: AgentsList[]) {
    var agents = globalAgents.filter((a: AgentsList) =>
      clusterEntry.agentsList.includes(this.SpiffeHelper.getAgentSpiffeid(a)))
    var entriesPerAgent = agents.map((currentAgent: AgentsList) => {
      return this.SpiffeHelper.numberEntriesOfAgent(currentAgent, globalEntries)
    })
    var sum = entriesPerAgent.reduce((acc: number | undefined, curVal: number | undefined) => {
      if (acc !== undefined && curVal !== undefined)
        return acc + curVal;
      return 0;
    }, 0)
    return sum
  }

  // getClusterMetadata takes in an clusterEntry and list of entries
  // returns cluster metadata info for dashboard table
  getClusterMetadata(entry: ClustersList, globalEntries: EntriesList[], globalAgents: AgentsList[]) {
    return {
      id: entry.name,
      name: entry.name,
      created: entry.creationTime,
      numNodes: entry.agentsList.length,
      numEntries: this.numberEntriesOfCluster(entry, globalEntries, globalAgents),
    }
  }

  // getDashboardAgentMetaData takes in an agent metadata, list of entries and workload attestor info for specified agents
  // returns agent metadata info for dashboard table
  getDashboardAgentMetaData(agent: AgentsList, globalEntries: EntriesList[], _globalAgents: AgentsList[], workLoadAttestorInfo: AgentsWorkLoadAttestorInfo[]) {
    var thisSpiffeid = this.SpiffeHelper.getAgentSpiffeid(agent);
    // get status
    var status = this.SpiffeHelper.getAgentStatusString(agent);
    // get tornjak metadata
    var metadataEntry = this.SpiffeHelper.getAgentMetadata(thisSpiffeid, workLoadAttestorInfo);
    var plugin = "None"
    var cluster = "None"
    if (typeof metadataEntry["plugin"] !== 'undefined' && metadataEntry["plugin"].length !== 0) {
      plugin = metadataEntry["plugin"]
    }
    if (typeof metadataEntry["cluster"] !== 'undefined' && metadataEntry["cluster"].length !== 0) {
      cluster = metadataEntry["cluster"]
    }
    return {
      id: thisSpiffeid,
      spiffeid: thisSpiffeid,
      numEntries: this.SpiffeHelper.numberEntriesOfAgent(agent, globalEntries),
      status: status,
      platformType: plugin,
      clusterName: cluster,
    }
  }

  // workloadEntry takes in an entry metadata and workload attestor info for specified agents
  // returns entry metadata info for dashboard table
  workloadEntry(entry: EntriesList, workLoadAttestorInfo: AgentsWorkLoadAttestorInfo[], globalAgents: AgentsList[], globalEntries: EntriesList[]) {
    var thisSpiffeId = this.SpiffeHelper.getEntrySpiffeid(entry)
    var thisParentId = this.SpiffeHelper.getEntryParentid(entry)
    var canonicalParentId = thisParentId
    // get tornjak metadata
    var parentAgent = globalAgents.find((a: AgentsList) => this.SpiffeHelper.getAgentSpiffeid(a) === thisParentId)
    if (parentAgent === undefined) {
      var agent = globalEntries.find((e: EntriesList) => this.SpiffeHelper.getEntrySpiffeid(e) === thisParentId)
      if (agent !== undefined) {
        canonicalParentId = this.SpiffeHelper.getCanonicalAgentSpiffeid(agent, globalAgents)
      }
    }

    var plugin = "None"
    var cluster = "None"
    var metadataEntry = this.SpiffeHelper.getAgentMetadata(canonicalParentId, workLoadAttestorInfo);
    if (metadataEntry["plugin"].length !== 0) {
      plugin = metadataEntry["plugin"]
    }
    if (metadataEntry["cluster"].length !== 0) {
      cluster = metadataEntry["cluster"]
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
      canonicalAgentId: canonicalParentId,
    }
  }

}

export default TornjakHelper;