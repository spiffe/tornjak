import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios'
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import {
  serverSelected
} from '../actions';

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

class EntryList extends Component {
  constructor(props) {
    super(props);
    this.deleteEntry = this.deleteEntry.bind(this);
    this.state = { 
        servers: [],
        selectedServer: "",
        entries: [],
        message: "",
    };
  }

  componentDidMount() {
    if (IsManager) {
      if(this.props.globalServerSelected !== ""){
        this.populateEntries(this.props.globalServerSelected)
      }
    } else {
        this.populateLocalEntries()
    }
  }

  componentDidUpdate(prevProps) {
    if(prevProps.globalServerSelected !== this.props.globalServerSelected){
      this.populateEntries(this.props.globalServerSelected)
    }
  }

  populateEntries(serverName) {
      axios.get(GetApiServerUri('/manager-api/entry/list/') + serverName, {     crossdomain: true })
      .then(response =>{
        console.log(response);
        this.setState({ entries:response.data["entries"]});
      }).catch(err => {
          this.setState({ 
              message: "Error retrieving " + serverName + " : "+ err + (typeof (err.response) !== "undefined" ? ":" + err.response.data : ""),
              entries: [],
          });
      });

  }

  populateLocalEntries() {
      axios.get(GetApiServerUri('/api/entry/list'), { crossdomain: true })
      .then(response => {
          console.log(response.data);
        this.setState({ entries:response.data["entries"]} );
      })
      .catch((error) => {
        console.log(error);
      })
  }


  deleteEntry(id) {
    var endpoint = ""
    if (IsManager) {
        endpoint = GetApiServerUri('/manager-api/entry/delete') + "/" + this.state.selectedServer
    } else {
        endpoint = GetApiServerUri('/api/entry/delete')
    }
    axios.post(endpoint, {
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

  render() {

    return (
      <div>
        <h3>Entry List</h3>
        <div className="alert-primary" role="alert">
        <pre>
           {this.state.message}
        </pre>
        </div>
        {IsManager}
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


const mapStateToProps = (state) => ({
  globalServerSelected: state.serverInfo.globalServerSelected,
})

export default connect(
  mapStateToProps,
  { serverSelected }
)(EntryList)