import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import TableDashboard from './table/dashboard-table';
import SpiffeHelper from '../spiffe-helper';

const columns = [
  { field: "name", headerName: "Name", width: 200 },
  { field: "created", headerName: "Created", width: 300 },
  { field: "numNodes", headerName: "Number Of Nodes", width: 300 },
  { field: "numEntries", headerName: "Number of Entries", width: 200 }
];

const styles = theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
});

class ClusterDashboardTable extends React.Component {
  constructor(props) {
    super(props);
    this.SpiffeHelper = new SpiffeHelper()
  }

  clusterList() {
    var filteredData = [], selectedDataKey = this.props.selectedDataKey;
    let clustersList = [];
    if (typeof this.props.globalClustersList === 'undefined') {
      return [];
    }
    clustersList = this.props.globalClustersList.map(a => this.SpiffeHelper.cluster(a, this.props.globalEntries.globalEntriesList));

    //For details page filtering data
    if (selectedDataKey !== undefined) {
      for (let i = 0; i < clustersList.length; i++) {
        if ((clustersList[i].clusterName === selectedDataKey["clustersFilter"]) || (clustersList[i].name === selectedDataKey["clustersFilter"])) {
          filteredData.push(clustersList[i]);
        }
      }
      return filteredData;
    }
    return clustersList;
  }

  render() {
    const { numRows } = this.props;
    var data = this.clusterList();
    return (
      <div>
        <TableDashboard
          title={"Clusters"}
          numRows={numRows}
          columns={columns}
          data={data} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  globalClustersList: state.clusters.globalClustersList,
  globalAgents: state.agents,
  globalEntries: state.entries,
})

export default withStyles(styles)(
  connect(mapStateToProps, {})(ClusterDashboardTable)
)
