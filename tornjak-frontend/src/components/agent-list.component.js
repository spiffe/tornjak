import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import Table from "tables/agentsListTable";
import {
  serverSelected,
  agentsListUpdate
} from 'actions';

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
      <a href="#" onClick={() => { props.banAgent(props.agent.id) }}>ban</a>
      <br />
      <a href="#" onClick={() => { props.deleteAgent(props.agent.id) }}>delete</a>
    </td>
  </tr>
)

class AgentList extends Component {
  constructor(props) {
    super(props);
    this.state = {
      message: "",
    };
  }

  componentDidMount() {
    if (IsManager) {
      if (this.props.globalServerSelected !== "") {
        this.populateAgentsUpdate(this.props.globalServerSelected)
      }
    } else {
      this.populateLocalAgentsUpdate()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
      this.populateAgentsUpdate(this.props.globalServerSelected)
    }
  }

  populateAgentsUpdate(serverName) {
    axios.get(GetApiServerUri('/manager-api/agent/list/') + serverName, { crossdomain: true })
      .then(response => {
        console.log(response);
        this.props.agentsListUpdate(response.data["agents"]);
      }).catch(error => {
        this.setState({
          message: "Error retrieving " + serverName + " : " + error.message
        });
        this.props.agentsListUpdate([]);
      });

  }

  populateLocalAgentsUpdate() {
    axios.get(GetApiServerUri('/api/agent/list'), { crossdomain: true })
      .then(response => {
        this.props.agentsListUpdate(response.data["agents"]);
      })
      .catch((error) => {
        console.log(error);
      })
  }

  agentList() {
    if (typeof this.props.globalagentsList !== 'undefined') {
      return this.props.globalagentsList.map(currentAgent => {
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
        <h3>Agent List</h3>
        <div className="alert-primary" role="alert">
          <pre>
            {this.state.message}
          </pre>
        </div>
        {IsManager}
        <br /><br />
        <div className="indvidual-list-table">
          <Table data={this.agentList()} id="table-1" />
        </div>
      </div>
    )
  }
}


const mapStateToProps = (state) => ({
  globalServerSelected: state.serverInfo.globalServerSelected,
  globalagentsList: state.serverInfo.globalagentsList,
})

export default connect(
  mapStateToProps,
  { serverSelected, agentsListUpdate }
)(AgentList)