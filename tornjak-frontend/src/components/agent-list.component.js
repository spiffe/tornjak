import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import Table from "tables/agentsListTable";
import {
  serverSelected
} from 'actions';

const UniqueData = props => (
  { 'trustdomain': props.agent.id.trust_domain, 
    'id': "spiffe://" + props.agent.id.trust_domain + props.agent.id.path, 
    'info': JSON.stringify(props.agent, null, ' '),
    'actions': props.agent.id.trust_domain
  }
)
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
    this.deleteAgent = this.deleteAgent.bind(this);
    this.banAgent = this.banAgent.bind(this);
    this.state = {
      agents: [],
      servers: [],
      selectedServer: "",
      message: "",
    };
  }

  componentDidMount() {
    if (IsManager) {
      if (this.props.globalServerSelected !== "") {
        this.populateAgents(this.props.globalServerSelected)
      }
    } else {
      this.populateLocalAgents()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
      this.populateAgents(this.props.globalServerSelected)
    }
  }

  populateAgents(serverName) {
    axios.get(GetApiServerUri('/manager-api/agent/list/') + serverName, { crossdomain: true })
      .then(response => {
        console.log(response);
        this.setState({ agents: response.data["agents"] });
      }).catch(error => {
        this.setState({
          message: "Error retrieving " + serverName + " : " + error.message,
          agents: [],
        });
      });

  }

  populateLocalAgents() {
    axios.get(GetApiServerUri('/api/agent/list'), { crossdomain: true })
      .then(response => {
        this.setState({ agents: response.data["agents"] });
      })
      .catch((error) => {
        console.log(error);
      })
  }

  banAgent(id) {
    var endpoint = ""
    if (IsManager) {
      endpoint = GetApiServerUri('/manager-api/agent/ban') + "/" + this.state.selectedServer
    } else {
      endpoint = GetApiServerUri('/api/agent/ban')
    }

    axios.post(endpoint, {
      "id": {
        "trust_domain": id.trust_domain,
        "path": id.path,
      }
    })
      .then(res => console.log(res.data), alert("Ban SUCCESS"), this.componentDidMount());
    this.setState({
      agents: this.state.agents.filter(el => el._id !== id)
    })
  }

  deleteAgent(id) {
    var endpoint = ""
    if (IsManager) {
      endpoint = GetApiServerUri('/manager-api/agent/delete') + "/" + this.state.selectedServer
    } else {
      endpoint = GetApiServerUri('/api/agent/delete')
    }

    axios.post(endpoint, {
      "id": {
        "trust_domain": id.trust_domain,
        "path": id.path,
      }
    })
      .then(res => console.log(res.data))
    this.setState({
      agents: this.state.agents.filter(el =>
        el.id.trust_domain !== id.trust_domain ||
        el.id.path !== id.path)
    })
  }

  agentList() {
    //return this.state.agents.toString()
    if (typeof this.state.agents !== 'undefined') {
      return this.state.agents.map(currentAgent => {
        return <Agent key={currentAgent.id.path}
          agent={currentAgent}
          banAgent={this.banAgent}
          deleteAgent={this.deleteAgent} />;
      })
    } else {
      return ""
    }
  }

  agentList2() {
    //return this.state.agents.toString()
    if (typeof this.state.agents !== 'undefined') {
      return this.state.agents.map(currentAgent => {
        return <UniqueData 
                  trustdomain={currentAgent.id.trust_domain}
                  key={currentAgent.id.path}
                  id={currentAgent.id.path}
                  agent={currentAgent} />;
      })
    } else {
      return ""
    }
  }

  render() {
    console.log("ghf", this.agentList())
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

        {/* <table className="table" style={{ width: "100%" }}>
          <thead className="thead-light">
            <tr>
              <th>Trust Domain</th>
              <th>SPIFFE ID</th>
              <th>Info</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {this.agentList()}
          </tbody>
        </table> */}
        <div className="indviduallisttable">
          <Table data={this.agentList()} id="table-1" />
        </div>
      </div>
    )
  }
}


const mapStateToProps = (state) => ({
  globalServerSelected: state.serverInfo.globalServerSelected,
})

export default connect(
  mapStateToProps,
  { serverSelected }
)(AgentList)