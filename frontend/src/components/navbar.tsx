import React, { Component } from 'react';
import jwt_decode from "jwt-decode";
import { connect } from 'react-redux';
import IsManager from './is_manager';
import 'carbon-components/css/carbon-components.min.css';
import './style.css';
import tornjak_logo from "res/tornjak_logo.png";
import TornjakHelper from 'components/tornjak-helper';
import KeycloakService from "auth/KeycloakAuth";
import { RootState } from 'redux/reducers';
import TornjakApi from './tornjak-api-helpers';
import {
  clickedDashboardTableFunc,
  isAuthenticatedUpdateFunc,
  accessTokenUpdateFunc,
  UserRolesUpdateFunc,
  serverInfoUpdateFunc,
  tornjakServerInfoUpdateFunc,
  spireDebugServerInfoUpdateFunc,
  tornjakMessageFunc
} from 'redux/actions';
import { Tag } from 'carbon-components-react';
import {
  AccessToken,
  ServerInfo,
  DebugServerInfo,
  TornjakServerInfo
} from './types';
import HeaderToolBar from './navbar-header-toolbar';
import { env } from '../env';

const Auth_Server_Uri = env.REACT_APP_AUTH_SERVER_URI;

type NavigationBarProp = {
  // dispatches a payload if user is authenticated or not return type of void
  isAuthenticatedUpdateFunc: (globalIsAuthenticated: boolean) => void,
  // whether user is authenticated or not
  globalIsAuthenticated: boolean,
  // dispatches a payload of the updated access token return type of void
  accessTokenUpdateFunc: (globalAccessToken: string | undefined) => void,
  // updated access token
  globalAccessToken: string | undefined,
  // dispatches a payload of the updated user roles return type of void
  UserRolesUpdateFunc: (globalUserRoles: string[]) => void,
  // updated user roles
  globalUserRoles: string[],
  // dispatches a payload for the clicked table in a dashboard as a string and has a return type of void
  clickedDashboardTableFunc: (globalClickedDashboardTable: string) => void,
  // the clicked dashboard table
  globalClickedDashboardTable: string,
  // the server trust domain and nodeAttestorPlugin as a ServerInfoType
  globalServerInfo: ServerInfo,
  // tornjak server debug info of the selected server
  globalDebugServerInfo: DebugServerInfo,
  // tornjak server info of the selected server
  globalTornjakServerInfo: TornjakServerInfo,
  // dispatches a payload for the server trust domain and nodeAttestorPlugin as a ServerInfoType and has a return type of void
  serverInfoUpdateFunc: (globalServerInfo: ServerInfo) => void,
  // dispatches a payload for the tornjak server info of the selected server and has a return type of void
  tornjakServerInfoUpdateFunc: (globalTornjakServerInfo: TornjakServerInfo) => void,
  // dispatches a payload for the debug server info of the selected server and has a return type of void
  spireDebugServerInfoUpdateFunc: (globalDebugServerInfo: DebugServerInfo) => void,
  // dispatches a payload for an Error Message/ Success Message of an executed function as a string and has a return type of void
  tornjakMessageFunc: (globalErrorMessage: string) => void,
  // the selected server for manager mode 
  globalServerSelected: string,
  // tornjak error messege
  globalErrorMessage: string,
}

type NavigationBarState = {}

class NavigationBar extends Component<NavigationBarProp, NavigationBarState> {
  TornjakHelper: TornjakHelper;
  TornjakApi: TornjakApi;
  constructor(props: NavigationBarProp) {
    super(props);
    this.TornjakHelper = new TornjakHelper({});
    this.TornjakApi = new TornjakApi(props);
    this.state = {};
  }

  componentDidMount() {
    if (Auth_Server_Uri) {
      this.props.isAuthenticatedUpdateFunc(KeycloakService.isLoggedIn());
      if (KeycloakService.isLoggedIn()) {
        this.props.accessTokenUpdateFunc(KeycloakService.getToken());
        var decodedToken: AccessToken = jwt_decode(KeycloakService.getToken()!);
        if (decodedToken.realm_access !== undefined) {
          if (decodedToken.realm_access.roles !== undefined) {
            this.props.UserRolesUpdateFunc(decodedToken.realm_access.roles);
          }
        }
      }
    }
    if (IsManager) {
      if (this.props.globalServerSelected !== "" && (this.props.globalErrorMessage === "OK" || this.props.globalErrorMessage === "")) {
        // this.TornjakApi.populateAgentsUpdate(this.props.globalServerSelected, this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc)
        // this.TornjakApi.populateEntriesUpdate(this.props.globalServerSelected, this.props.entriesListUpdateFunc, this.props.tornjakMessageFunc)
        // this.TornjakApi.refreshSelectorsState(this.props.globalServerSelected, this.props.agentworkloadSelectorInfoFunc);
        // this.setState({ selectedServer: this.props.globalServerSelected });
      }
    } else {
      this.TornjakApi.populateLocalTornjakServerInfo(this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
      this.TornjakApi.populateLocalTornjakDebugServerInfo(this.props.spireDebugServerInfoUpdateFunc, this.props.tornjakMessageFunc);
      this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
    }
  }

  render() {
    const isAdmin = this.TornjakHelper.checkRolesAdminUser(this.props.globalUserRoles), withAuth = env.REACT_APP_AUTH_SERVER_URI;
    let managerNavs;
    managerNavs =
      <div className="dropdown">
        <a href="/server/manage" className="dropbtn">Manage Servers</a>
      </div>
    return (
      <div data-test="nav-bar">
        <div className="navigation-bar">
          <div className="dropdown-container">
            <div className="dropdown">
              <a href="/clusters" className="dropbtn">Clusters </a>
              <div className="dropdown-content">
                <a href="/clusters" className="nav-link">Clusters List</a>
                {(isAdmin || !withAuth) &&
                  <a href="/cluster/clustermanagement" className="nav-link">Cluster Management</a>
                }
              </div>
            </div>
            <div className="dropdown">
              <a href="/clusters" className="dropbtn">Federations </a>
              <div className="dropdown-content">
                <a href="/federations" className="nav-link">Federations List</a>
                {(isAdmin || !withAuth) &&
                    <a href="" className="nav-link">Create Federation</a>
                }
              </div>
            </div>
            <div className="dropdown">
              <a href="/agents" className="dropbtn">Agents </a>
              <div className="dropdown-content">
                <a href="/agents" className="nav-link">Agents List</a>
                {(isAdmin || !withAuth) &&
                  <a href="/agent/createjointoken" className="nav-link">Create Token</a>
                }
              </div>
            </div>
            <div className="dropdown">
              <a href="/entries" className="dropbtn">Entries</a>
              <div className="dropdown-content">
                <a href="/entries" className="nav-link">Entries List</a>
                {(isAdmin || !withAuth) &&
                  <a href="/entry/create" className="nav-link">Create Entries</a>
                }
              </div>
            </div>
            <div className="dropdown">
              <a href="/tornjak/serverinfo" className="dropbtn">Tornjak ServerInfo</a>
            </div>
            <div className="dropdown">
              <a
                href="/tornjak/dashboard"
                className="dropbtn"
                onClick={() => {
                  if (this.props.globalClickedDashboardTable !== "dashboard") {
                    this.props.clickedDashboardTableFunc("dashboard")
                  }
                }}
              >Tornjak Dashboard</a>
            </div>
            <HeaderToolBar />
            {Auth_Server_Uri && isAdmin &&
              <div className="admin-toolbar-header">
                <h5>ADMIN PORTAL</h5>
              </div>
            }
            {IsManager &&
              <div className="manager-toolbar-header">
                <h5>MANAGER PORTAL</h5>
              </div>
            }
            {IsManager && managerNavs}
          </div>
        </div>
        <div className="logo">
          <span>
            <a href="/">
              <img src={tornjak_logo} height="50" width="160" alt="Tornjak" /></a>
          </span>
        </div>
        {/* Temporarily using trust domain as server unique identifier */}
        <div className="spire-server-unique-identifier">
          <Tag type="cyan">
            <span style={{ fontWeight: 'bold' }}>Server ID: </span>
            <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>{this.props.globalServerInfo.trustDomain}</span>
            {this.props.globalDebugServerInfo.svid_chain[0].id.path}
          </Tag>
        </div>
      </div>
    );
  }
}

// Note: Needed for UI testing - will be removed after
// NavigationBar.propTypes = {
//   globalClickedDashboardTable: PropTypes.string,
//   clickedDashboardTableFunc: PropTypes.func,
// };

const mapStateToProps = (state: RootState) => ({
  globalClickedDashboardTable: state.tornjak.globalClickedDashboardTable,
  globalIsAuthenticated: state.auth.globalIsAuthenticated,
  globalAccessToken: state.auth.globalAccessToken,
  globalUserRoles: state.auth.globalUserRoles,
  globalServerInfo: state.servers.globalServerInfo,
  globalDebugServerInfo: state.servers.globalDebugServerInfo,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalServerSelected: state.servers.globalServerSelected,
  globalErrorMessage: state.tornjak.globalErrorMessage,
})

export default connect(
  mapStateToProps,
  {
    clickedDashboardTableFunc,
    isAuthenticatedUpdateFunc,
    accessTokenUpdateFunc,
    UserRolesUpdateFunc,
    serverInfoUpdateFunc,
    tornjakServerInfoUpdateFunc,
    spireDebugServerInfoUpdateFunc,
    tornjakMessageFunc
  }
)(NavigationBar)

export { NavigationBar }