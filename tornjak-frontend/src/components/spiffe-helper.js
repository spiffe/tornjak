import { Component } from 'react';

class SpiffeHelper extends Component {
  getMillisecondsFromEpoch() {
    return new Date().getTime()
  }

  getAgentExpiryMillisecondsFromEpoch(entry) {
    if (typeof entry !== 'undefined') {
      return entry.x509svid_expires_at * 1000
    }
    return ""
  }

  getEntryExpiryMillisecondsFromEpoch(entry) {
    if (typeof entry !== 'undefined' && typeof entry.expires_at !== 'undefined') {
      return entry.expires_at * 1000
    }
    return ""
  }

  getEntryAdminFlag(entry) {
    return typeof entry !== 'undefined' &&
      typeof entry.admin !== 'undefined' &&
      entry.admin;
  }

  // check if format strictly adhered to
  checkSpiffeidValidity(trust_domain, path) {
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

  getAgentSpiffeid(entry) {
    if (typeof entry !== 'undefined' && this.checkSpiffeidValidity(entry.id.trust_domain, entry.id.path)) {
      return "spiffe://" + entry.id.trust_domain + entry.id.path
    }
    return ""
  }

  getEntrySpiffeid(entry) {
    if (typeof entry !== 'undefined' && this.checkSpiffeidValidity(entry.spiffe_id.trust_domain, entry.spiffe_id.path)) {
      return "spiffe://" + entry.spiffe_id.trust_domain + entry.spiffe_id.path
    }
    return ""
  }

  getEntryParentid(entry) {
    if (typeof entry !== 'undefined' && this.checkSpiffeidValidity(entry.parent_id.trust_domain, entry.parent_id.path)) {
      return "spiffe://" + entry.parent_id.trust_domain + entry.parent_id.path
    }
    return ""
  }

  getAgentStatusString(entry) {
    if (typeof entry !== 'undefined') {
      var banned = entry.banned
      var status = "OK"
      var expiry = this.getAgentExpiryMillisecondsFromEpoch(entry)
      var currentTime = this.getMillisecondsFromEpoch()
      if (banned) {
        status = "Banned"
      } else if (expiry > currentTime) {
        status = "Attested"
      }
      return status
    }
    return ""
  }

  getAgentMetadata(spiffeid, metadataList) {
    if (typeof metadataList !== 'undefined') {
      var metadata = metadataList.filter(agent => (agent.spiffeid === spiffeid));
      if (metadata.length !== 0) {
        return metadata[0]
      }
    }
    return { "plugin": "", "cluster": "" }
  }

  // getAgentEntries provides an agent and a list of entries and returns
  // the list of entries which are associated with this agent
  getAgentEntries(agent, entries) {
    let nodeEntries = entries.filter(e => e.parent_id.path === "/spire/server")
    let agentSelectors = new Set(agent.selectors.map(formatSelectors))
    let isAssocWithAgent = e => {
      let entrySelectors = new Set(e.selectors.map(formatSelectors))
      return isSuperset(agentSelectors, entrySelectors)
    }

    return nodeEntries.filter(isAssocWithAgent)
  }

  // getAgentEntries provides list of agents and a list of entries 
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
  getAgentsEntries(agents, entries) {
    let nodeEntries = entries.filter(e => e.parent_id.path === "/spire/server");
    var lambdas = [];
    var agentEntriesDict = {};

    for (let i = 0; i < agents.length; i++) {
      let agent = agents[i];
      let agentId = this.getAgentSpiffeid(agent);
      agentEntriesDict[agentId] = [];

      let agentSelectors = new Set(agent.selectors.map(formatSelectors));
      let isAssocWithAgent = e => {
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
  getCanonicalAgentSpiffeid(entry, agents) {
    let entrySelectors = new Set(entry.selectors.map(formatSelectors));
    let isAssocWithEntry = a => {
      let agentSelectors = new Set(a.selectors.map(formatSelectors));
      return isSuperset(agentSelectors, entrySelectors);
    }

    let filteredAgents = agents.filter(isAssocWithEntry);
    if (filteredAgents.length > 0) {
      return this.getAgentSpiffeid(filteredAgents[0]);
    }
    return "";
  }

  // numberAgentEntries takes in spiffe id of an agent and entries list 
  // returns number of entries for an agent
  numberAgentEntries(spiffeid, globalEntries) {
    if (typeof globalEntries !== 'undefined') {
      var entriesList = globalEntries.filter(entry => {
        return spiffeid === (this.getEntryParentid(entry))
      })
      return entriesList.length
    } else {
      return 0
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

  // cluster takes in an entry cluster metadata and list of entries
  // returns cluster metadata info for dashboard table
  cluster(entry, globalEntries) {
    return {
      id: entry.name,
      name: entry.name,
      created: entry.creationTime,
      numNodes: entry.agentsList.length,
      numEntries: this.numberClusterEntries(entry, globalEntries),
    }
  }

  // numberEntries takes in spiffe id of an agent, avialble agents' spiffeids and list of entries
  // returns cluster metadata info for dashboard table
  numberEntries(spiffeid, agentEntriesDict, globalEntries) {
    var validIds = new Set([spiffeid]);

    // Also check for parent IDs associated with the agent
    let agentEntries = agentEntriesDict[spiffeid];
    if (agentEntries !== undefined) {
      for (let j = 0; j < agentEntries.length; j++) {
        validIds.add(this.getEntrySpiffeid(agentEntries[j]));
      }
    }

    if (typeof globalEntries !== 'undefined') {
      var entriesList = globalEntries.filter(entry => {
        return (typeof entry !== 'undefined') && validIds.has(this.getEntryParentid(entry));
      });

      if (typeof entriesList === 'undefined') {
        return 0
      } else {
        return entriesList.length
      }
    } else {
      return 0
    }
  }

  // getChildEntries takes in an agent metadata, avialble agents' spiffeids, list of entries and workload attestor info for specified agents
  // returns agent metadata info for dashboard table
  getChildEntries(agent, agentEntriesDict, globalEntries, WorkLoadAttestorInfo) {
    var thisSpiffeid = this.getAgentSpiffeid(agent);
    // get status
    var status = this.getAgentStatusString(agent);
    // get tornjak metadata
    var metadata_entry = this.getAgentMetadata(thisSpiffeid, WorkLoadAttestorInfo);
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
    var thisSpiffeId = this.getEntrySpiffeid(entry)
    var thisParentId = this.getEntryParentid(entry)
    // get tornjak metadata
    var metadata_entry = this.getAgentMetadata(thisParentId, WorkLoadAttestorInfo);
    var plugin = "None"
    var cluster = "None"
    if (metadata_entry["plugin"].length !== 0) {
      plugin = metadata_entry["plugin"]
    }
    if (metadata_entry["cluster"].length !== 0) {
      cluster = metadata_entry["cluster"]
    }
    // get spire data
    var admin = this.getEntryAdminFlag(entry)
    var expTime = "No Expiry Time"
    if (typeof entry.expires_at !== 'undefined') {
      var d = new Date(this.getEntryExpiryMillisecondsFromEpoch(entry))
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


function isSuperset(set, subset) {
  for (let elem of subset) {
    if (!set.has(elem)) {
      return false
    }
  }
  return true
}

function formatSelectors(s) {
  return s.type + ":" + s.value;
}


export default SpiffeHelper;
