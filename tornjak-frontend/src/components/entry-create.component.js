import React, { Component } from 'react';
import axios from 'axios';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';

const ServerDropdown = props => (
  <option value={props.value}>{props.name}</option>
)

export default class CreateEntry extends Component {
  constructor(props) {
    super(props);

    this.onChangeName = this.onChangeName.bind(this);
    this.onChangeSelectors = this.onChangeSelectors.bind(this);
    this.onChangeSpiffeId = this.onChangeSpiffeId.bind(this);
    this.onChangeParentId = this.onChangeParentId.bind(this);
    this.onServerSelect = this.onServerSelect.bind(this);
    this.onChangeAdminFlag= this.onChangeAdminFlag.bind(this);
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
      adminFlag: false,

      //ttl: 500,
      //token: "",


      message: "",
      servers: [],
      selectedServer: "",
    }
  }

  componentDidMount() {
      if (IsManager) {
        this.populateServers()
      } else {
        // agent doesnt need to do anything
        this.setState({})
      }
  }

  // Server dropdown populate
  populateServers () {
    axios.get(GetApiServerUri("/manager-api/server/list"), { crossdomain: true })
      .then(response => {
        this.setState({ servers:response.data["servers"]} );
      })
      .catch((error) => {
        console.log(error);
      })
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
      this.setState({selectedServer: serverName});
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

  onChangeAdminFlag(e) {
    this.setState({
      adminFlag: e.target.checked,
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

  getApiEntryCreateEndpoint() {
      if (!IsManager) {
          return GetApiServerUri('/api/entry/create')
      } else if (IsManager && this.state.selectedServer !== "") {
          return GetApiServerUri('/manager-api/entry/create') + "/" + this.state.selectedServer
      } else {
          this.setState({message:"Error: No server selected"})
          return ""
      }
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
            "selectors": selectorEntries,
            "admin": this.state.adminFlag,
        }]
    }

    let endpoint = this.getApiEntryCreateEndpoint();
    if (endpoint === "") {
        return
    }
    axios.post(endpoint, cjtData)
      .then(res => this.setState({ message: "Requst:" + JSON.stringify(cjtData,null, ' ')+ "\n\nSuccess:" + JSON.stringify(res.data, null, ' ')}))
      .catch(err => this.setState({ message: "ERROR:" + err }))
    //window.location = '/';
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
        <h3>Create New Entry</h3>
        <form onSubmit={this.onSubmit}>
          <div className="alert alert-primary" role="alert">
          <pre>
            {this.state.message}
          </pre>
          </div>
          {IsManager && managerServerSelector}
          <br/><br/>

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
            <input
                type="checkbox"
                checked={this.state.adminFlag}
                onChange={this.onChangeAdminFlag}
            />
            Admin Flag
          </div>




          <div className="form-group">
            <input type="submit" value="Create Entry" className="btn btn-primary" />
          </div>
          <div>TODO: Add other API fields</div>
        </form>
      </div>
    )
  }
}
