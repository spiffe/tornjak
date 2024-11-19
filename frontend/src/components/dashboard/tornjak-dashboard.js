import React from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import { withStyles } from 'tss-react/mui';
// Components
import {
  Container,
  Grid,
  Paper,
  ThemeProvider,
  createTheme
} from '@mui/material';
// Pie Charts
import AgentsPieChart from './agents-pie-chart';
import ClustersPieChart from './clusters-pie-chart';
// Tables
import ClusterDashboardTableStyled from './clusters-dashboard-table';
import AgentDashboardTableStyled from './agents-dashboard-table';
import EntriesDashBoardTableStyled from './entries-dashboard-table';
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
  clickedDashboardTableFunc,
} from 'redux/actions';
import SpiffeHelper from '../spiffe-helper';
import DashboardDrawerStyled from './dashboard-drawer';

const theme = createTheme({
  typography: {
  body1: {
    fontFamily: "'IBM Plex Sans', 'Helvetica Neue', 'Arial', sans-serif",
    letterSpacing: .16,
    fontSize: "0.875rem",
    lineHeight: 1
  }
}});

const styles = (theme) => ({
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
    marginBottom: 20,
    marginTop: 10
  },
  fixedHeight: {
    height: 370, //height of piechart container
  },
});

class TornjakDashboard extends React.Component {
  constructor(props) {
    super(props);
    const classes = withStyles.getClasses(this.props);
    this.state = {};
    this.fixedHeightPaper = clsx(classes.paper, classes.fixedHeight)
    this.TornjakApi = new TornjakApi();
    this.SpiffeHelper = new SpiffeHelper();
  }

  agentSpiffeids() {
    if (this.props.globalAgents.globalAgentsList !== undefined) {
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
      if (prevProps.globalDebugServerInfo !== this.props.globalDebugServerInfo) {
        this.TornjakApi.populateLocalAgentsUpdate(this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
        this.TornjakApi.populateLocalEntriesUpdate(this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc)
        this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc)
        this.TornjakApi.populateLocalTornjakAgentInfo(this.props.agentworkloadSelectorInfoFunc, "");
        this.TornjakApi.populateLocalClustersUpdate(this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
      }
    }
  }

  render() {
    const classes = withStyles.getClasses(this.props);
    return (
      <ThemeProvider theme={theme} >
        <div className={classes.root}>
          <DashboardDrawerStyled />
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
                      <ClusterDashboardTableStyled
                        numRows={5} />
                    </Paper>
                  </Grid>
                  {/* Agents Table */}
                  <Grid item xs={12}>
                    <Paper className={classes.paper}>
                      <AgentDashboardTableStyled
                        numRows={5} />
                    </Paper>
                  </Grid>
                  {/* Entries Table */}
                  <Grid item xs={12}>
                    <Paper className={classes.paper}>
                      <EntriesDashBoardTableStyled
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
                    <ClusterDashboardTableStyled
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
                    <AgentDashboardTableStyled
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
                    <EntriesDashBoardTableStyled
                      numRows={100} />
                  </Paper>
                </Grid>
              </Container>
            }
          </main>
        </div>
      </ThemeProvider>
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
  globalDebugServerInfo: state.servers.globalDebugServerInfo,
})

const TornjakDashboardStyled = withStyles(TornjakDashboard, styles);

export default connect(
  mapStateToProps,
  { entriesListUpdateFunc, 
    agentsListUpdateFunc, 
    agentworkloadSelectorInfoFunc, 
    clustersListUpdateFunc, 
    tornjakMessageFunc, 
    serverInfoUpdateFunc, 
    serverSelectedFunc, 
    tornjakServerInfoUpdateFunc, 
    selectorInfoFunc, 
    clickedDashboardTableFunc }
)(TornjakDashboardStyled);
