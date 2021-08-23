import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import renderCellExpand from './render-cell-expand';
import TableDashboard from './table/dashboard-table';
import SpiffeHelper from '../spiffe-helper'

const columns = [
  { field: "id", headerName: "ID", width: 170, renderCell: renderCellExpand },
  { field: "spiffeid", headerName: "Name", width: 170, renderCell: renderCellExpand },
  { field: "parentId", headerName: "Parent ID", width: 170, renderCell: renderCellExpand },
  { field: "clusterName", headerName: "Cluster Name", width: 170 },
  { field: "entryExpireTime", headerName: "Entry Expire Time", width: 190 },
  { field: "platformType", headerName: "Platform Type", width: 170 },
  { field: "adminFlag", headerName: "Admin Flag", width: 150 },
];

const styles = (theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
}));

class EntriesDashBoardTable extends React.Component {
  constructor(props) {
    super(props)
    this.SpiffeHelper = new SpiffeHelper();
  }

  entryList() {
    var filteredData = [], selectedDataKey = this.props.selectedDataKey;
    let entriesList = [];
    if ((typeof this.props.globalEntries.globalEntriesList === 'undefined') ||
      (typeof this.props.globalAgents.globalAgentsList === 'undefined')) {
      return [];
    }

    entriesList = this.props.globalEntries.globalEntriesList.map(currentEntry => {
      return this.SpiffeHelper.workloadEntry(currentEntry, this.props.globalAgents.globalAgentsWorkLoadAttestorInfo);
    })

    //For details page filtering data
    if (selectedDataKey !== undefined) {
      for (let i = 0; i < entriesList.length; i++) {
        if ((entriesList[i].clusterName === selectedDataKey["entriesFilter"]) || (entriesList[i].parentId === selectedDataKey["entriesFilter"])) {
          filteredData.push(entriesList[i]);
        }
      }
      return filteredData;
    }
    return entriesList;
  }

  render() {
    const { numRows } = this.props;
    var data = this.entryList();
    return (
      <div>
        <TableDashboard
          title={"Entries"}
          numRows={numRows}
          columns={columns}
          data={data} />
      </div>
    );
  }
}

const mapStateToProps = state => ({
  globalAgents: state.agents,
  globalEntries: state.entries,
  globalClickedDashboardTable: state.tornjak.globalClickedDashboardTable,
})

export default withStyles(styles)(
  connect(mapStateToProps, {})(EntriesDashBoardTable)
)
