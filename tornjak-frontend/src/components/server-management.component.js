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
        formTLS: false,
        formMTLS: false,
        formCertData: null,
        formKeyData: null,
    };
    this.onCertFileChange = this.onCertFileChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
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

  handleInputChange(e) {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;

    this.setState({
      [name]: value
    });
  }


  onCertFileChange = event => {
    // Update the state
    const reader = new FileReader();
    reader.onload = e => {
      this.setState({ 
          formCertData: (new Buffer(e.target.result)).toString("base64"),
      });
    }
    reader.readAsText(event.target.files[0])
  };

  onSubmit(e) {
    e.preventDefault();

    console.log("onSubmit");
    console.log(this.state.certData);
    var cjtData = {
        "name": this.state.formServerName,
        "address": this.state.formServerAddress,
        "tls": this.state.formTLS,
        "mtls": this.state.formMTLS,
        "cert": this.state.formCertData,
        "key": this.state.formKeyData,
    };
    console.log(cjtData);

    axios.post(GetApiServerUri('/manager-api/server/register'), cjtData)
      .then(res => this.setState({ message: "Requst:" + JSON.stringify(cjtData,null,  ' ')+ "\n\nSuccess:" + JSON.stringify(res.data, null, ' ')}))
      .catch(err => this.setState({ message: "ERROR:" + err }))

    this.refreshServerState()
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
              name="formServerName"
              required
              className="form-control"
              value={this.state.formServerName}
              onChange={this.handleInputChange}
            />
          </div>


          <div className="form-group">
            <label>Address (i.e. http://localhost:5000/) </label>
            <input type="text"
              name="formServerAddress"
              required
              className="form-control"
              value={this.state.formServerAddress}
              onChange={this.handleInputChange}
            />
          </div>

          <div name="tls-checkbox-input">
          <input
            name="formTLS"
            type="checkbox"
            checked={this.state.formTLS}
            onChange={this.handleInputChange}
            />
            TLS Enabled
          </div>

          <div name="mtls-checkbox-input">
          <input
            name="formMTLS"
            type="checkbox"
            checked={this.state.formMTLS}
            onChange={this.handleInputChange}
            />
            mTLS Enabled
          </div>

          <input type="certFile" onChange={this.onCertFileChange} />


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
