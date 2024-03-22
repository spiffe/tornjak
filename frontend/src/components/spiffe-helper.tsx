import { Component } from 'react';
import { AgentsList, AgentsWorkLoadAttestorInfo, EntriesList } from './types';

type SpiffeHelperProp = {}
type SpiffeHelperState = {}

class SpiffeHelper extends Component<SpiffeHelperProp, SpiffeHelperState> {
  constructor(props: SpiffeHelperProp) {
    super(props);
    this.state = {
    };
  }
  getMillisecondsFromEpoch() {
    return new Date().getTime()
  }

  getAgentExpiryMillisecondsFromEpoch(entry: AgentsList) {
    if (typeof entry !== 'undefined') {
      return Number(entry.x509svid_expires_at) * 1000
    }
    return ""
  }

  getEntryExpiryMillisecondsFromEpoch(entry: EntriesList) {
    if (typeof entry !== 'undefined' && typeof entry.expires_at !== 'undefined') {
      return entry.expires_at * 1000
    }
    return ""
  }

  getEntryAdminFlag(entry: EntriesList) {
    return typeof entry !== 'undefined' && typeof entry.admin !== 'undefined' && entry.admin;
  }

  // check if format strictly adhered to
  checkSpiffeidValidity(trust_domain: string, path: string) {
    if (typeof trust_domain === 'undefined' || typeof path === 'undefined') {
      return false
    } else if (trust_domain.length === 0 || path.length === 0) {
      return false
    } else if (trust_domain.charAt(0) === '/') {
      return false
    } else if (trust_domain.slice(-1) === "/" && path.charAt(0) !== "/") {
      return true
    }
    return (trust_domain.slice(-1) !== "/" && path.charAt(0) === "/")
  }

  getAgentSpiffeid(entry: AgentsList) {
    if (typeof entry !== 'undefined' && this.checkSpiffeidValidity(entry.id.trust_domain, entry.id.path)) {
      return "spiffe://" + entry.id.trust_domain + entry.id.path
    }
    return ""
  }

  getEntrySpiffeid(entry: EntriesList) {
    if (typeof entry !== 'undefined' && this.checkSpiffeidValidity(entry.spiffe_id.trust_domain, entry.spiffe_id.path)) {
      return "spiffe://" + entry.spiffe_id.trust_domain + entry.spiffe_id.path
    }
    return ""
  }

  getEntryParentid(entry: EntriesList) {
    if (typeof entry !== 'undefined' && this.checkSpiffeidValidity(entry.parent_id.trust_domain, entry.parent_id.path)) {
      return "spiffe://" + entry.parent_id.trust_domain + entry.parent_id.path
    }
    return ""
  }

  getAgentStatusString(entry: AgentsList) {
    if (typeof entry !== 'undefined') {
      var banned = entry.banned
      var status = "Expired"
      var expiry = this.getAgentExpiryMillisecondsFromEpoch(entry)
      var currentTime = this.getMillisecondsFromEpoch()
      if (typeof expiry === 'number') {
        if (banned) {
          status = "Banned"
        }
        else if (expiry > currentTime) {
          status = "Attested"
        }
        return status
      }
    }
    return ""
  }

  getAgentMetadata(spiffeid: string, metadataList: AgentsWorkLoadAttestorInfo[]) {
    if (typeof metadataList !== 'undefined') {
      var metadata = metadataList.filter((agent: { spiffeid: string; }) => (agent.spiffeid === spiffeid));
      if (metadata.length !== 0) {
        return metadata[0]
      }
    }
    return { "plugin": "", "cluster": "" }
  }

  // getAgentEntries provides an agent and a list of entries and returns
  // the list of entries which are associated with this agent
  getAgentEntries(agent: AgentsList, entries: EntriesList[]) {
    let nodeEntries = entries.filter((e: { parent_id: { path: string; }; }) => e.parent_id.path === "/spire/server")
    if (agent === undefined) {
      return [];
    }
    if (agent.selectors === undefined) {
      agent.selectors = [];
    }
    let agentSelectors = new Set(agent.selectors.map(formatSelectors))
    // TODO(mamy-CS): any for now - will be specifically typed in next consecutive PR
    let isAssocWithAgent = (e: { selectors: any[] | undefined; }) => {
      console.log(e.selectors)
      if (e.selectors === undefined) {
        e.selectors = [];
      }
      let entrySelectors = new Set(e.selectors.map(formatSelectors))
      return isSuperset(agentSelectors, entrySelectors)
    }
    return nodeEntries.filter(isAssocWithAgent)
  }

  // getAgentsEntries provides list of agents and a list of entries 
  // and returns a dictionary with the fully qualified spiffe ID (as per 
  // getAgentSpiffeid) as keys, and values being the the list of entries 
  // which are associated with that agent.
  //
  // Note(@lumjjb):
  // Not filtering based on each agent with above helper due to the need to
  // go through all the entries multiple times. Since entries are expected to
  // be more, going through entries in one pass to benefit from locality.
  //
  // There is a potential optimization here by creating a lookup table with
  // the selectors and having a backpointer to the agent with that selector
  // since the association with entries and agent selectors are likely to be 
  // n:1, this would reduce the total cost. This may be useful when 
  // performance is impacted.
  getAgentsEntries(agents: AgentsList[] | undefined, entries: EntriesList[] | undefined) {
    let nodeEntries = [];
    if (entries === undefined) {
      return undefined
    }
    nodeEntries = entries.filter((e: { parent_id: { path: string; }; }) => e.parent_id.path === "/spire/server");
    var lambdas = [];
    var agentEntriesDict: { [key: string]: EntriesList[]; } = {};
    if (agents === undefined) {
      return
    }
    for (let i = 0; i < agents.length; i++) {
      let agent = agents[i];
      let agentId = this.getAgentSpiffeid(agent);
      agentEntriesDict[agentId] = [];
      if (agent.selectors === undefined) {
        agent.selectors = [];
      }
      let agentSelectors = new Set(agent.selectors.map(formatSelectors));
      let isAssocWithAgent = (e: EntriesList) => {
        if (e.selectors === undefined) {
          e.selectors = [];
        }
        let entrySelectors = new Set(e.selectors.map(formatSelectors))
        if (isSuperset(agentSelectors, entrySelectors)) {
          agentEntriesDict[agentId].push(e);
        }
      };
      lambdas.push(isAssocWithAgent);
    }

    for (let i = 0; i < nodeEntries.length; i++) {
      for (let j = 0; j < lambdas.length; j++) {
        lambdas[j](nodeEntries[i])
      }
    }
    return agentEntriesDict
  }

  // getCanonicalAgentSpiffeid takes in a agent entry, and returns the first 
  // agent ID that is found associated with it.
  getCanonicalAgentSpiffeid(entry: EntriesList, agents: AgentsList[]) {
    if (entry.selectors === undefined) {
      entry.selectors = [];
    }
    let entrySelectors = new Set(entry.selectors.map(formatSelectors));
    // TODO(mamy-CS): any for now - will be specifically typed in next consecutive PR
    let isAssocWithEntry = (a: { selectors: any[] | undefined; }) => {
      if (a.selectors === undefined) {
        a.selectors = [];
      }
      let agentSelectors = new Set(a.selectors.map(formatSelectors));
      return isSuperset(agentSelectors, entrySelectors);
    }

    let filteredAgents = agents.filter(isAssocWithEntry);
    if (filteredAgents.length > 0) {
      return this.getAgentSpiffeid(filteredAgents[0]);
    }
    return "";
  }

  // numberEntriesOfAgent takes in an agent and list of entries
  // returns number of entries in the agent
  numberEntriesOfAgent(agent: AgentsList, globalEntries: EntriesList[]) {
    var agentEntries = this.getAgentEntries(agent, globalEntries)
    var validIds = new Set([this.getAgentSpiffeid(agent)]);

    for (let j = 0; j < agentEntries.length; j++) {
      validIds.add(this.getEntrySpiffeid(agentEntries[j]));
    }

    var entriesList = globalEntries.filter((entry: EntriesList) => {
      return (typeof entry !== 'undefined') && validIds.has(this.getEntryParentid(entry));
    });

    return entriesList.length
  }

  // 
  //  ********************************************************************
  //  KEEP THIS PIECE OF CODE THAT CAN BE USEFUL LATER ON FOR OPTIMIZATION
  //  WHEN HANDLING MULTIPLE AGENTS AT THE SAME TIME
  //  ********************************************************************
  // // numberEntriesOfAgent takes in spiffe id of an agent and list of entries
  // // returns number of entries in the agent
  // numberEntriesOfAgent(agent, globalEntries) {
  //   var agentEntriesDict = this.getAgentEntries(
  //   var validIds = new Set([spiffeid]);
  // 
  //   // Also check for parent IDs associated with the agent
  //   let agentEntries = agentEntriesDict[spiffeid];
  //   if (agentEntries !== undefined) {
  //     for (let j=0; j < agentEntries.length; j++) {
  //         validIds.add(this.SpiffeHelper.getEntrySpiffeid(agentEntries[j]));
  //     }
  //   }
  // 
  //   if (typeof this.props.globalEntries.globalEntriesList !== 'undefined') {
  //     var entriesList = this.props.globalEntries.globalEntriesList.filter(entry=> {
  //       return (typeof entry !== 'undefined') && validIds.has(this.SpiffeHelper.getEntryParentid(entry));
  //     });
  // 
  //     if (typeof entriesList === 'undefined') {
  //       return 0
  //     } else {
  //       return entriesList.length
  //     }
  //   } else {
  //     return 0
  //   }
  // }



  // getChildEntries takes in spiffeid of agent, list of agents, and a list of entries
  // returns list of child entries
  getChildEntries(spiffeid: string, globalAgents: AgentsList[], globalEntries: EntriesList[]) {
    if (typeof globalEntries === 'undefined') {
      return NaN;
    }
    var curAgent = globalAgents.filter((agent: AgentsList) => {
      return this.getAgentSpiffeid(agent) === spiffeid
    })
    var entriesList = globalEntries.filter((entry: EntriesList) => {
      return spiffeid === (this.getEntryParentid(entry))
    })
    // Add entries associated with this agent
    // TODO(mamy-CS): any for now - will be specifically typed in next consecutive PR
    let agentEntriesDict: any = this.getAgentEntries(curAgent[0], globalEntries)
    let agentEntries = agentEntriesDict[spiffeid];
    let entriesAgent = [];
    if (agentEntries !== undefined) {
      entriesAgent = agentEntries.map((cur: EntriesList) => {
        return this.getEntrySpiffeid(cur)
      })
    }
    entriesList = entriesList.concat(entriesAgent);
    return entriesList;
  }

}

function isSuperset(set: Set<unknown>, subset: Set<unknown>) {
  for (let elem of subset) {
    if (!set.has(elem)) {
      return false
    }
  }
  return true
}

function formatSelectors(s: { type: string; value: string; }) {
  return s.type + ":" + s.value;
}


export default SpiffeHelper;