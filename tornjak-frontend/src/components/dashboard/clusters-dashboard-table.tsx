import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from 'tss-react/mui';
import TableDashboard from './table/dashboard-table';
import SpiffeHelper from '../spiffe-helper';
import TornjakHelper from 'components/tornjak-helper';
import { GridColDef } from '@mui/x-data-grid';
import { AgentsReducerState, EntriesReducerState } from 'redux/actions/types';
import { RootState } from 'redux/reducers';
import { ClustersList } from 'components/types';

const columns: GridColDef[] = [
  { field: "name", headerName: "Name", width: 200 },
  { field: "created", headerName: "Created", width: 300 },
  { field: "numNodes", headerName: "Number Of Nodes", width: 300 },
  { field: "numEntries", headerName: "Number of Entries", width: 200 }
];

interface ClusterDashboardTableProp {
  filterByCluster?:string,
  filterByAgentId?:string,
  globalClickedDashboardTable: string,
  numRows: number,
  //From Redux
  globalClustersList: ClustersList[],
  globalAgents: AgentsReducerState,
  globalEntries: EntriesReducerState
}

class ClusterDashboardTable extends React.Component<ClusterDashboardTableProp> {
  TornjakHelper: TornjakHelper;
  SpiffeHelper: SpiffeHelper;
  constructor(props:ClusterDashboardTableProp) {
    super(props);
    this.SpiffeHelper = new SpiffeHelper({});
    this.TornjakHelper = new TornjakHelper({});
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

const mapStateToProps = (state:RootState) => ({
  globalClustersList: state.clusters.globalClustersList,
  globalAgents: state.agents,
  globalEntries: state.entries,
})

const ClusterDashboardTableStyled = withStyles(
  ClusterDashboardTable,
  (theme: { spacing: (arg0: number) => any; }) => ({
    root: {
      seeMore: {
        marginTop: theme.spacing(3),
      },
    }
  })
); 

export default connect(mapStateToProps, {})(ClusterDashboardTableStyled);