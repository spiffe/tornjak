import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios'
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import Table from "tables/entries-list-table";
import {
  serverSelectedFunc,
  entriesListUpdateFunc,
  tornjakMessageFunc,
} from 'redux/actions';

const Entry = props => (
  <tr>
    <td>{props.entry.id}</td>
    <td>{ "spiffe://" + props.entry.spiffe_id.trust_domain + props.entry.spiffe_id.path}</td>
    <td>{ "spiffe://" + props.entry.parent_id.trust_domain + props.entry.parent_id.path}</td>
    <td>{ props.entry.selectors.map(s => s.type + ":" + s.value).join(', ')}</td>
    
    <td>
      <br/>
      <a href="/#" onClick={() => { props.deleteEntry (props.entry.id) }}>delete</a>
    </td>

    <td><div style={{overflowX: 'auto', width: "400px"}}>
    <pre>{JSON.stringify(props.entry, null, ' ')}</pre>
    </div></td>

  </tr>
)

class EntryList extends Component {
  constructor(props) {
    super(props);
    this.state = { 
        servers: [],
        selectedServer: "",
    };
  }

  componentDidMount() {
    if (IsManager) {
      if(this.props.globalServerSelected !== ""){
        this.populateEntriesUpdate(this.props.globalServerSelected)
      }
    } else {
        this.populateLocalEntriesUpdate()
    }
  }

  componentDidUpdate(prevProps) {
    if (IsManager) {
      if(prevProps.globalServerSelected !== this.props.globalServerSelected){
        this.populateEntriesUpdate(this.props.globalServerSelected)
      }
    }
  }

  populateEntriesUpdate(serverName) {
      axios.get(GetApiServerUri('/manager-api/entry/list/') + serverName, {     crossdomain: true })
      .then(response =>{
        this.props.entriesListUpdateFunc(response.data["entries"]);
        this.props.tornjakMessageFunc(response.statusText);
      }).catch(err => {
          this.props.entriesListUpdateFunc([]);
          this.props.tornjakMessageFunc("Error retrieving " + serverName + " : "+ err + (typeof (err.response) !== "undefined" ? ":" + err.response.data : ""));
      });

  }

  populateLocalEntriesUpdate() {
      axios.get(GetApiServerUri('/api/entry/list'), { crossdomain: true })
      .then(response => {
        this.props.entriesListUpdateFunc(response.data["entries"]);
        this.props.tornjakMessageFunc(response.statusText);
      })
      .catch((error) => {
        console.log(error);
        this.props.tornjakMessageFunc(error.message);
      })
  }

  entryList() {
  if (typeof this.props.globalEntriesList !== 'undefined') {
      return this.props.globalEntriesList.map(currentEntry => {
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
        {this.props.globalErrorMessage !== "OK" &&
          <div className="alert-primary" role="alert">
            <pre>
              {this.props.globalErrorMessage}
            </pre>
          </div>
        }
        {IsManager}
        <br/><br/>
        <div className="indvidual-list-table">
          <Table data={this.entryList()} id="table-1" />
        </div>
      </div>
    )
  }
}


const mapStateToProps = (state) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalEntriesList: state.entries.globalEntriesList,
  globalErrorMessage: state.tornjak.globalErrorMessage,
})

export default connect(
  mapStateToProps,
  { serverSelectedFunc, entriesListUpdateFunc, tornjakMessageFunc }
)(EntryList)
