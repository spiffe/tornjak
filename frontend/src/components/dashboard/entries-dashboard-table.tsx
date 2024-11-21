import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from 'tss-react/mui';
import renderCellExpand from './render-cell-expand';
import TableDashboard from './table/dashboard-table';
import SpiffeHelper from '../spiffe-helper';
import TornjakHelper from 'components/tornjak-helper';
import { GridCellParams, GridColDef } from '@mui/x-data-grid';
import { AgentsReducerState, EntriesReducerState } from 'redux/actions/types';
import { RootState } from 'redux/reducers';

const columns: GridColDef[] = [
  { field: "id", headerName: "ID", width: 170, renderCell: renderCellExpand as (params: GridCellParams)=>JSX.Element },
  { field: "spiffeid", headerName: "Name", width: 170, renderCell: renderCellExpand as (params: GridCellParams)=>JSX.Element },
  { field: "parentId", headerName: "Parent ID", width: 170, renderCell: renderCellExpand as (params: GridCellParams)=>JSX.Element },
  { field: "clusterName", headerName: "Cluster Name", width: 150 },
  { field: "entryExpireTime", headerName: "Entry Expire Time", width: 150 },
  { field: "platformType", headerName: "Platform Type", width: 150 },
  { field: "adminFlag", headerName: "Admin Flag", width: 125, type: 'boolean'},
];

interface EntriesDashBoardTableProp {
  filterByCluster?:string,
  filterByAgentId?:string,
  globalClickedDashboardTable: string,
  numRows: number,
  //From Redux
  globalAgents: AgentsReducerState,
  globalEntries: EntriesReducerState
}

class EntriesDashBoardTable extends React.Component<EntriesDashBoardTableProp> {
  TornjakHelper: TornjakHelper;
  SpiffeHelper: SpiffeHelper;
  constructor(props:EntriesDashBoardTableProp) {
    super(props)
    this.SpiffeHelper = new SpiffeHelper({});
    this.TornjakHelper = new TornjakHelper({});
  }

  entryList() {
    var filterByValue = [];
    const { filterByCluster, filterByAgentId } = this.props;
    let entriesList = [];
    if ((typeof this.props.globalEntries.globalEntriesList === 'undefined') ||
      (typeof this.props.globalAgents.globalAgentsList === 'undefined')) {
      return [];
    }

    entriesList = this.props.globalEntries.globalEntriesList.map(currentEntry => {
      return this.TornjakHelper.workloadEntry(currentEntry, this.props.globalAgents.globalAgentsWorkLoadAttestorInfo, this.props.globalAgents.globalAgentsList, this.props.globalEntries.globalEntriesList);
    })

    // For details page filtering data
    if (filterByCluster === undefined && filterByAgentId === undefined) {
      return entriesList;
    }

    for (let i = 0; i < entriesList.length; i++) {
      if ((filterByCluster !== undefined && entriesList[i].clusterName === filterByCluster) ||
        (filterByAgentId !== undefined && entriesList[i].parentId === filterByAgentId) ||
        (filterByAgentId !== undefined && entriesList[i].canonicalAgentId=== filterByAgentId)
      ) {
        filterByValue.push(entriesList[i]);
      }
    }
    return filterByValue;
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

const mapStateToProps = (state:RootState) => ({
  globalAgents: state.agents,
  globalEntries: state.entries,
  globalClickedDashboardTable: state.tornjak.globalClickedDashboardTable,
})

const EntriesDashBoardTableStyled = withStyles(
  EntriesDashBoardTable,
  (theme: { spacing: (arg0: number) => any; }) => ({
    root: {
      seeMore: {
        marginTop: theme.spacing(3),
      },
    }
  })
);

export default connect(mapStateToProps, {})(EntriesDashBoardTableStyled);
