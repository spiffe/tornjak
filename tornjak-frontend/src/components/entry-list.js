import React, { Component } from 'react';
import { connect } from 'react-redux';
import IsManager from './is_manager';
import Table from "tables/entries-list-table";
import TornjakApi from "./tornjak-api-helpers"
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
    this.TornjakApi = new TornjakApi();
    this.state = { 
        servers: [],
        selectedServer: "",
    };
  }

  componentDidMount() {
    if (IsManager) {
      if(this.props.globalServerSelected !== ""){
        this.TornjakApi.populateEntriesUpdate(this.props.globalServerSelected, this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc)
      }
    } else {
        this.TornjakApi.populateLocalEntriesUpdate(this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc)
    }
  }

  componentDidUpdate(prevProps) {
    if (IsManager) {
      if(prevProps.globalServerSelected !== this.props.globalServerSelected){
        this.TornjakApi.populateEntriesUpdate(this.props.globalServerSelected, this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc)
      }
    }
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
        <h3>Entries List</h3>
        {this.props.globalErrorMessage !== "OK" &&
          <div className="alert-primary" role="alert">
            <pre>
              {this.props.globalErrorMessage}
            </pre>
          </div>
        }
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