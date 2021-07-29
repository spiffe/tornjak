import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from '@material-ui/core/styles';
import renderCellExpand from './render-cell-expand';
import TableDashboard from './table/dashboard-table';
import SpiffeEntryInterface from '../spiffe-entry-interface';

const columns = [
  { field: "spiffeid", headerName: "Name", flex: 1, renderCell: renderCellExpand },
  { field: "numEntries", headerName: "Number of Entries", width: 200 },
  { field: "status", headerName: "Status", width: 120 },
  { field: "platformType", headerName: "Platform Type", width: 170 },
  { field: "clusterName", headerName: "Cluster Name", width: 190 }
];

const styles = theme => ({
  seeMore: {
    marginTop: theme.spacing(3),
  },
});

class AgentDashboardTable extends React.Component {
  constructor(props) {
    super(props);
    this.SpiffeEntryInterface = new SpiffeEntryInterface()
  }

  numberEntries(spiffeid) {
    if (typeof this.props.globalEntries.globalEntriesList !== 'undefined') {
      var entriesList = this.props.globalEntries.globalEntriesList.filter(entry => {
        return (typeof entry !== 'undefined') && (this.SpiffeEntryInterface.getEntryParentid(entry) === spiffeid)
      });
      if (typeof entriesList === 'undefined') {
        return 0
      } else {
        return entriesList.length
      }
    } else {
      return 0
    }
  }

  agent(entry) {
    var thisSpiffeid = this.SpiffeEntryInterface.getAgentSpiffeid(entry);
    // get status
    var status = this.SpiffeEntryInterface.getAgentStatusString(entry);
    // get tornjak metadata
    var metadata_entry = this.SpiffeEntryInterface.getAgentMetadata(thisSpiffeid, this.props.globalAgents.globalAgentsWorkLoadAttestorInfo);
    var plugin = "None"
    var cluster = "None"
    if (typeof metadata_entry["plugin"] !== 'undefined' && metadata_entry["plugin"].length !== 0) {
      plugin = metadata_entry["plugin"]
    }
    if (typeof metadata_entry["cluster"] !== 'undefined' && metadata_entry["cluster"].length !== 0) {
      cluster = metadata_entry["cluster"]
    }
    return {
      id: thisSpiffeid,
      spiffeid: thisSpiffeid,
      numEntries: this.numberEntries(thisSpiffeid),
      status: status,
      platformType: plugin,
      clusterName: cluster,
    }
  }

  agentList() {
    if (typeof this.props.globalAgents.globalAgentsList !== undefined) {
      return this.props.globalAgents.globalAgentsList.map(currentAgent => {
        return this.agent(currentAgent);
      })
    } else {
      return []
    }
  }

  render() {
    const { numRows, tableType } = this.props;
    var data = this.agentList();
    return (
      <div>
        <TableDashboard 
          title={"Agents"}
          numRows={numRows}
          tableType={tableType}
          columns={columns}
          data={data}/>
      </div>
    );
  }

}

const mapStateToProps = (state) => ({
  globalAgents: state.agents,
  globalEntries: state.entries,
})

export default withStyles(styles)(
  connect(mapStateToProps, {})(AgentDashboardTable)
)