import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import GetApiServerUri from './helpers';

const Agent = props => (
  <tr>
    <td>{props.agent.id.trust_domain}</td>
    <td>{ "spiffe://" + props.agent.id.trust_domain + props.agent.id.path}</td>
    <td><div style={{overflowX: 'auto', width: "400px"}}>
    <pre>{JSON.stringify(props.agent, null, ' ')}</pre>
    </div></td>

    <td>
      {/*
        // <Link to={"/agentView/"+props.agent._id}>view</Link> |
      */}
      <a href="#" onClick={() => { props.banAgent (props.agent.id) }}>ban</a>
      <br/>
      <a href="#" onClick={() => { props.deleteAgent (props.agent.id) }}>delete</a>
    </td>
  </tr>
)

export default class AgentList extends Component {
  constructor(props) {
    super(props);
    this.deleteAgent = this.deleteAgent.bind(this);
    this.banAgent = this.banAgent.bind(this);
    this.state = { agents: [] };
  }

  componentDidMount() {
    axios.get(GetApiServerUri('/api/agent/list'), { crossdomain: true })
      .then(response => {
        this.setState({ agents:response.data["agents"]} );
      })
      .catch((error) => {
        console.log(error);
      })
  }

  banAgent(id) {
    axios.post(GetApiServerUri('/api/agent/ban'), {
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
    axios.post(GetApiServerUri('/api/agent/delete'), {
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
                    deleteAgent={this.deleteAgent}/>;
        })
    } else {
        return ""
    }
  }

  render() {
    return (
      <div>
        <h3>Agent List</h3>
        <table className="table" style={{width : "100%"}}>
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
        </table>
      </div>
    )
  }
}
