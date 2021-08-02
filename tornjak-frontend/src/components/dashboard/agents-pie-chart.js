import React from 'react';
import { connect } from 'react-redux';
import Title from './title';
import PieChart1 from "charts/PieChart";
import SpiffeHelper from '../spiffe-helper'

class AgentsPieChart extends React.Component {
  constructor(props) {
    super(props);
    this.SpiffeHelper = new SpiffeHelper();
  }

  getChildEntries(agent, agentEntriesDict) {
    var spiffeid = this.SpiffeHelper.getAgentSpiffeid(agent);
    var validIds = new Set([spiffeid]);

    // Also check for parent IDs associated with the agent
    let agentEntries = agentEntriesDict[spiffeid];
    if (agentEntries !== undefined) {
      for (let j=0; j < agentEntries.length; j++) {
          validIds.add(this.SpiffeHelper.getEntrySpiffeid(agentEntries[j]));
      }
    }

    if (typeof this.props.globalEntries.globalEntriesList !== 'undefined') {
      var check_id = this.props.globalEntries.globalEntriesList.filter(thisentry => {
        return validIds.has(this.SpiffeHelper.getEntryParentid(thisentry));
      });
    }
    if (typeof check_id === 'undefined') {
      return {
        "group": spiffeid, 
        "value": 0,
      }
    } else {
      return {
        "group": spiffeid,
        "value": check_id.length,
      }
    }
  }

  agentList() {
    if ((typeof this.props.globalEntries.globalEntriesList === 'undefined') || 
          (typeof this.props.globalAgents.globalAgentsList === 'undefined')) {
        return [];
    }

    let agentEntriesDict = this.SpiffeHelper.getAgentsEntries(this.props.globalAgents.globalAgentsList, this.props.globalEntries.globalEntriesList)
    var valueMapping = this.props.globalAgents.globalAgentsList.map(currentAgent => {
      return this.getChildEntries(currentAgent, agentEntriesDict);
    })
    return valueMapping
  }

  render() {
    var groups = this.agentList()
    return (
      <React.Fragment>
        <Title>ENTRIES PER AGENT</Title>
        {groups.length === 0 &&
          <p className="no-data">No Data To Display</p>
        }
        {groups.length !== 0 &&
        <PieChart1
            data={groups}
        />
        }
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state) => ({
  globalAgents: state.agents,
  globalEntries: state.entries,
})

export default connect(mapStateToProps, {})(AgentsPieChart)
