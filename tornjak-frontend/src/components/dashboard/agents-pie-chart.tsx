import React from 'react';
import { connect } from 'react-redux';
import PieChart1 from "charts/PieChart";
import SpiffeHelper from '../spiffe-helper'
import { AgentsList, EntriesList } from 'components/types';
import { RootState } from 'redux/reducers';
import { AgentsReducerState, EntriesReducerState } from 'redux/actions/types';

type AgentsPieChartProp = {
  globalAgents: AgentsReducerState,
  globalEntries: EntriesReducerState
}
class AgentsPieChart extends React.Component<AgentsPieChartProp> {
  SpiffeHelper: SpiffeHelper;
  constructor(props: AgentsPieChartProp) {
    super(props);
    this.SpiffeHelper = new SpiffeHelper(props);
  }

  getChildEntries(agent: AgentsList, agentEntriesDict: {
    [key: string]: EntriesList[];
  } | undefined) {
    var spiffeid = this.SpiffeHelper.getAgentSpiffeid(agent);
    var validIds = new Set([spiffeid]);

    // Also check for parent IDs associated with the agent
    let agentEntries = agentEntriesDict ? agentEntriesDict[spiffeid] : undefined;
    if (agentEntries !== undefined) {
      for (let j = 0; j < agentEntries.length; j++) {
        validIds.add(this.SpiffeHelper.getEntrySpiffeid(agentEntries[j]));
      }
    }

    var check_id;
    if (typeof this.props.globalEntries.globalEntriesList !== 'undefined') {
      check_id = this.props.globalEntries.globalEntriesList.filter((thisentry: EntriesList) => {
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
    var valueMapping = this.props.globalAgents.globalAgentsList.map((currentAgent: AgentsList) => {
      return this.getChildEntries(currentAgent, agentEntriesDict);
    })
    return valueMapping
  }

  render() {
    var groups = this.agentList()
    return (
      <React.Fragment>
        {groups.length === 0 &&
          <p className="no-data">No Data To Display</p>
        }
        {groups.length !== 0 &&
          <PieChart1
            data={groups}
            title='Number of Workloads per Agent'
          />
        }
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  globalAgents: state.agents,
  globalEntries: state.entries,
})

export default connect(mapStateToProps, {})(AgentsPieChart)
