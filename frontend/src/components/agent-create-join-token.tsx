import { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import { serverSelectedFunc } from 'redux/actions';
import { RootState } from 'redux/reducers';
import { ToastContainer } from "react-toastify"
import { showResponseToast, showToast } from './error-api';

type CreateJoinTokenProp = {
  globalServerSelected: string,
}

type CreateJoinTokenState = {
  name: string,
  ttl: string,
  token: string,
  spiffeId: string,
  trustDomain: string,
  path: string,
  message: string,
  selectedServer: string,
}

class CreateJoinToken extends Component<CreateJoinTokenProp, CreateJoinTokenState> {
  constructor(props: CreateJoinTokenProp) {
    super(props);
    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeTtl = this.onChangeTtl.bind(this);
    this.onChangeToken = this.onChangeToken.bind(this);
    this.onChangeSpiffeId = this.onChangeSpiffeId.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      name: "",
      ttl: "500",
      token: "",
      spiffeId: "",
      trustDomain: "",
      path: "",
      message: "",
      selectedServer: "",
    }
  }

  componentDidMount() {
    if (IsManager) {
      if (this.props.globalServerSelected !== "") {
        this.setState({ selectedServer: this.props.globalServerSelected });
      }
    } else {
      // agent doesnt need to do anything
      this.setState({})
    }
  }

  componentDidUpdate(prevProps: CreateJoinTokenProp) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.setState({ selectedServer: this.props.globalServerSelected });
      }
    }
  }

  onChangeName(e: { target: { value: string; }; }): void {
    this.setState({
      name: e.target.value
    });
  }

  onChangeTtl(e: { target: { value: string; }; }): void {
    this.setState({
      ttl: e.target.value 
    });
  }

  onChangeToken(e: { target: { value: string; }; }): void {
    this.setState({
      token: e.target.value
    });
  }

  parseSpiffeId(sid: string): [boolean, string, string] {
    var prefix = "spiffe://";
    if (sid.startsWith(prefix)) {
      var sub = sid.substr(prefix.length)
      var sp = sub.indexOf("/")
      if (sp > 0 && sp !== sub.length - 1) {
        var trustDomain = sub.substr(0, sp);
        var path = sub.substr(sp);
        return [true, trustDomain, path];
      }
    }
    return [false, "", ""];
  }

  onChangeSpiffeId(e: { target: { value: string; }; }): void {
    this.setState({
      spiffeId: e.target.value
    })
  }

  getApiTokenEndpoint(): string {
    if (!IsManager) {
      return GetApiServerUri('/api/agent/createjointoken')
    } else if (IsManager && this.state.selectedServer !== "") {
      return GetApiServerUri('/manager-api/agent/createjointoken') + "/" + this.state.selectedServer
    } else {
      this.setState({ message: "Error: No server selected" })
      return ""
    }


  }
  onSubmit(e: { preventDefault: () => void; }): void {
    e.preventDefault()

    if (this.state.ttl === "") {
      showToast({caption: "The TTL cannot be empty."})
      return
    } else if (isNaN(Number(this.state.ttl))) {
      showToast({caption: "The TTL must be an integer."})
    } else if (Number(this.state.ttl) <= 0) {
      showToast({caption: "The TTL must be positive."})
      return
    }

    const cjtData = {
      ttl: Number(this.state.ttl), 
      trust_domain: "", 
      path: "", 
      token: this.state.token
    }

    if (this.state.spiffeId) {
      const [isIdValid, trustDomain, path] = this.parseSpiffeId(this.state.spiffeId)
      
      if (!isIdValid) {
        showToast({caption: "The SPIFFE id is invalid."})
        return
      }

      cjtData.trust_domain = trustDomain
      cjtData.path = path
    }

    let endpoint = this.getApiTokenEndpoint()

    if (!endpoint) {
      return
    }

    axios.post(endpoint, cjtData)
      .then(res => this.setState({ message: "Request:" + JSON.stringify(cjtData, null, ' ') + "\n\nSuccess:" + JSON.stringify(res.data, null, ' ') }))
      .catch(err => showResponseToast(err, {caption: "Could not create join token."}))
  }

  render() {
    return (
      <div data-test="agent-create-token">
        <h3>Create New Agent Join Token</h3>
        <form onSubmit={this.onSubmit}>
          <div className="alert-primary" role="alert">
            <pre>
              {this.state.message}
            </pre>
          </div>
          {IsManager}
          <br /><br />

          <div className="form-group">
            <label>Time to live (TTL): </label>
            <input type="number"
              className="form-control"
              value={this.state.ttl}
              onChange={this.onChangeTtl}
            />
          </div>


          <div className="form-group">
            <label>Token (optional): i.e. 1adcc067-18e5-4d6f-be97-aa74b5ba5c28</label>
            <input type="text"
              className="form-control"
              value={this.state.token}
              onChange={this.onChangeToken}
            />
          </div>

          <div className="form-group">
            <label>SPIFFE ID (optional): i.e. spiffe://example.org/sample/spiffe/id</label>
            <input type="text"
              className="form-control"
              value={this.state.spiffeId}
              onChange={this.onChangeSpiffeId}
            />
          </div>
          <div className="form-group">
            <input type="submit" value="Create Join Token" className="btn btn-primary" />
          </div>
        </form>
        <ToastContainer
          className="carbon-toast"
          containerId="notifications"
          draggable={false}
        />
      </div>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  globalServerSelected: state.servers.globalServerSelected,
})

// Note: Needed for UI testing - will be removed after
// CreateJoinToken.propTypes = {
//   serverSelectedFunc: PropTypes.func,
//   globalServerSelected: PropTypes.string,
// };

export default connect(
  mapStateToProps,
  { serverSelectedFunc }
)(CreateJoinToken)

export { CreateJoinToken };