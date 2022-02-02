import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import TableDashboard from './table/dashboard-table';
import SpiffeHelper from '../spiffe-helper';
import TornjakHelper from 'components/tornjak-helper';
// import PropTypes from "prop-types";

type ClusterDashboardTableProp = {
  filterByCluster: any,
  globalClustersList: [],
  globalEntries: {globalEntriesList: []},
  globalAgents: {globalAgentsList: [], globalAgentsWorkLoadAttestorInfo: []},
  numRows: number
}

type ClusterDashboardTableState = {}

const columns = [
  { field: "name", headerName: "Name", width: 200 },
  { field: "created", headerName: "Created", width: 300 },
  { field: "numNodes", headerName: "Number Of Nodes", width: 300 },
  { field: "numEntries", headerName: "Number of Entries", width: 200 }
];

const styles = (theme:any) => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
});

class ClusterDashboardTable extends React.Component<ClusterDashboardTableProp, ClusterDashboardTableState> {
  SpiffeHelper: SpiffeHelper;
  TornjakHelper: TornjakHelper;
  constructor(props:ClusterDashboardTableProp) {
    super(props);
    this.SpiffeHelper = new SpiffeHelper();
    this.TornjakHelper = new TornjakHelper();
  }

  clusterList() {
    var filterByValue = [];
    const { filterByCluster } = this.props;
    let clustersList: any = [];
    if (typeof this.props.globalClustersList === 'undefined') {
      return [];
    }
    clustersList = this.props.globalClustersList.map(a => this.TornjakHelper.getClusterMetadata(a, this.props.globalEntries.globalEntriesList, this.props.globalAgents.globalAgentsList));
    //For details page filtering data
    if (filterByCluster === undefined || clustersList.length === 0) {
      return clustersList;
    }
    for (let i = 0; i < clustersList.length; i++) {
      if(clustersList[i] !== undefined) {
        if ((filterByCluster !== undefined && clustersList[i].name === filterByCluster)) {
          filterByValue.push(clustersList[i]);
        }
      }
    }
    return filterByValue;
  }

  render() {
    const { numRows } = this.props;
    var data = this.clusterList();
    return (
      <div data-test="cluster-dashboard-table">
        <TableDashboard
          title={"Clusters"}
          numRows={numRows}
          columns={columns}
          data={data} />
      </div>
    );
  }
}

const mapStateToProps = (state: { clusters: { globalClustersList: []; }; agents: { globalAgentsList: []; globalAgentsWorkLoadAttestorInfo: []; }; entries: { globalEntriesList: []; }; }) => ({
  globalClustersList: state.clusters.globalClustersList,
  globalAgents: state.agents,
  globalEntries: state.entries,
})

// ClusterDashboardTable.propTypes = {
//   classes: PropTypes.object,
//   numRows: PropTypes.number,
//   filterByCluster: PropTypes.string,
//   globalAgents: PropTypes.objectOf(PropTypes.shape({
//     globalAgentsList: PropTypes.array,
//     globalAgentsWorkLoadAttestorInfo: PropTypes.array
//   })),
//   globalEntries: PropTypes.objectOf(PropTypes.shape({
//     globalEntriesList: PropTypes.array,
//   })),
//   globalClustersList: PropTypes.array,
//   globalClickedDashboardTable: PropTypes.string,
// };

export default withStyles(styles)(
  connect(mapStateToProps, {})(ClusterDashboardTable)
)

export { ClusterDashboardTable };