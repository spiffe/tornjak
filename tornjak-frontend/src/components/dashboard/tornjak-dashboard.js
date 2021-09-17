import React from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
// Components
import {
  CssBaseline,
  Drawer,
  AppBar,
  Toolbar,
  List,
  Typography,
  Divider,
  IconButton,
  Container,
  Grid,
  Paper,
  ListItem,
  ListItemIcon,
  ListItemText,
  ListSubheader,
} from '@material-ui/core';
// Icons
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DashboardIcon from '@material-ui/icons/Dashboard';
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
import LayersIcon from '@material-ui/icons/Layers';
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

const drawerWidth = 240;
const drawerHeight = '100%';

const styles = theme => ({
  root: {
    marginTop: -25,
    marginLeft: -20,
    display: 'flex',
  },
  toolbar: {
    paddingRight: 24, // keep right padding when drawer closed
  },
  toolbarIcon: { //drawer icon close
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'flex-end',
    padding: '0 8px',
    ...theme.mixins.toolbar,
  },
  appBar: { //appbar
    backgroundColor: 'grey',
    marginTop: 52,
    zIndex: 2,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  appBarShift: { //appbar on shift/ open
    marginLeft: drawerWidth,
    width: `calc(100% - ${drawerWidth}px)`,
    transition: theme.transitions.create(['width', 'margin'], {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  menuButton: { //menu button next to Tornjak Dashboard title on view
    marginRight: 35,
  },
  menuButtonHidden: { //menu button next to Tornjak Dashboard title on hidden
    display: 'none',
  },
  title: {
    flexGrow: 1,
  },
  drawerPaper: { //dashboard side drawer on open
    position: 'relative',
    whiteSpace: 'nowrap',
    zIndex: 1,
    width: drawerWidth,
    height: drawerHeight,
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerPaperClose: { //dashboard side drawer on close
    overflowX: 'hidden',
    transition: theme.transitions.create('width', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
    width: theme.spacing(7),
    [theme.breakpoints.up('sm')]: {
      width: theme.spacing(9),
    },
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
  },
  container: { //container for root
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
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
      open: true,
      clickedDashboardList: ""
    };
    this.handleDrawerOpen = () => this.setState({ open: true })
    this.handleDrawerClose = () => this.setState({ open: false })
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
        <CssBaseline />
        <AppBar position="absolute" className={clsx(classes.appBar, this.state.open && classes.appBarShift)}>
          <Toolbar className={classes.toolbar}>
            <IconButton
              edge="start"
              color="inherit"
              aria-label="open drawer"
              onClick={this.handleDrawerOpen}
              className={clsx(classes.menuButton, this.state.open && classes.menuButtonHidden)}
            >
              <MenuIcon />
            </IconButton>
            <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
              Tornjak Dashboard
            </Typography>
          </Toolbar>
        </AppBar>
        <Drawer
          variant="permanent"
          classes={{
            paper: clsx(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
          }}
          open={this.state.open}
        >
          <div className={classes.toolbarIcon}>
            <IconButton onClick={this.handleDrawerClose}>
              <ChevronLeftIcon />
            </IconButton>
          </div>
          <Divider />
          <List>
            <div>
              <ListItem
                button
                onClick={() => { this.props.clickedDashboardTabelFunc("dashboard"); }}>
                <ListItemIcon>
                  <DashboardIcon />
                </ListItemIcon>
                <ListItemText primary="Dashboard" />
              </ListItem>
              <ListSubheader inset>Details</ListSubheader>
              <ListItem
                button
                onClick={() => { this.props.clickedDashboardTabelFunc("clusters"); }}>
                <ListItemIcon>
                  <LayersIcon />
                </ListItemIcon>
                <ListItemText primary="Clusters" />
              </ListItem>
              <ListItem
                button
                onClick={() => { this.props.clickedDashboardTabelFunc("agents"); }}>
                <ListItemIcon>
                  <PeopleIcon />
                </ListItemIcon>
                <ListItemText primary="Agents" />
              </ListItem>
              <ListItem
                button
                onClick={() => { this.props.clickedDashboardTabelFunc("entries"); }}>
                <ListItemIcon>
                  <BarChartIcon />
                </ListItemIcon>
                <ListItemText primary="Entries" />
              </ListItem>
            </div>
          </List>
          <Divider />
        </Drawer>
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
  globalClickedDashboardTable: state.tornjak.globalClickedDashboardTable
})

export default withStyles(styles)(connect(
  mapStateToProps,
  { entriesListUpdateFunc, agentsListUpdateFunc, agentworkloadSelectorInfoFunc, clustersListUpdateFunc, tornjakMessageFunc, serverInfoUpdateFunc, serverSelectedFunc, tornjakServerInfoUpdateFunc, selectorInfoFunc, clickedDashboardTabelFunc }
)(TornjakDashboard))
