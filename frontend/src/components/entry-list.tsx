import { Component } from 'react';
import { connect } from 'react-redux';
import IsManager from './is_manager';
import Table from "tables/entries-list-table";
import TornjakApi from "./tornjak-api-helpers"
import {
  serverSelectedFunc,
  entriesListUpdateFunc,
  tornjakMessageFunc,
} from 'redux/actions';
// import PropTypes from "prop-types"; // needed for testing will be removed on last pr
import { RootState } from 'redux/reducers';
import {
  EntriesList, 
  TornjakServerInfo,
  DebugServerInfo,
} from './types'

type EntryListProp = {
  // tornjak server debug info of the selected server
  globalDebugServerInfo: DebugServerInfo,
  // dispatches a payload for the server selected and has a return type of void
  serverSelectedFunc: (globalServerSelected: string) => void,
  // dispatches a payload for list of entries with their metadata info as an array of EntriesListType and has a return type of void
  entriesListUpdateFunc: (globalEntriesList: EntriesList[]) => void,
  // dispatches a payload for the tornjak error messsege and has a return type of void
  tornjakMessageFunc: (globalErrorMessage: string) => void,
  // the selected server for manager mode 
  globalServerSelected: string,
  // tornjak error messege
  globalErrorMessage: string,
  // list of available entries as array of EntriesListType
  globalEntriesList: EntriesList[],
  // tornjak server info of the selected server
  globalTornjakServerInfo: TornjakServerInfo,
}

type EntryListState = {}

const Entry = (props: { entry: EntriesList }) => (
  <tr>
    <td>{props.entry.id}</td>
    <td>{"spiffe://" + props.entry.spiffe_id.trust_domain + props.entry.spiffe_id.path}</td>
    <td>{"spiffe://" + props.entry.parent_id.trust_domain + props.entry.parent_id.path}</td>
    <td>{props.entry.selectors.map(s => s.type + ":" + s.value).join(', ')}</td>
    <td><div style={{ overflowX: 'auto', width: "400px" }}>
      <pre>{JSON.stringify(props.entry, null, ' ')}</pre>
    </div></td>
  </tr>
)

class EntryList extends Component<EntryListProp, EntryListState> {
  TornjakApi: TornjakApi;
  constructor(props: EntryListProp) {
    super(props);
    this.TornjakApi = new TornjakApi(props);
    this.state = {}
  }

  componentDidMount() {
    if (IsManager) {
      if (this.props.globalServerSelected !== "") {
        this.TornjakApi.populateEntriesUpdate(this.props.globalServerSelected, this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc)
      }
    } else {
      this.TornjakApi.populateLocalEntriesUpdate(this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc)
    }
  }

  componentDidUpdate(prevProps: EntryListProp) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.TornjakApi.populateEntriesUpdate(this.props.globalServerSelected, this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc)
      }
    } else {
      if (prevProps.globalDebugServerInfo !== this.props.globalDebugServerInfo) {
        this.TornjakApi.populateLocalEntriesUpdate(this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc)
      }
    }
  }

  entryList() {
    if (this.props.globalEntriesList === undefined) return ""
    return this.props.globalEntriesList.map((currentEntry: EntriesList) => {
      return <Entry key={currentEntry.id} entry={currentEntry} />
    })
  }

  render() {
    return (
      <div data-test="entry-list">
        <h3>Entries List</h3>
        {this.props.globalErrorMessage !== "OK" &&
          <div className="alert-primary" role="alert">
            <pre>
              {this.props.globalErrorMessage}
            </pre>
          </div>
        }
        <br /><br />
        <div className="indvidual-list-table">
          <Table data={this.entryList()} id="table-1" />
        </div>
      </div>
    )
  }
}


const mapStateToProps = (state: RootState) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalEntriesList: state.entries.globalEntriesList,
  globalErrorMessage: state.tornjak.globalErrorMessage,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalDebugServerInfo: state.servers.globalDebugServerInfo,
})

// Note: Needed for UI testing - will be removed after
// EntryList.propTypes = {
//   globalServerSelected: PropTypes.string,
//   globalEntriesList: PropTypes.array,
//   globalErrorMessage: PropTypes.string,
//   serverSelectedFunc: PropTypes.func,
//   entriesListUpdateFunc: PropTypes.func,
//   tornjakMessageFunc: PropTypes.func,
// };

export default connect(
  mapStateToProps,
  { serverSelectedFunc, entriesListUpdateFunc, tornjakMessageFunc }
)(EntryList)

export { EntryList };