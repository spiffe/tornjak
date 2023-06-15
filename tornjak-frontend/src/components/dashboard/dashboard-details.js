import React from "react";
import { connect } from "react-redux";
import { withStyles } from "tss-react/mui";
// Components
import { Container, Grid, Paper } from "@mui/material";
// Tables
import ClusterDashboardTableStyled from "./clusters-dashboard-table";
import AgentDashboardTableStyled from "./agents-dashboard-table";
import EntriesDashBoardTableStyled from "./entries-dashboard-table";
import DashboardDrawerStyled from "./dashboard-drawer";

const styles = (theme) => ({
  root: {
    marginTop: -25,
    marginLeft: -20,
    display: "flex",
  },
  appBarSpacer: theme.mixins.toolbar,
  content: {
    flexGrow: 1,
  },
  container: {
    //container for root
    paddingTop: theme.spacing(4),
    paddingBottom: theme.spacing(4),
    marginLeft: 0,
  },
  paper: {
    //container for all grids
    padding: theme.spacing(2),
    display: "flex",
    overflow: "auto",
    flexDirection: "column",
    marginBottom: 20,
  },
  detailsTitle: {
    fontSize: 20,
    color: "rgb(89, 103, 185)",
  },
  metadataTag: {
    fontWeight: "bold",
    fontSize: 17,
    marginTop: 10,
  },

  dashboardDetalsLine: {
    marginLeft: 0,
    width: 1200,
  },
  metadataDetails: {
    fontSize: 17,
  },
});

// DashboardDetails takes in the selected data and props from dashboard table for a specific entity
// returns details page for dashboard
class DashboardDetails extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDataKey: this.selectedDataKey(),
    };
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedData !== this.props.selectedData) {
      this.setState({
        selectedDataKey: this.selectedDataKey(),
      });
    }
  }

  selectedDataKey() {
    var { selectedData } = this.props;
    var clickedDashboardTable = this.props.globalClickedDashboardTable,
      selectedDataKey = [];
    if (selectedData !== undefined) {
      if (clickedDashboardTable === "clustersdetails") {
        //to filter agents in clustersdetails
        selectedDataKey["agentsFilter"] = selectedData.name;
        //to filter entries in clustersdetails
        selectedDataKey["entriesFilter"] = selectedData.name;
      } else if (clickedDashboardTable === "entriesdetails") {
        //to filter agents in entriesdetails
        selectedDataKey["agentsFilter"] = selectedData.parentId;
        //to filter clusters in entriesdetails
        selectedDataKey["clustersFilter"] = selectedData.clusterName;
      } else if (clickedDashboardTable === "agentsdetails") {
        //to filter clusters in agentsdetails
        selectedDataKey["clustersFilter"] = selectedData.clusterName;
        //to filter entries in agentsdetails
        selectedDataKey["entriesFilter"] = selectedData.spiffeid;
      }
    }
    return selectedDataKey;
  }

  render() {
    const { selectedDataKey } = this.state;
    const classes = withStyles.getClasses(this.props);
    const { selectedData } = this.props;
    return (
      <div className={classes.root}>
        <DashboardDrawerStyled />
        <main className={classes.content}>
          <div className={classes.appBarSpacer} />
          {selectedData.length !== 0 && !selectedData[0] && (
            <div>
              {
                this.props.globalClickedDashboardTable ===
                  "clustersdetails" && (
                  <div className="clustersdetails">
                    <Container maxWidth="lg" className={classes.container}>
                      <Grid item xs={12}>
                        <Paper className={classes.paper}>
                          <p className={classes.detailsTitle}>
                            Cluster Name : <b>{selectedData.name}</b>
                          </p>
                          <p className={classes.metadataTag}>Metadata</p>
                          <hr className={classes.dashboardDetalsLine}></hr>
                          <p className={classes.metadataDetails}>
                            Created : <b>{selectedData.created} </b>
                          </p>
                          <p className={classes.metadataDetails}>
                            Number of Nodes : <b>{selectedData.numNodes} </b>
                          </p>
                          <p className={classes.metadataDetails}>
                            Number of Entries: <b>{selectedData.numEntries}</b>{" "}
                          </p>
                        </Paper>
                      </Grid>
                    </Container>
                    <Container maxWidth="lg" className={classes.container}>
                      {/* Agents Table */}
                      <Grid item xs={12}>
                        <Paper className={classes.paper}>
                          <AgentDashboardTableStyled
                            numRows={100}
                            filterByCluster={selectedDataKey["agentsFilter"]}
                          />
                        </Paper>
                      </Grid>
                    </Container>
                    <Container maxWidth="lg" className={classes.container}>
                      {/* Entries Table */}
                      <Grid item xs={12}>
                        <Paper className={classes.paper}>
                          <EntriesDashBoardTableStyled
                            numRows={100}
                            filterByCluster={selectedDataKey["entriesFilter"]}
                          />
                        </Paper>
                      </Grid>
                    </Container>
                  </div>
                ) // End clustersdetails
              }
              {
                this.props.globalClickedDashboardTable === "agentsdetails" && (
                  <div className="agentsdetails">
                    <Container maxWidth="lg" className={classes.container}>
                      <Grid item xs={12}>
                        <Paper className={classes.paper}>
                          <p className={classes.detailsTitle}>
                            Agent Name : <b>{selectedData.spiffeid}</b>
                          </p>
                          <p className={classes.metadataTag}>Metadata</p>
                          <hr className={classes.dashboardDetalsLine}></hr>
                          <p className={classes.metadataDetails}>
                            Belongs to Cluster :{" "}
                            <b>{selectedData.clusterName}</b>{" "}
                          </p>
                          <p className={classes.metadataDetails}>
                            Status : <b>{selectedData.status}</b>{" "}
                          </p>
                          <p className={classes.metadataDetails}>
                            Platform Type : <b>{selectedData.platformType}</b>{" "}
                          </p>
                          <p className={classes.metadataDetails}>
                            Number of Entries: <b>{selectedData.numEntries}</b>{" "}
                          </p>
                        </Paper>
                      </Grid>
                    </Container>
                    <Container maxWidth="lg" className={classes.container}>
                      {/* Clusters Table */}
                      <Grid item xs={12}>
                        <Paper className={classes.paper}>
                          <ClusterDashboardTableStyled
                            numRows={100}
                            filterByCluster={selectedDataKey["clustersFilter"]}
                          />
                        </Paper>
                      </Grid>
                    </Container>
                    <Container maxWidth="lg" className={classes.container}>
                      {/* Entries Table */}
                      <Grid item xs={12}>
                        <Paper className={classes.paper}>
                          <EntriesDashBoardTableStyled
                            numRows={100}
                            filterByAgentId={selectedDataKey["entriesFilter"]}
                          />
                        </Paper>
                      </Grid>
                    </Container>
                  </div>
                ) // End agentsdetails
              }
              {
                this.props.globalClickedDashboardTable === "entriesdetails" && (
                  <div className="entriesdetails">
                    <Container maxWidth="lg" className={classes.container}>
                      <Grid item xs={12}>
                        <Paper className={classes.paper}>
                          <p className={classes.detailsTitle}>
                            Entry ID : <b>{selectedData.id}</b>
                          </p>
                          <p className={classes.metadataTag}>Metadata</p>
                          <hr className={classes.dashboardDetalsLine}></hr>
                          <p className={classes.metadataDetails}>
                            Entry Name : <b>{selectedData.spiffeid}</b>
                          </p>
                          <p className={classes.metadataDetails}>
                            Parent ID : <b>{selectedData.parentId}</b>{" "}
                          </p>
                          <p className={classes.metadataDetails}>
                            Belongs to Cluster :{" "}
                            <b>{selectedData.clusterName}</b>{" "}
                          </p>
                          <p className={classes.metadataDetails}>
                            Platform Type : <b>{selectedData.platformType}</b>{" "}
                          </p>
                          <p className={classes.metadataDetails}>
                            Is Admin :{" "}
                            <b>
                              {selectedData.adminFlag.toString().toUpperCase()}
                            </b>{" "}
                          </p>
                          <p className={classes.metadataDetails}>
                            Entry Expire Time:{" "}
                            <b>{selectedData.entryExpireTime}</b>{" "}
                          </p>
                        </Paper>
                      </Grid>
                    </Container>
                    <Container maxWidth="lg" className={classes.container}>
                      {/* Clusters Table */}
                      <Grid item xs={12}>
                        <Paper className={classes.paper}>
                          <ClusterDashboardTableStyled
                            numRows={100}
                            filterByCluster={selectedDataKey["clustersFilter"]}
                          />
                        </Paper>
                      </Grid>
                    </Container>
                    <Container maxWidth="lg" className={classes.container}>
                      {/* Agents Table */}
                      <Grid item xs={12}>
                        <Paper className={classes.paper}>
                          <AgentDashboardTableStyled
                            numRows={100}
                            filterByAgentId={selectedDataKey["agentsFilter"]}
                          />
                        </Paper>
                      </Grid>
                    </Container>
                  </div>
                ) // End entriesdetails
              }
              {this.props.globalClickedDashboardTable === "clusters" && (
                <Container maxWidth="lg" className={classes.container}>
                  {/* Clusters Table */}
                  <Grid item xs={12}>
                    <Paper className={classes.paper}>
                      <ClusterDashboardTableStyled
                        numRows={100}
                        filterByCluster={selectedDataKey["clustersFilter"]} 
                      />
                    </Paper>
                  </Grid>
                </Container>
              )}
              {this.props.globalClickedDashboardTable === "agents" && (
                <Container maxWidth="lg" className={classes.container}>
                  {/* Agents Table */}
                  <Grid item xs={12}>
                    <Paper className={classes.paper}>
                      <AgentDashboardTableStyled 
                        numRows={100} 
                        filterByAgentId={selectedDataKey["agentsFilter"]}
                        filterByCluster={selectedDataKey["agentsFilter"]}
                      />
                    </Paper>
                  </Grid>
                </Container>
              )}
              {this.props.globalClickedDashboardTable === "entries" && (
                <Container maxWidth="lg" className={classes.container}>
                  {/* Entries Table */}
                  <Grid item xs={12}>
                    <Paper className={classes.paper}>
                      <EntriesDashBoardTableStyled 
                        numRows={100}
                        filterByAgentId={selectedDataKey["entriesFilter"]}
                        filterByCluster={selectedDataKey["entriesFilter"]}
                      />
                    </Paper>
                  </Grid>
                </Container>
              )}
            </div>
          )}
        </main>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  globalClickedDashboardTable: state.tornjak.globalClickedDashboardTable,
});

const DashboardDetailsStyled = withStyles(DashboardDetails, styles);
export default connect(mapStateToProps, {})(DashboardDetailsStyled);

