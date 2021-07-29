import React from 'react';
import { connect } from 'react-redux';
import Title from './title';
import PieChart1 from "charts/PieChart";
import SpiffeEntryInterface from '../spiffe-entry-interface'

class AgentsPieChart extends React.Component {
  constructor(props) {
    super(props);
    this.SpiffeEntryInterface = new SpiffeEntryInterface();
  }

  agent(entry) {
    var spiffeid = this.SpiffeEntryInterface.getAgentSpiffeid(entry);
    if (typeof this.props.globalEntries.globalEntriesList !== 'undefined') {
      var check_id = this.props.globalEntries.globalEntriesList.filter(thisentry => {
        return (spiffeid) === this.SpiffeEntryInterface.getEntryParentid(thisentry)
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
    if (typeof this.props.globalAgents.globalAgentsList !== 'undefined') {
      var valueMapping = this.props.globalAgents.globalAgentsList.map(currentAgent => {
        return this.agent(currentAgent);
      })
      return valueMapping.filter(thisentry => (thisentry.value > 0));
    } else {
      return []
    }
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