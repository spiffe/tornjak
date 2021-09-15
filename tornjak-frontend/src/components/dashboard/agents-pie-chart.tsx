import React from "react";
import { connect } from "react-redux";
import Title from "./title";
import PieChart1 from "../../charts/PieChart";
import SpiffeHelper from "../spiffe-helper";
// import PropTypes from "prop-types";

type AgentsPieChartProp = {
  globalEntries: {globalEntriesList: []},
  globalAgents: {globalAgentsList: [], globalAgentsWorkLoadAttestorInfo: []},
}

type AgentsPieChartState = {}

class AgentsPieChart extends React.Component<AgentsPieChartProp, AgentsPieChartState> {
  SpiffeHelper: SpiffeHelper;
  constructor(props:AgentsPieChartProp) {
    super(props);
    this.SpiffeHelper = new SpiffeHelper();
  }

  getChildEntries(agent: {}, agentEntriesDict: {[key: string]: Object[]}) {
    var spiffeid = this.SpiffeHelper.getAgentSpiffeid(agent);
    var validIds = new Set([spiffeid]);

    // Also check for parent IDs associated with the agent
    let agentEntries = agentEntriesDict[spiffeid];
    if (agentEntries !== undefined) {
      for (let j = 0; j < agentEntries.length; j++) {
        validIds.add(this.SpiffeHelper.getEntrySpiffeid(agentEntries[j]));
      }
    }
    if (typeof this.props.globalEntries.globalEntriesList !== "undefined") {
      var check_id = [];
      check_id = this.props.globalEntries.globalEntriesList.filter(
        (thisentry:Object) => {
          return validIds.has(this.SpiffeHelper.getEntryParentid(thisentry));
        }
      );
    }
    if (typeof check_id === "undefined") {
      return {
        group: spiffeid,
        value: 0,
      };
    } else {
      return {
        group: spiffeid,
        value: check_id.length,
      };
    }
  }

  agentList() {
    if (
      typeof this.props.globalEntries.globalEntriesList === "undefined" ||
      typeof this.props.globalAgents.globalAgentsList === "undefined"
    ) {
      return [];
    }
    let agentEntriesDict: any = this.SpiffeHelper.getAgentsEntries(
      this.props.globalAgents.globalAgentsList,
      this.props.globalEntries.globalEntriesList
    );
    var valueMapping = this.props.globalAgents.globalAgentsList.map(
      (currentAgent:Object) => {
        return this.getChildEntries(currentAgent, agentEntriesDict);
      }
    );
    return valueMapping;
  }

  render() {
    var groups = this.agentList();
    return (
      <React.Fragment>
        <Title data-test="pie-chart-title">Number of Workloads per Agent</Title>
        {(groups.length === 0 || groups === undefined) && (
          <p className="no-data" data-test="no-data-display">
            No Data To Display
          </p>
        )}
        {groups.length !== 0 && (
          <PieChart1 data-test="pie-chart" data={groups} />
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: { agents: { globalAgentsList: []; globalAgentsWorkLoadAttestorInfo: []; }; entries: { globalEntriesList: []; }; }) => ({
  globalAgents: state.agents,
  globalEntries: state.entries,
});

// AgentsPieChart.propTypes = {
//   classes: PropTypes.object,
//   globalAgents: PropTypes.objectOf(
//     PropTypes.shape({
//       globalAgentsList: PropTypes.array,
//       globalAgentsWorkLoadAttestorInfo: PropTypes.array,
//     })
//   ),
//   globalEntries: PropTypes.objectOf(
//     PropTypes.shape({
//       globalEntriesList: PropTypes.array,
//     })
//   ),
// };

export default connect(mapStateToProps, {})(AgentsPieChart);

export { AgentsPieChart };
