import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import {
  serverSelected
} from '../actions';

class CreateJoinToken extends Component {
  constructor(props) {
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
    }
  }

  
  componentDidMount() {
      if (IsManager) {
        if(this.props.globalServerSelected !== ""){
          this.setState({selectedServer: this.props.globalServerSelected});
        }
      } else {
        // agent doesnt need to do anything
        this.setState({})
      }
  }

  componentDidUpdate(prevProps) {
    if(prevProps.globalServerSelected !== this.props.globalServerSelected){
      this.setState({selectedServer: this.props.globalServerSelected});
    }
  }


  onChangeName(e) {
    this.setState({
      name: e.target.value
    });
  }

  onChangeTtl(e) {
    this.setState({
      ttl: Number(e.target.value)
    });
  }

  onChangeToken(e) {
    this.setState({
      token: e.target.value
    });
  }

/*
 * const str1 = 'spiffe://example.org/abc/def/gew:';

console.log(str1.startsWith('spiffe://'));
// expected output: true

var a = str1.substr("spiffe://".length);
console.log(a)
var sp = a.indexOf("/")
console.log(a.substr(0,sp))
console.log(a.substr(sp))*/


  parseSpiffeId(sid) {
    if (sid.startsWith('spiffe://')) {
        var sub = sid.substr("spiffe://".length)
        var sp = sub.indexOf("/")
        if (sp > 0 && sp !== sub.length-1) {
            var trustDomain = sub.substr(0,sp);
            var path = sub.substr(sp);
            return [true, trustDomain, path];
        }
    }
    return [ false, "", "" ];
  }

  onChangeSpiffeId(e) {
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
/*
    if (sid.startsWith('spiffe://')) {
        var sub = sid.substr("spiffe://".length)
        var sp = sub.indexOf("/")
        if (sp > 0 && sp !== sub.length-1) {
            this.setState({
                message: "",
                spiffeId: sid,
                trust_domain: sub.substr(0,sp),
                path: sub.substr(sp),
            });
            return
        }
    }
      */

    const [ validSpiffeId, trustDomain, path ] = this.parseSpiffeId(sid)
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

  handleTagDelete(i) {
    const { tags } = this.state;
    this.setState({
      tags: tags.filter((tag, index) => index !== i),
    });
  }

  handleTagAddition(tag) {
    this.setState(state => ({ tags: [...state.tags, tag] }));
  }

  handleTagDrag(tag, currPos, newPos) {
    const tags = [...this.state.tags];
    const newTags = tags.slice();

    newTags.splice(currPos, 1);
    newTags.splice(newPos, 0, tag);

    // re-render
    this.setState({ tags: newTags });
  }

  getApiTokenEndpoint() {
      if (!IsManager) {
          return GetApiServerUri('/api/agent/createjointoken')
      } else if (IsManager && this.state.selectedServer !== "") {
          return GetApiServerUri('/manager-api/agent/createjointoken') + "/" + this.state.selectedServer
      } else {
          this.setState({message:"Error: No server selected"})
          return ""
      }


  }
  onSubmit(e) {
    e.preventDefault();

    if (this.state.spiffeId !== "") {
        const validSpiffeId = (this.parseSpiffeId(this.state.spiffeId))[0];
        if (!validSpiffeId) {
            this.setState({ message: "ERROR: invalid spiffe ID specified"});
            return
        }
    }
    var cjtData = {
        "ttl": this.state.ttl,
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
      .then(res => this.setState({ message: "Requst:" + JSON.stringify(cjtData,null, ' ')+ "\n\nSuccess:" + JSON.stringify(res.data, null, ' ')}))
      .catch(err => this.setState({ message: "ERROR:" + err + (typeof (err.response) !== "undefined" ? err.response.data : "")}))
    //window.location = '/';
  }

  render() {
    return (
      <div>
        <h3>Create New Agent Join Token</h3>
        <form onSubmit={this.onSubmit}>
          <div className="alert-primary" role="alert">
          <pre>
            {this.state.message}
          </pre>
          </div>
          {IsManager}
          <br/><br/>

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

const mapStateToProps = (state) => ({
  globalServerSelected: state.filteredData.globalServerSelected,
})

export default connect(
  mapStateToProps,
  { serverSelected }
)(CreateJoinToken)