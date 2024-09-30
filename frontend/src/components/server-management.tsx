import { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios'
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import {
  serversListUpdateFunc
} from 'redux/actions';
import { showResponseToast } from './error-api';
import { ServersList } from './types'
import { RootState } from 'redux/reducers';

type ServerManagementProp = {
  // returns the list of available servers and their basic info
  serversListUpdateFunc: (globalServersList: ServersList[]) => void,
  // the list of available servers and their basic info
  globalServersList: ServersList[],

}

type ServerManagementState = {
  formServerName: string,
  formServerAddress: string,
  formTLS: boolean,
  formMTLS: boolean,
  formCAData: string | null,
  formCertData: string | null,
  formKeyData: string | null,
  CAFileText?: string,
  certFileText?: string,
  keyFileText?: string,
  message: string,
}

const Server = (props: { server: ServersList }) => (
  <tr>
    <td>{props.server.name}</td>
    <td>{props.server.address}</td>
    <td>{(props.server.mtls && "mTLS") || (props.server.tls && "TLS") || "None"}</td>
  </tr>
)

class ServerManagement extends Component<ServerManagementProp, ServerManagementState> {
  constructor(props: ServerManagementProp) {
    super(props);
    this.state = {
      formServerName: "",
      formServerAddress: "",
      formTLS: false,
      formMTLS: false,
      formCAData: null,
      formCertData: null,
      formKeyData: null,
      CAFileText: "",
      certFileText: "",
      keyFileText: "",
      message: "",
    };
    this.onCertFileChange = this.onCertFileChange.bind(this);
    this.onCAFileChange = this.onCAFileChange.bind(this);
    this.onKeyFileChange = this.onKeyFileChange.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  componentDidMount() {
    this.refreshServerState()
  }

  refreshServerState() {
    axios.get(GetApiServerUri("/manager-api/server/list"), { crossdomain: true })
      .then(response => {
        console.log(response.data);
        this.props.serversListUpdateFunc(response.data["servers"]);
      })
      .catch((error) => showResponseToast(error, { caption: "Could not refresh server state." }))
  }

  serverList() {
    if (typeof this.props.globalServersList !== 'undefined') {
      return this.props.globalServersList.map(s => {
        return <Server key={s.name}
          server={s} />;
      })
    } else {
      return ""
    }
  }

  handleInputChange(e: { target: any; }) {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    const name = target.name;
    this.setState((prevState: ServerManagementState) => ({
      ...prevState,
      [name]: value
    }));
  }


  onCAFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && e.target.result) {
          const result = e.target.result;
  
          // Handle string and ArrayBuffer cases
          if (typeof result === "string") {
            this.setState({
              formCAData: Buffer.from(result).toString("base64"),
              CAFileText: "CA file load success",
            });
          } else if (result instanceof ArrayBuffer) {
            this.setState({
              formCAData: Buffer.from(new Uint8Array(result)).toString("base64"),
              CAFileText: "CA file load success",
            });
          }
        }
      };
      reader.readAsText(files[0]);
    }
  };
  
  onCertFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && e.target.result) {
          const result = e.target.result;
  
          // Handle string and ArrayBuffer cases
          if (typeof result === "string") {
            this.setState({
              formCertData: Buffer.from(result).toString("base64"),
              certFileText: "cert file load success",
            });
          } else if (result instanceof ArrayBuffer) {
            this.setState({
              formCertData: Buffer.from(new Uint8Array(result)).toString("base64"),
              certFileText: "cert file load success",
            });
          }
        }
      };
      reader.readAsText(files[0]);
    }
  };
  
  onKeyFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files && files[0]) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        if (e.target && e.target.result) {
          const result = e.target.result;
  
          // Handle string and ArrayBuffer cases
          if (typeof result === "string") {
            this.setState({
              formKeyData: Buffer.from(result).toString("base64"),
              keyFileText: "key file load success",
            });
          } else if (result instanceof ArrayBuffer) {
            this.setState({
              formKeyData: Buffer.from(new Uint8Array(result)).toString("base64"),
              keyFileText: "key file load success",
            });
          }
        }
      };
      reader.readAsText(files[0]);
    }
  };
  
  


  onSubmit(e: { preventDefault: () => void; }) {
    e.preventDefault();

    console.log("onSubmit");
    var cjtData = {
      "name": this.state.formServerName,
      "address": this.state.formServerAddress,
      "tls": this.state.formTLS,
      "mtls": this.state.formMTLS,
      "ca": this.state.formCAData,
      "cert": this.state.formCertData,
      "key": this.state.formKeyData,
    };
    axios.post(GetApiServerUri('/manager-api/server/register'), cjtData)
      .then(res => {
        this.setState({ message: "Requst:" + JSON.stringify(cjtData, null, ' ') + "\n\nSuccess:" + JSON.stringify(res.data, null, ' ') });
        this.refreshServerState();
      }
      )
      .catch(err => this.setState({ message: "ERROR:" + err + (typeof (err.response) !== "undefined" ? err.response.data : "") }))

  }


  render() {
    if (!IsManager) {
      return <h1>Only manager deployments have use of this page</h1>
    }

    const tlsFormOptions = (
      <div> CA File (for (m)TLS):
        <input name="CAfile" type="file" onChange={this.onCAFileChange} />
        {this.state.CAFileText}
      </div>
    )

    const mtlsFormOptions = (
      <div>
        <div>
          Cert File (for mTLS):
          <input name="certfile" type="file" onChange={this.onCertFileChange} />
          {this.state.certFileText}
        </div>
        <div> Key File (for mTLS):
          <input name="keyfile" type="file" onChange={this.onKeyFileChange} />
          {this.state.keyFileText}
        </div>
      </div>
    )

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

          <div>
            <input
              name="formTLS"
              type="checkbox"
              checked={this.state.formTLS}
              onChange={this.handleInputChange}
            />
            TLS Enabled
          </div>
          {this.state.formTLS && tlsFormOptions}

          <div>
            <input
              name="formMTLS"
              type="checkbox"
              checked={this.state.formMTLS}
              onChange={this.handleInputChange}
            />
            mTLS Enabled
          </div>
          {this.state.formMTLS && mtlsFormOptions}

          <div className="form-group">
            <br></br>
            <input type="submit" value="Register Server" className="btn btn-primary" />
          </div>
        </form>

        <div className="alert-primary" role="alert">
          <pre>
            {this.state.message}
          </pre>
        </div>


        <h3>Server List</h3>
        <table className="table" style={{ width: "100%" }}>
          <thead className="thead-light">
            <tr>
              <th>Server Name</th>
              <th>Address</th>
              <th>TLS?</th>
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

const mapStateToProps = (state: RootState) => ({
  globalServersList: state.servers.globalServersList
})

export default connect(
  mapStateToProps,
  { serversListUpdateFunc }
)(ServerManagement)
