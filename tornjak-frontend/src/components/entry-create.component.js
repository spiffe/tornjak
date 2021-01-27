import React, { Component } from 'react';
import axios from 'axios';
import GetApiServerUri from './helpers';


export default class CreateEntry extends Component {
  constructor(props) {
    super(props);

    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeSelectors = this.onChangeSelectors.bind(this);
    this.onChangeSpiffeId = this.onChangeSpiffeId.bind(this);
    this.onChangeParentId = this.onChangeParentId.bind(this);
    //this.onChangeTtl = this.onChangeTtl.bind(this);
      
    this.onSubmit = this.onSubmit.bind(this);


    this.state = {
      name: "",
      
      // spiffe_id
      spiffeId: "",
      spiffeIdTrustDomain: "",
      spiffeIdPath: "",
      // parent_id
      parentId: "",
      parentIdTrustDomain: "",
      parentIdPath: "",

      // ',' delimetered selectors
      selectors: "",

      //ttl: 500,
      //token: "",


      message: "",
    }
  }

  componentDidMount() {
    this.setState({
    })
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

  onChangeSelectors(e) {
    this.setState({
      selectors: e.target.value
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
            spiffeIdTrustDomain: "",
            spiffeIdPath: "",
            message: "",
        });
        return
    }

    const [ validSpiffeId, trustDomain, path ] = this.parseSpiffeId(sid)
    if (validSpiffeId) {
        this.setState({
            message: "",
            spiffeId: sid,
            spiffeIdTrustDomain: trustDomain,
            spiffeIdPath: path,
        });
        return
    }
    // else invalid spiffe ID
    this.setState({
        spiffeId: sid,
        message: "Invalid Spiffe ID",
        spiffeIdTrustDomain: "",
        spiffeIdPath: "",
    });
    return
  }

  onChangeParentId(e) {
    var sid = e.target.value;
    if (sid.length === 0) {
        this.setState({
            parentId: sid,
            parentIdTrustDomain: "",
            parentIdPath: "",
            message: "",
        });
        return
    }

    const [ validSpiffeId, trustDomain, path ] = this.parseSpiffeId(sid)
    if (validSpiffeId) {
        this.setState({
            message: "",
            parentId: sid,
            parentIdTrustDomain: trustDomain,
            parentIdPath: path,
        });
        return
    }
    // else invalid spiffe ID
    this.setState({
        parentId: sid,
        message: "Invalid Parent ID",
        parentIdTrustDomain: "",
        parentIdPath: "",
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

  onSubmit(e) {
    e.preventDefault();

    const validSpiffeId = (this.parseSpiffeId(this.state.spiffeId))[0];
    if (!validSpiffeId) {
        this.setState({ message: "ERROR: invalid spiffe ID specified"});
        return
    }

    const validParentId = (this.parseSpiffeId(this.state.parentId))[0];
    if (!validParentId) {
        this.setState({ message: "ERROR: invalid parent ID specified"});
        return
    }

    const selectorStrings = this.state.selectors.split(',').map(x => x.trim())
    if (selectorStrings.length === 0) {
        this.setState({ message: "ERROR: Selectors cannot be empty"})
        return
    }
    const selectorEntries = selectorStrings.map(x => x.indexOf(":") > 0 ? 
        { 
            "type": x.substr(0,x.indexOf(":")), 
            "value": x.substr(x.indexOf(":") + 1)
        } : null)

    if (selectorEntries.some(x => x == null || x["value"].length===0)) {
        this.setState({ message: "ERROR: Selectors not in the correct format should be type:value"})
        return
    }

    var cjtData = {
        "entries": [{
            "spiffe_id": {
                "trust_domain": this.state.spiffeIdTrustDomain,
                "path": this.state.spiffeIdPath,
            },
            "parent_id": {
                "trust_domain": this.state.parentIdTrustDomain,
                "path": this.state.parentIdPath,
            },
            "selectors": selectorEntries
        }]
    }

    axios.post(GetApiServerUri('/api/entry/create'), cjtData)
      .then(res => this.setState({ message: "Requst:" + JSON.stringify(cjtData,null, ' ')+ "\n\nSuccess:" + JSON.stringify(res.data, null, ' ')}))
      .catch(err => this.setState({ message: "ERROR:" + err }))
    //window.location = '/';
  }

  render() {
    return (
      <div>
        <h3>Create New Entry</h3>
        <form onSubmit={this.onSubmit}>
          <div className="alert alert-primary" role="alert">
          <pre>
            {this.state.message}
          </pre>
          </div>

          <div className="form-group">
            <label>SPIFFE ID: i.e. spiffe://example.org/sample/spiffe/id</label>
            <input type="text"
              className="form-control"
              value={this.state.spiffeId}
              onChange={this.onChangeSpiffeId}
            /></div>

          <div className="form-group">
            <label>Parent ID: i.e. spiffe://example.org/agent/myagent1</label>
        <label>For node entries, specify spiffe server as parent i.e. spiffe://example.org/spire/server </label>
            <input type="text"
              className="form-control"
              value={this.state.parentId}
              onChange={this.onChangeParentId}
            /></div>




          <div className="form-group">
            <label>Selectors: k8s_sat:cluster:demo-cluster,...</label>
            <input type="text"
              required
              className="form-control"
              value={this.state.token}
              onChange={this.onChangeSelectors}
            /></div>


          <div className="form-group">
            <input type="submit" value="Create Entry" className="btn btn-primary" />
          </div>
          <div>TODO: Add other API fields</div>
        </form>
      </div>
    )
  }
}
