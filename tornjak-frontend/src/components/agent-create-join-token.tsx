import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import {
  serverSelectedFunc
} from 'redux/actions';
// import PropTypes from "prop-types";

type CreateJoinTokenProp = {
  globalServerSelected: string, 

}

type CreateJoinTokenState = {
  name: string,
  ttl: number,
  token: string,
  spiffeId: string,
  trustDomain: string | boolean,
  path: string | boolean,
  message: string,
  servers: [],
  selectedServer: string,
  //tags: any
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
      ttl: 500,
      token: "",
      spiffeId: "",
      trustDomain: "",
      path: "",
      message: "",
      servers: [],
      selectedServer: "",
      //tags: ""
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


  onChangeName(e: { target: { value: string; }; }) {
    this.setState({
      name: e.target.value
    });
  }

  onChangeTtl(e: { target: { value: string; }; }) {
    this.setState({
      ttl: Number(e.target.value)
    });
  }

  onChangeToken(e: { target: { value: string; }; }) {
    this.setState({
      token: e.target.value
    });
  }

  parseSpiffeId(sid: string) {
    if (sid.startsWith('spiffe://')) {
      var sub = sid.substr("spiffe://".length)
      var sp = sub.indexOf("/")
      if (sp > 0 && sp !== sub.length - 1) {
        var trustDomain = sub.substr(0, sp);
        var path = sub.substr(sp);
        return [true, trustDomain, path];
      }
    }
    return [false, "", ""];
  }

  onChangeSpiffeId(e: { target: { value: string; }; }) {
    var sid = e.target.value;
    if (sid.length === 0) {
      this.setState({
        spiffeId: sid,
        trustDomain: "",
        path: "",
        message: "",
      });
      return
    }

    const [validSpiffeId, trustDomain, path] = this.parseSpiffeId(sid)
    if (validSpiffeId) {
      this.setState({
        message: "",
        spiffeId: sid,
        trustDomain: trustDomain,
        path: path,
      });
      return
    }
    // else invalid spiffe ID
    this.setState({
      spiffeId: sid,
      message: "Invalid Spiffe ID",
      trustDomain: "",
      path: "",
    });
    return
  }


  // Tag related things

  // handleTagDelete(i: any) {
  //   const { tags } = this.state;
  //   this.setState({
  //     tags: tags.filter((_tag: any, index: any) => index !== i),
  //   });
  // }

  // handleTagAddition(tag: any) {
  //   this.setState(state => ({ tags: [...state.tags, tag] }));
  // }

  // handleTagDrag(tag: any, currPos: number, newPos: number) {
  //   const tags = [...this.state.tags];
  //   const newTags = tags.slice();

  //   newTags.splice(currPos, 1);
  //   newTags.splice(newPos, 0, tag);

  //   // re-render
  //   this.setState({ tags: newTags });
  // }

  getApiTokenEndpoint() {
    if (!IsManager) {
      return GetApiServerUri('/api/agent/createjointoken')
    } else if (IsManager && this.state.selectedServer !== "") {
      return GetApiServerUri('/manager-api/agent/createjointoken') + "/" + this.state.selectedServer
    } else {
      this.setState({ message: "Error: No server selected" })
      return ""
    }


  }
  onSubmit(e: { preventDefault: () => void; }) {
    e.preventDefault();

    if (this.state.spiffeId !== "") {
      const validSpiffeId = (this.parseSpiffeId(this.state.spiffeId))[0];
      if (!validSpiffeId) {
        this.setState({ message: "ERROR: invalid spiffe ID specified" });
        return
      }
    }
    var cjtData = {
      "ttl": this.state.ttl,
      "trust_domain": this.state.trustDomain,
      "path": this.state.path,
      "token": this.state.token,
    };
    if (this.state.trustDomain !== "" && this.state.path !== "") {
      cjtData["trust_domain"] = this.state.trustDomain;
      cjtData["path"] = this.state.path;
    }
    if (this.state.token !== "") {
      cjtData["token"] = this.state.token;
    }
    let endpoint = this.getApiTokenEndpoint();
    if (endpoint === "") {
      return
    }
    axios.post(endpoint, cjtData)
      .then(res => this.setState({ message: "Request:" + JSON.stringify(cjtData, null, ' ') + "\n\nSuccess:" + JSON.stringify(res.data, null, ' ') }))
      .catch(err => this.setState({ message: "ERROR:" + err + (typeof (err.response) !== "undefined" ? err.response.data : "") }))
    //window.location = '/';
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
              required
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
      </div>
    )
  }
}

const mapStateToProps = (state: { servers: { globalServerSelected: string; }; }) => ({
  globalServerSelected: state.servers.globalServerSelected,
})

// CreateJoinToken.propTypes = {
//   serverSelectedFunc: PropTypes.func,
//   globalServerSelected: PropTypes.string,
// };

export default connect(
  mapStateToProps,
  { serverSelectedFunc }
)(CreateJoinToken)

export { CreateJoinToken };