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
  spireDebugServerInfoUpdateFunc
} from 'redux/actions';
import { RootState } from 'redux/reducers';
import { 
  AgentsList, 
  AgentsWorkLoadAttestorInfo, 
  SelectorInfoLabels, 
  ServerInfo,
  TornjakServerInfo,
  WorkloadSelectorInfoLabels,
  DebugServerInfo,
} from './types';
//import PropTypes from "prop-types"; // needed for testing will be removed on last pr

type AgentListProp = {
  // dispatches a payload for the debug server info of the selected server and has a return type of void
  spireDebugServerInfoUpdateFunc: (globalDebugServerInfo: DebugServerInfo) => void,
  // dispatches a payload for list of available cluster types as array of strings and has a return type of void
  clusterTypeInfoFunc: (globalClusterTypeInfo: string[]) => void,  
  // dispatches a payload for list of available selectors and their options as an object and has a return type of void
  selectorInfoFunc: (globalSelectorInfo: SelectorInfoLabels) => void,  
  // dispatches a payload for list of available workload selectors and their options as an object and has a return type of void
  workloadSelectorInfoFunc: (globalWorkloadSelectorInfo: WorkloadSelectorInfoLabels) => void, 
  // dispatches a payload for list of agents with their metadata info as an array of AgentListType and has a return type of void
  agentsListUpdateFunc: (globalAgentsList: AgentsList[]) => void,  
  // dispatches a payload for an Error Message/ Success Message of an executed function as a string and has a return type of void
  tornjakMessageFunc: (globalErrorMessage: string) => void,  
  // dispatches a payload for the workload selector info for the agents as an array of AgentsWorkLoadAttestorInfoType and has a return type of void
  agentworkloadSelectorInfoFunc: (globalAgentsWorkLoadAttestorInfo: AgentsWorkLoadAttestorInfo[]) => void, 
  // dispatches a payload for the tornjak server info of the selected server and has a return type of void
  tornjakServerInfoUpdateFunc: (globalTornjakServerInfo: TornjakServerInfo) => void, 
  // dispatches a payload for the server trust domain and nodeAttestorPlugin as a ServerInfoType and has a return type of void
  serverInfoUpdateFunc: (globalServerInfo: ServerInfo) => void,  
  // the selected server for manager mode 
  globalServerSelected: string,  
  // error/ success messege returned for a specific function
  globalErrorMessage: string, 
  // tornjak server info of the selected server
  globalTornjakServerInfo: TornjakServerInfo,  
  // list of available agents as array of AgentsListType
  globalAgentsList: AgentsList[], 
}

type AgentListState = {
  message: string, // error/ success messege returned for a specific function for this specific component
}

const Agent = (props: { agent: AgentsList }) => (
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
    this.TornjakApi = new TornjakApi(props);
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
      this.TornjakApi.populateLocalTornjakDebugServerInfo(this.props.spireDebugServerInfoUpdateFunc, this.props.tornjakMessageFunc);
      if (this.props.globalTornjakServerInfo && Object.keys(this.props.globalTornjakServerInfo).length) {
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
    if (this.props.globalAgentsList && this.props.globalAgentsList.length) {
      return this.props.globalAgentsList.map((currentAgent: AgentsList) => {
        return <Agent key={currentAgent.id.path} agent={currentAgent} />
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
  { 
    serverSelectedFunc, 
    agentsListUpdateFunc, 
    tornjakServerInfoUpdateFunc, 
    serverInfoUpdateFunc, 
    selectorInfoFunc, 
    tornjakMessageFunc, 
    workloadSelectorInfoFunc, 
    agentworkloadSelectorInfoFunc, 
    clusterTypeInfoFunc,
    spireDebugServerInfoUpdateFunc 
  }
) (AgentList)

export { AgentList }