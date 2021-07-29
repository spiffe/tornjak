import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import renderCellExpand from './render-cell-expand';
import TableDashboard from './table/dashboard-table';
import SpiffeEntryInterface from '../spiffe-entry-interface'

const columns = [
  { field: "id", headerName: "ID", width: 200, renderCell: renderCellExpand},
  { field: "spiffeid", headerName: "Name", width: 300, renderCell: renderCellExpand},
  { field: "parentId", headerName: "Parent ID", width: 250, renderCell: renderCellExpand},
  { field: "adminFlag", headerName: "Admin Flag", width: 150},
  { field: "entryExpireTime", headerName: "Entry Expire Time", width: 190},
  { field: "platformType", headerName: "Platform Type", width: 170},
  { field: "clusterName", headerName: "Cluster Name", width: 190}
];

const styles = ( theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

class EntriesDashBoardTable extends React.Component {
  constructor(props) {
    super(props)
    this.SpiffeEntryInterface = new SpiffeEntryInterface();
  }

  workloadEntry(entry) {
    var thisSpiffeId = this.SpiffeEntryInterface.getEntrySpiffeid(entry)
    var thisParentId = this.SpiffeEntryInterface.getEntryParentid(entry)
    // get tornjak metadata
    var metadata_entry = this.SpiffeEntryInterface.getAgentMetadata(thisParentId, this.props.globalAgents.globalAgentsWorkLoadAttestorInfo);
    var plugin = "None"
    var cluster = "None"
    if (metadata_entry["plugin"].length !== 0) {
      plugin = metadata_entry["plugin"]
    }
    if (metadata_entry["cluster"].length !== 0) {
      cluster = metadata_entry["cluster"]
    }
    // get spire data
    var admin = this.SpiffeEntryInterface.getEntryAdminFlag(entry)
    var expTime = "No Expiry Time"
    if (typeof entry.expires_at !== 'undefined') {
      var d = new Date(this.SpiffeEntryInterface.getEntryExpiryMillisecondsFromEpoch(entry))
      expTime = d.toLocaleDateString("en-US", {month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric', hour12: false})
    }
    return {
      id: entry.id,
      spiffeid: thisSpiffeId,
      parentId: thisParentId,
      adminFlag: admin,
      entryExpireTime: expTime,
      platformType: plugin,
      clusterName: cluster,
    }
  }

  entryList() {
    if (typeof this.props.globalEntriesList !== 'undefined' && typeof this.props.globalEntriesList.globalEntriesList !== 'undefined') {
      return this.props.globalEntriesList.globalEntriesList.map(currentEntry => {
        return this.workloadEntry(currentEntry);
      })
    } else {
      return []
    }
  }

  render() {
    const { numRows, tableType } = this.props;
    var data = this.entryList();
    return (
      <div>
        <TableDashboard 
          title={"Entries"}
          numRows={numRows}
          tableType={tableType}
          columns={columns}
          data={data}/>
      </div>
    );
  }
}

const mapStateToProps = state => ({
  globalAgents: state.agents,
  globalEntriesList: state.entries,
})

export default withStyles(styles)(
  connect(mapStateToProps, {})(EntriesDashBoardTable)
)