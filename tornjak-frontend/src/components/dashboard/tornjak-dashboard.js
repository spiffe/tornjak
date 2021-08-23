import React from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
// Components
import {
  Container,
  Grid,
  Paper,
} from '@material-ui/core';
// Pie Charts
import AgentsPieChart from './agents-pie-chart';
import ClustersPieChart from './clusters-pie-chart';
// Tables
import ClustersTable from './clusters-dashboard-table';
import AgentsTable from './agents-dashboard-table';
import EntriesTable from './entries-dashboard-table';
import IsManager from '../is_manager';
import TornjakApi from '../tornjak-api-helpers';
import {
  entriesListUpdateFunc,
  serverSelectedFunc,
  agentsListUpdateFunc,
  tornjakServerInfoUpdateFunc,
  serverInfoUpdateFunc,
  selectorInfoFunc,
  tornjakMessageFunc,
  agentworkloadSelectorInfoFunc,
  clustersListUpdateFunc,
  clickedDashboardTabelFunc,
} from 'redux/actions';
import SpiffeHelper from '../spiffe-helper';
import DashboardDrawer from './dashboard-drawer';

const styles = theme => ({
  root: {
    marginTop: -25,
    marginLeft: -20,
    display: 'flex',
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
  },
  container: { //container for root
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    marginLeft: 0
  },
  paper: { //container for all grids
    padding: theme.spacing(2),
    display: 'flex',
    overflow: 'auto',
    flexDirection: 'column',
    marginBottom: 20
  },
  fixedHeight: {
    height: 370, //height of piechart container
  },
});


class TornjakDashboard extends React.Component {
  constructor(props) {
    super(props);
    const { classes } = this.props;
    this.state = {
    };
    this.fixedHeightPaper = clsx(classes.paper, classes.fixedHeight)
    this.TornjakApi = new TornjakApi();
    this.SpiffeHelper = new SpiffeHelper();
  }

  agentSpiffeids() {
    if (typeof this.props.globalAgents.globalAgentsList !== undefined) {
      return this.props.globalAgents.globalAgentsList.map(currentAgent => {
        return this.SpiffeHelper.getAgentSpiffeid(currentAgent)
      })
    } else {
      return ""
    }
  }

  componentDidMount() {
    if (IsManager) {
      if (this.props.globalServerSelected !== "") {
        this.TornjakApi.populateAgentsUpdate(this.props.globalServerSelected, this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
        this.TornjakApi.populateEntriesUpdate(this.props.globalServerSelected, this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc)
        this.TornjakApi.populateClustersUpdate(this.props.globalServerSelected, this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
        this.TornjakApi.populateTornjakAgentInfo(this.props.globalServerSelected, this.props.agentworkloadSelectorInfoFunc, { "agents": this.agentSpiffeids() });
      }
    } else {
      this.TornjakApi.populateLocalAgentsUpdate(this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
      this.TornjakApi.populateLocalEntriesUpdate(this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc)
      this.TornjakApi.populateLocalClustersUpdate(this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
      this.TornjakApi.populateLocalTornjakAgentInfo(this.props.agentworkloadSelectorInfoFunc, "");
      if (this.props.globalTornjakServerInfo !== "") {
        this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
      }
    }
  }

  componentDidUpdate(prevProps) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.TornjakApi.populateAgentsUpdate(this.props.globalServerSelected, this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
        this.TornjakApi.populateEntriesUpdate(this.props.globalServerSelected, this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc)
        this.TornjakApi.populateClustersUpdate(this.props.globalServerSelected, this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
        this.TornjakApi.populateTornjakAgentInfo(this.props.globalServerSelected, this.props.agentworkloadSelectorInfoFunc, { "agents": this.agentSpiffeids() });
      }
    } else {
      if (prevProps.globalTornjakServerInfo !== this.props.globalTornjakServerInfo) {
        this.TornjakApi.populateLocalAgentsUpdate(this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
        this.TornjakApi.populateLocalEntriesUpdate(this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc)
        this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc)
        this.TornjakApi.populateLocalTornjakAgentInfo(this.props.agentworkloadSelectorInfoFunc, "");
        this.TornjakApi.populateLocalClustersUpdate(this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
      }
    }
  }

  render() {
    const { classes } = this.props;
    return (
      <div className={classes.root}>
        <DashboardDrawer />
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          {(this.props.globalClickedDashboardTable === "" || this.props.globalClickedDashboardTable === "dashboard") &&
            <Container maxWidth="lg" className={classes.container}>
              <Grid container spacing={3}>
                {/* Pie Chart Clusters */}
                <Grid item xs={6}>
                  <Paper className={this.fixedHeightPaper}>
                    <ClustersPieChart />
                  </Paper>
                </Grid>
                {/* Pie Chart Agents*/}
                <Grid item xs={6}>
                  <Paper className={this.fixedHeightPaper}>
                    <AgentsPieChart />
                  </Paper>
                </Grid>
                {/* Clusters Table */}
                <Grid item xs={12}>
                  <Paper className={classes.paper}>
                    <ClustersTable
                      numRows={5} />
                  </Paper>
                </Grid>
                {/* Agents Table */}
                <Grid item xs={12}>
                  <Paper className={classes.paper}>
                    <AgentsTable
                      numRows={5} />
                  </Paper>
                </Grid>
                {/* Entries Table */}
                <Grid item xs={12}>
                  <Paper className={classes.paper}>
                    <EntriesTable
                      numRows={5} />
                  </Paper>
                </Grid>
              </Grid>
            </Container>
          }
          {(this.props.globalClickedDashboardTable === "clusters") &&
            <Container maxWidth="lg" className={classes.container}>
              {/* Clusters Table */}
              <Grid item xs={12}>
                <Paper className={classes.paper}>
                  <ClustersTable
                    numRows={100} />
                </Paper>
              </Grid>
            </Container>
          }
          {(this.props.globalClickedDashboardTable === "agents") &&
            <Container maxWidth="lg" className={classes.container}>
              {/* Agents Table */}
              <Grid item xs={12}>
                <Paper className={classes.paper}>
                  <AgentsTable
                    numRows={100} />
                </Paper>
              </Grid>
            </Container>
          }
          {(this.props.globalClickedDashboardTable === "entries") &&
            <Container maxWidth="lg" className={classes.container}>
              {/* Entries Table */}
              <Grid item xs={12}>
                <Paper className={classes.paper}>
                  <EntriesTable
                    numRows={100} />
                </Paper>
              </Grid>
            </Container>
          }
        </main>
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalClustersList: state.clusters.globalClustersList,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessage: state.tornjak.globalErrorMessage,
  globalAgents: state.agents,
  globalEntries: state.entries.globalEntriesList,
  globalClickedDashboardTable: state.tornjak.globalClickedDashboardTable,
})

export default withStyles(styles)(connect(
  mapStateToProps,
  { entriesListUpdateFunc, agentsListUpdateFunc, agentworkloadSelectorInfoFunc, clustersListUpdateFunc, tornjakMessageFunc, serverInfoUpdateFunc, serverSelectedFunc, tornjakServerInfoUpdateFunc, selectorInfoFunc, clickedDashboardTabelFunc }
)(TornjakDashboard))
