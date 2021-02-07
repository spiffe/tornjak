import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'
import GetApiServerUri from './helpers';
import IsManager from './is_manager';

const Entry = props => (
  <tr>
    <td>{props.entry.id}</td>
    <td>{ "spiffe://" + props.entry.spiffe_id.trust_domain + props.entry.spiffe_id.path}</td>
    <td>{ "spiffe://" + props.entry.parent_id.trust_domain + props.entry.parent_id.path}</td>
    <td>{ props.entry.selectors.map(s => s.type + ":" + s.value).join(', ')}</td>
    
    <td>
      {/* <Link to={"/entryView/"+props.entry._id}>view</Link>*/}
      <br/>
      <a href="#" onClick={() => { props.deleteEntry (props.entry.id) }}>delete</a>
    </td>

    <td><div style={{overflowX: 'auto', width: "400px"}}>
    <pre>{JSON.stringify(props.entry, null, ' ')}</pre>
    </div></td>

  </tr>
)

const ServerDropdown = props => (
    <option value={props.value}>{props.name}</option>
)

export default class EntryList extends Component {
  constructor(props) {
    super(props);
    this.deleteEntry = this.deleteEntry.bind(this);
    this.serverDropdownList = this.serverDropdownList.bind(this);
    this.onServerSelect = this.onServerSelect.bind(this);
    this.state = { 
        servers: [],
        entries: [],
        message: "",
    };
  }

  componentDidMount() {
    if (IsManager) {
        this.populateServers()
    } else {
        this.populateLocalEntries()
    }
  }

  populateServers () {
    axios.get("http://localhost:50000" + "/manager-api/server/list", { crossdomain: true })
      .then(response => {
        this.setState({ servers:response.data["servers"]} );
      })
      .catch((error) => {
        console.log(error);
      })
  }

  populateEntries(serverName) {
      axios.get('http://localhost:50000/manager-api/entry/list/' + serverName, {     crossdomain: true })
      .then(response =>{
        console.log(response);
        this.setState({ entries:response.data["entries"]});
      }).catch(error => {
          this.setState({ 
              message: "Error retrieving " + serverName + " : "+ error.message,
              entries: [],
          });
      });

  }

  populateLocalEntries() {
      axios.get('/api/entry/list', {crossdomain: true })
      .then(response => {
          console.log(response.data);
        this.setState({ entries:response.data["entries"]} );
      })
      .catch((error) => {
        console.log(error);
      })
  }


  deleteEntry(id) {
    axios.post(GetApiServerUri('/api/entry/delete'), {
        "ids": [id]
    })
      .then(res => { console.log(res.data)
        this.setState({
          entries: this.state.entries.filter(el => el.id !== id)
        })
      })
  }

  entryList() {
      //return this.state.entries.toString()
    if (typeof this.state.entries !== 'undefined') {
        return this.state.entries.map(currentEntry => {
          return <Entry key={currentEntry.id} 
                    entry={currentEntry} 
                    deleteEntry={this.deleteEntry}/>;
        })
    } else {
        return ""
    }
  }

  serverDropdownList() {
      //return this.state.entries.toString()
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
      if (serverName !== "") {
          this.populateEntries(serverName)
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
        <h3>Entry List</h3>
        <div className="alert alert-primary" role="alert">
        <pre>
           {this.state.message}
        </pre>
        </div>
        {IsManager && managerServerSelector}
        <br/><br/>

        <table className="table" style={{width : "100%"}}>
          <thead className="thead-light">
            <tr>
              <th>ID</th>
              <th>SPIFFE ID</th>
              <th>Parent ID</th>
              <th>Selectors</th>
              <th>Actions</th>
              <th>Details</th>
            </tr>
          </thead>
          <tbody>
            {this.entryList()}
          </tbody>
        </table>
      </div>
    )
  }
}
