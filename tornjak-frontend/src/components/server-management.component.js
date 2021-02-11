import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios'
import GetApiServerUri from './helpers';
import IsManager from './is_manager';

const Server = props => (
  <tr>
    <td>{props.server.name}</td>
    <td>{props.server.address}</td>
  </tr>
)

export default class ServerManagement extends Component {
  constructor(props) {
    super(props);
    this.state = {
        servers: [],
        formServerName: "",
        formServerAddress: "",
    };
    this.onChangeFormServerName = this.onChangeFormServerName.bind(this);
    this.onChangeFormServerAddress = this.onChangeFormServerAddress.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
      this.refreshServerState()
  }


  refreshServerState () {
    axios.get(GetApiServerUri("/manager-api/server/list"), { crossdomain: true })
      .then(response => {
          console.log(response.data);
        this.setState({ servers:response.data["servers"]} );
      })
      .catch((error) => {
        console.log(error);
      })
  }

  serverList() {
      //return this.state.servers.toString()
    if (typeof this.state.servers !== 'undefined') {
        return this.state.servers.map(s => {
          return <Server key={s.name} 
                    server={s} />;
        })
    } else {
        return ""
    }
  }

  onChangeFormServerName(e) {
    this.setState({
      formServerName: e.target.value
    });
  }

  onChangeFormServerAddress(e) {
    this.setState({
      formServerAddress: e.target.value
    });
  }

  onSubmit(e) {
    e.preventDefault();

    var cjtData = {
        "name": this.state.formServerName,
        "address": this.state.formServerAddress,
    };

    axios.post(GetApiServerUri('/manager-api/server/register'), cjtData)
      .then(res => this.setState({ message: "Requst:" + JSON.stringify(cjtData,null,  ' ')+ "\n\nSuccess:" + JSON.stringify(res.data, null, ' ')}))
      .catch(err => this.setState({ message: "ERROR:" + err }))

    this.refreshServerState()
    //window.location = '/';
  }


  render() {
    if (!IsManager) {
        return <h1>Only manager deplayments have use of this page</h1>
    }
    return (
      <div>
        <h3> Register New Server </h3>
        <form onSubmit={this.onSubmit}>
          
          <div className="form-group">
            <label>Server Name (Unique)</label>
            <input type="text"
              required
              className="form-control"
              value={this.state.formServerName}
              onChange={this.onChangeFormServerName}
            />
          </div>


          <div className="form-group">
            <label>Address (i.e. http://localhost:5000/) </label>
            <input type="text"
              required
              className="form-control"
              value={this.state.token}
              onChange={this.onChangeFormServerAddress}
            />
          </div>


          <div className="form-group">
            <input type="submit" value="Register Server" className="btn btn-primary" />
          </div>
        </form>

        <div className="alert alert-primary" role="alert">
        <pre>
           {this.state.message}
        </pre>
        </div>


        <h3>Server List</h3>
        <table className="table" style={{width : "100%"}}>
          <thead className="thead-light">
            <tr>
              <th>Server Name</th>
              <th>Address</th>
            </tr>
          </thead>
          <tbody>
            {this.serverList()}
          </tbody>
        </table>
      </div>
    )
  }
}
