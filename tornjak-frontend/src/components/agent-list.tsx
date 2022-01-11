import React, { Component } from 'react';
import { connect } from 'react-redux';
import IsManager from './is_manager';
import Table from "tables/agents-list-table";
import { selectors, workloadSelectors, clusterType } from '../data/data';
import TornjakApi from './tornjak-api-helpers';
import {
  serverSelectedFunc,
  agentsListUpdateFunc,
  tornjakServerInfoUpdateFunc,
  serverInfoUpdateFunc,
  selectorInfoFunc,
  tornjakMessageFunc,
  workloadSelectorInfoFunc,
  agentworkloadSelectorInfoFunc,
  clusterTypeInfoFunc,
} from 'redux/actions';
import { RootState } from 'redux/reducers';
import {
  AgentsListType,
} from 'redux/actions/types'
//import PropTypes from "prop-types";

type AgentListProp = {
  clusterTypeInfoFunc: Function,
  selectorInfoFunc: Function,
  workloadSelectorInfoFunc: Function,
  agentsListUpdateFunc: Function,
  tornjakMessageFunc: Function,
  agentworkloadSelectorInfoFunc: Function,
  tornjakServerInfoUpdateFunc: Function,
  serverInfoUpdateFunc: Function,
  globalServerSelected: string,
  globalErrorMessage: string,
  globalTornjakServerInfo: Object,
  agent: Object,
  globalAgentsList: AgentsListType[] | undefined,
}

type AgentListState = {
  message: string,
}

const Agent = (props: { agent: AgentsListType }) => (
  <tr>
    <td>{props.agent.id.trust_domain}</td>
    <td>{"spiffe://" + props.agent.id.trust_domain + props.agent.id.path}</td>
    <td><div style={{ overflowX: 'auto', width: "400px" }}>
      <pre>{JSON.stringify(props.agent, null, ' ')}</pre>
    </div></td>
  </tr>
)

class AgentList extends Component<AgentListProp, AgentListState> {
  TornjakApi: TornjakApi;
  constructor(props: AgentListProp) {
    super(props);
    this.TornjakApi = new TornjakApi();
    this.state = {
      message: "",
    };
  }

  componentDidMount() {
    this.props.clusterTypeInfoFunc(clusterType); //set cluster type info
    this.props.selectorInfoFunc(selectors); //set selector info
    this.props.workloadSelectorInfoFunc(workloadSelectors); //set workload selector info
    if (IsManager) {
      if (this.props.globalServerSelected !== "") {
        this.TornjakApi.populateAgentsUpdate(this.props.globalServerSelected, this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc)
        this.TornjakApi.refreshSelectorsState(this.props.globalServerSelected, this.props.agentworkloadSelectorInfoFunc);
        this.TornjakApi.populateTornjakServerInfo(this.props.globalServerSelected, this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
      }
    } else {
      this.TornjakApi.refreshLocalSelectorsState(this.props.agentworkloadSelectorInfoFunc);
      this.TornjakApi.populateLocalAgentsUpdate(this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
      this.TornjakApi.populateLocalTornjakServerInfo(this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
      if (this.props.globalTornjakServerInfo !== "" && JSON.stringify(this.props.globalTornjakServerInfo) !== '{}') {
        this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
      }
    }
  }

  componentDidUpdate(prevProps: AgentListProp) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.TornjakApi.populateAgentsUpdate(this.props.globalServerSelected, this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
        this.TornjakApi.refreshSelectorsState(this.props.globalServerSelected, this.props.agentworkloadSelectorInfoFunc);
      }
    } else {
      if (prevProps.globalTornjakServerInfo !== this.props.globalTornjakServerInfo) {
        this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
        this.TornjakApi.refreshLocalSelectorsState(this.props.agentworkloadSelectorInfoFunc);
      }
    }
  }

  agentList() {
    if (typeof this.props.globalAgentsList !== 'undefined') {
      return this.props.globalAgentsList.map((currentAgent: AgentsListType) => {
        return <Agent key={currentAgent.id.path}
          agent={currentAgent} />;
      })
    } else {
      return ""
    }
  }

  render() {
    return (
      <div data-test="agent-list">
        <h3>Agents List</h3>
        {this.props.globalErrorMessage !== "OK" &&
          <div className="alert-primary" role="alert">
            <pre>
              {this.props.globalErrorMessage}
            </pre>
          </div>
        }
        <br /><br />
        <div className="indvidual-list-table">
          <Table data={this.agentList()} id="table-1" />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalAgentsList: state.agents.globalAgentsList,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessage: state.tornjak.globalErrorMessage,
})

// Note: Needed for UI testing - will be removed after
// AgentList.propTypes = {
//   globalServerSelected: PropTypes.string,
//   globalAgentsList: PropTypes.array,
//   globalTornjakServerInfo: PropTypes.object,
//   globalErrorMessage: PropTypes.string,
//   serverSelectedFunc: PropTypes.func,
//   agentsListUpdateFunc: PropTypes.func,
//   tornjakServerInfoUpdateFunc: PropTypes.func,
//   serverInfoUpdateFunc: PropTypes.func,
//   clusterTypeList: PropTypes.array,
//   agentsList: PropTypes.array,
//   selectorInfoFunc: PropTypes.func,
//   tornjakMessageFunc: PropTypes.func,
//   workloadSelectorInfoFunc: PropTypes.func,
//   agentworkloadSelectorInfoFunc: PropTypes.func,
//   clusterTypeInfoFunc: PropTypes.func,
// };

export default connect(
  mapStateToProps,
  { serverSelectedFunc, agentsListUpdateFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc, selectorInfoFunc, tornjakMessageFunc, workloadSelectorInfoFunc, agentworkloadSelectorInfoFunc, clusterTypeInfoFunc }
)(AgentList)

export { AgentList };