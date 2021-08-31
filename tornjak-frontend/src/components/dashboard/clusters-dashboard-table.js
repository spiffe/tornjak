import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import TableDashboard from './table/dashboard-table';
import SpiffeHelper from '../spiffe-helper';
import TornjakHelper from 'components/tornjak-helper';

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
    this.SpiffeHelper = new SpiffeHelper();
    this.TornjakHelper = new TornjakHelper();
  }

  clusterList() {
    var filterByValue = [];
    const { filterByCluster } = this.props;
    let clustersList = [];
    if (typeof this.props.globalClustersList === 'undefined') {
      return [];
    }
    clustersList = this.props.globalClustersList.map(a => this.TornjakHelper.getClusterMetadata(a, this.props.globalEntries.globalEntriesList, this.props.globalAgents.globalAgentsList));
    //For details page filtering data
    if (filterByCluster === undefined) {
      return clustersList;
    }
    for (let i = 0; i < clustersList.length; i++) {
      if ((filterByCluster !== undefined && clustersList[i].name === filterByCluster)) {
        filterByValue.push(clustersList[i]);
      }
    }
    return filterByValue;
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
