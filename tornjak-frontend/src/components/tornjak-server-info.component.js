import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';

const TornjakServerInfoDisplay = props => (
    <p>
    <pre>
        {props.tornjakServerInfo}
    </pre>
    </p>
)

const ServerDropdown = props => (
    <option value={props.value}>{props.name}</option>
)

export default class TornjakServerInfo extends Component {
  constructor(props) {
    super(props);
    this.serverDropdownList = this.serverDropdownList.bind(this);
    this.onServerSelect = this.onServerSelect.bind(this);
    this.state = { 
        tornjakServerInfo: "",
        servers: [],
        selectedServer: "",
        message: "",
    };
  }

  componentDidMount() {
      if (IsManager) {
        this.populateServers()
      } else {
        this.populateLocalTornjakServerInfo()
      }
  }

  populateServers () {
    axios.get(GetApiServerUri("/manager-api/server/list"), { crossdomain: true })
      .then(response => {
        this.setState({ servers:response.data["servers"]} );
      })
      .catch((error) => {
        console.log(error);
      })
  }

  populateTornjakServerInfo(serverName) {
      axios.get(GetApiServerUri('/manager-api/tornjak/serverinfo/') + serverName, {     crossdomain: true })
      .then(response =>{
        console.log(response);
        this.setState({ tornjakServerInfo: response.data["serverinfo"]});
      }).catch(error => {
          this.setState({
              message: "Error retrieving " + serverName + " : "+ error.message,
              agents: [],
          });
      });

  }

  populateLocalTornjakServerInfo() {
    axios.get(GetApiServerUri('/api/tornjak/serverinfo'), { crossdomain: true })
      .then(response => {
        this.setState({ tornjakServerInfo:response.data["serverinfo"]});
      })
      .catch((error) => {
        console.log(error);
      })
  }

  tornjakServerInfo() {
    if (this.state.tornjakServerInfo === "") {
        return ""
    } else {
        return <TornjakServerInfoDisplay tornjakServerInfo={this.state.tornjakServerInfo} />
    }
  }

  serverDropdownList() {
    if (typeof this.state.servers !== 'undefined') {
        return this.state.servers.map(server => {
          return <ServerDropdown key={server.name}
                    value={server.name}
                    name={server.name} />
        })
    } else {
        return ""
    }
  }

  onServerSelect(e) {
      const serverName = e.target.value;
      this.setState({selectedServer: serverName})
      if (serverName !== "") {
          this.populateTornjakServerInfo(serverName)
      }
  }

  getServer(serverName) {
      var i;
      const servers = this.state.servers
      for (i = 0; i < servers.length; i++) {
        if (servers[i].name === serverName) {
            return servers[i]
        }
      }
      return null
  }

  render() {

    let managerServerSelector =  (
        <div id="server-dropdown-div">
        <label id="server-dropdown">Choose a server:</label>
        <br/>
        <select name="servers" id="servers" onChange={this.onServerSelect}>
          <optgroup label="Servers">
            <option value=""/>
                {this.serverDropdownList()}
          </optgroup>
        </select>
        </div>
    )

    return (
      <div>
        <h3>Server Info</h3>
        <div className="alert alert-primary" role="alert">
        <pre>
           {this.state.message}
        </pre>
        </div>
        {IsManager && managerServerSelector}
        <br/><br/>
        {this.tornjakServerInfo()}
      </div>
    )
  }
}
