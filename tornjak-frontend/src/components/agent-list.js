import React, { Component } from 'react';
import { connect } from 'react-redux';
import IsManager from './is_manager';
import Table from "tables/agents-list-table";
import { selectors, workloadSelectors, clusterType } from '../data/data';
import TornjakApi from './tornjak-api-helpers';
import {toast} from 'react-toastify';
import {InlineNotification} from "carbon-components-react";
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

const Agent = props => (
  <tr>
    <td>{props.agent.id.trust_domain}</td>
    <td>{"spiffe://" + props.agent.id.trust_domain + props.agent.id.path}</td>
    <td><div style={{ overflowX: 'auto', width: "400px" }}>
      <pre>{JSON.stringify(props.agent, null, ' ')}</pre>
    </div></td>

    <td>
      {/*
        // <Link to={"/agentView/"+props.agent._id}>view</Link> |
      */}
      <a href="/#" onClick={() => { props.banAgent(props.agent.id) }}>ban</a>
      <br />
      <a href="/#" onClick={() => { props.deleteAgent(props.agent.id) }}>delete</a>
    </td>
  </tr>
)

class AgentList extends Component {
  constructor(props) {
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
      if(this.props.globalTornjakServerInfo !== "") {
        this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.TornjakApi.populateAgentsUpdate(this.props.globalServerSelected, this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
        this.TornjakApi.refreshSelectorsState(this.props.globalServerSelected, this.props.agentworkloadSelectorInfoFunc);
      }
    } else {
        if(prevProps.globalTornjakServerInfo !== this.props.globalTornjakServerInfo)
        {
          this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
          this.TornjakApi.refreshLocalSelectorsState(this.props.agentworkloadSelectorInfoFunc);
        }
    }
    if (this.props.globalErrorMessage !== "OK"){
      toast.error(this.props.globalErrorMessage);
      toast.warn(this.props.globalErrorMessage);
      toast.success(this.props.globalErrorMessage);
      toast.info(this.props.globalErrorMessage);
      // toast(<ToastNotification title="Error" caption={this.props.globalErrorMessage} />, {autoClose:false, closeButton:false});
    }
  }

  agentList() {
    if (typeof this.props.globalAgentsList !== 'undefined') {
      return this.props.globalAgentsList.map(currentAgent => {
        return <Agent key={currentAgent.id.path}
          agent={currentAgent}
          banAgent={this.banAgent}
          deleteAgent={this.deleteAgent} />;
      })
    } else {
      return ""
    }
  }

  render() {
    return (
      <div>
        <h3>Agents List</h3>
        {this.props.globalErrorMessage !== "OK" &&
          <InlineNotification kind="error" title="Error" subtitle={this.props.globalErrorMessage} />
          // <div className="alert-primary" role="alert">
          //   <pre>
          //     {this.props.globalErrorMessage}
          //   </pre>
          // </div>
        }
        <br /><br />
        <div className="indvidual-list-table">
          <Table data={this.agentList()} id="table-1" />
        </div>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalAgentsList: state.agents.globalAgentsList,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessage: state.tornjak.globalErrorMessage,
})

export default connect(
  mapStateToProps,
  { serverSelectedFunc, agentsListUpdateFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc, selectorInfoFunc, tornjakMessageFunc, workloadSelectorInfoFunc, agentworkloadSelectorInfoFunc, clusterTypeInfoFunc }
)(AgentList)
