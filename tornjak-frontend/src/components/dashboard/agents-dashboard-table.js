import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import renderCellExpand from './render-cell-expand';
import TableDashboard from './table/dashboard-table';
import SpiffeHelper from '../spiffe-helper';
import TornjakHelper from 'components/tornjak-helper';

const columns = [
  { field: "spiffeid", headerName: "Name", flex: 1, renderCell: renderCellExpand },
  { field: "clusterName", headerName: "Cluster Name", width: 190 },
  { field: "numEntries", headerName: "Number of Entries", width: 200 },
  { field: "status", headerName: "Status", width: 120 },
  { field: "platformType", headerName: "Platform Type", width: 170 },
];

const styles = theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
});

class AgentDashboardTable extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
    this.SpiffeHelper = new SpiffeHelper();
    this.TornjakHelper = new TornjakHelper();
  }

  agentList() {
    var filterByValue = [];
    const { filterByCluster, filterByAgentId } = this.props;
    let agentsList = [];
    if ((typeof this.props.globalEntries.globalEntriesList === 'undefined') ||
      (typeof this.props.globalAgents.globalAgentsList === 'undefined')) {
      return [];
    }
    agentsList = this.props.globalAgents.globalAgentsList.map(currentAgent => {
      return this.TornjakHelper.getDashboardAgentMetaData(currentAgent, this.props.globalEntries.globalEntriesList, this.props.globalAgents.globalAgentsList, this.props.globalAgents.globalAgentsWorkLoadAttestorInfo)
    })
    // For details page filtering data
    if (filterByCluster === undefined && filterByAgentId === undefined) {
      return agentsList;
    }
    for (let i = 0; i < agentsList.length; i++) {
      if ((filterByCluster !== undefined && agentsList[i].clusterName === filterByCluster) ||
        (filterByAgentId !== undefined && agentsList[i].id === filterByAgentId)) { // for filtering agents for a specific cluster or filtering agents for entries
        filterByValue.push(agentsList[i]);
      }
    }
    return filterByValue;
  }

  render() {
    const { numRows } = this.props;
    var data = this.agentList();
    return (
      <div>
        <TableDashboard
          title={"Agents"}
          numRows={numRows}
          columns={columns}
          data={data} />
      </div>
    );
  }

}

const mapStateToProps = (state) => ({
  globalAgents: state.agents,
  globalEntries: state.entries,
  globalClickedDashboardTable: state.tornjak.globalClickedDashboardTable,
})

export default withStyles(styles)(
  connect(mapStateToProps, {})(AgentDashboardTable)
)
