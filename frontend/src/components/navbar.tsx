import { Component } from 'react';
import jwt_decode from "jwt-decode";
import { connect } from 'react-redux';
import IsManager from './is_manager';
import 'carbon-components/css/carbon-components.min.css';
import './style.css';
import tornjak_logo from "res/tornjak_logo.png";
import tornjak_face from "res/tornjak_face.png";
import TornjakHelper from 'components/tornjak-helper';
import KeycloakService from "auth/KeycloakAuth";
import { RootState } from 'redux/reducers';
import TornjakApi from './tornjak-api-helpers';
import { Link } from 'react-router-dom';
import NavDropdown from './NavDropdown';
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
import {
  Dashboard, 
  BareMetalServer, 
  AssemblyCluster, 
  UserMultiple, 
  Notebook, 
  TwoPersonLift,
  OpenPanelFilledLeft,
  OpenPanelFilledRight,
  IbmCloudKubernetesService,
  Add,
  ZosSysplex,
  IbmCloudBareMetalServer
} from "@carbon/icons-react";

import SpireHealthCheck from 'components/spire-health-check';

// to enable SPIRE health check component
const spireHealthCheck = (env.REACT_APP_SPIRE_HEALTH_CHECK_ENABLE === 'true') ?? false; // defualt value false

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

type NavigationBarState = {
  sidebarOpen: boolean;
  isDropdownOpen: boolean;
}

class NavigationBar extends Component<NavigationBarProp, NavigationBarState> {
  TornjakHelper: TornjakHelper;
  TornjakApi: TornjakApi;
  constructor(props: NavigationBarProp) {
    super(props);
    this.TornjakHelper = new TornjakHelper({});
    this.TornjakApi = new TornjakApi(props);
    this.state = {
      sidebarOpen: true,
      isDropdownOpen: false
    };
  }

  toggleSidebar = () => {
    this.setState((prevState) => ({
      sidebarOpen: !prevState.sidebarOpen
    }));
  }

  toggleClustersDropdown = () => {
    this.setState((prevState) => ({
      isDropdownOpen: !prevState.isDropdownOpen,
    }));
  };

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
    const { sidebarOpen } = this.state;
    const isAdmin = this.TornjakHelper.checkRolesAdminUser(this.props.globalUserRoles), withAuth = env.REACT_APP_AUTH_SERVER_URI;
    let managerNavs;
    managerNavs =
      <div className="dropdown">
        <IbmCloudBareMetalServer className="icon-spacing"/>
        <a href="/server/manage" className="dropbtn">Manage Servers</a>
      </div>
    return (
      <div data-test="nav-bar">
        {sidebarOpen ? (
          <div className="navigation-bar">
            <div className="logo">
              <span>
                <a href="/">
                  <img src={tornjak_logo} height="50" width="160" alt="Tornjak" /></a>
              </span>
              
              <div className="toolbar_icons">
                <HeaderToolBar /> 
              </div>
            </div>

            <div className="dropdown-container">
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

              <div className="dropdown">
                <NavDropdown
                  icon={<AssemblyCluster className="icon-spacing" />}
                  title="Clusters"
                  link="/clusters"
                  isAdmin={Boolean(isAdmin)}
                  withAuth={Boolean(withAuth)}
                  subLinks={[
                    { label: 'Clusters List', to: '/clusters' },
                    {
                      label: 'Cluster Management',
                      to: '/cluster/clustermanagement',
                      adminOnly: true,
                    },
                  ]}
                />
              </div>

              <div className="dropdown">
                <NavDropdown
                  icon={<UserMultiple className="icon-spacing" />}
                  title="Agents"
                  link="/agents"
                  isAdmin={Boolean(isAdmin)}
                  withAuth={Boolean(withAuth)}
                  subLinks={[
                    { label: 'Agents List', to: '/agents' },
                    { label: 'Create Token', to: '/agent/createjointoken', adminOnly: true },
                  ]}
                />
              </div>

              <div className="dropdown">
                <NavDropdown
                  icon={<Notebook className="icon-spacing" />}
                  title="Entries"
                  link="/entries"
                  isAdmin={Boolean(isAdmin)}
                  withAuth={Boolean(withAuth)}
                  subLinks={[
                    { label: 'Entries List', to: '/entries' },
                    { label: 'Create Entries', to: '/entry/create', adminOnly: true },
                  ]}
                />
              </div>

              <div className="dropdown">
                <NavDropdown
                icon={<TwoPersonLift className="icon-spacing" />}
                title="Federations"
                link="/federations"
                isAdmin={Boolean(isAdmin)}
                withAuth={Boolean(withAuth)}
                subLinks={[
                  { label: 'Federations List', to: '/federations' },
                ]}
                />
              </div>
              
              <div className="dropdown">
                <BareMetalServer className="icon-spacing"/>
                <a href="/tornjak/serverinfo" className="dropbtn">Tornjak ServerInfo</a>
              </div>

              <div className="dropdown">
                <Dashboard className="icon-spacing"/>
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

            </div>

            {/* Temporarily using trust domain as server unique identifier */}
            <div className="spire-server-unique-identifier">
              <Tag type="cyan">
                <span style={{ fontWeight: 'bold' }}>Server ID: </span>
                <span style={{ textDecoration: 'underline', fontWeight: 'bold' }}>{this.props.globalServerInfo.trustDomain}</span>
                {this.props.globalDebugServerInfo.svid_chain[0].id.path}
              </Tag>
            </div>

            {spireHealthCheck &&
              <SpireHealthCheck />
            }

            <div className="sidepanel">
                <OpenPanelFilledLeft onClick={this.toggleSidebar} className = "panel" size={25}/>
            </div>
          </div>
        ) : (
          <div className="navigation-bar-collapsed">
              <Link to="/">
                  <div className="face">
                      <img src={tornjak_face} height="45" width="55" alt="Tornjak" />
                  </div>
              </Link>
              
              <div className="collapsed-icons">
                <div className="icon-container">
                  <Link to="/clusters">
                    <AssemblyCluster className="icon-spacing" size={32}/>
                  </Link>
                  <span className="icon-description">Clusters List</span>
                </div>

                {(isAdmin || !env.REACT_APP_AUTH_SERVER_URI) && (
                  <div className="icon-container">
                    <Link to="/cluster/clustermanagement">
                      <ZosSysplex className="icon-spacing" size={32}/>
                    </Link>
                    <span className="icon-description">Cluster Management</span>
                  </div>
                )}

                <div className="icon-container">
                  <Link to="/agents">
                    <UserMultiple className="icon-spacing" size={32}/>
                  </Link>
                  <span className="icon-description">Agents List</span>
                </div>

                {(isAdmin || !env.REACT_APP_AUTH_SERVER_URI) && (
                  <div className="icon-container">
                    <Link to="/agent/createjointoken">
                      <IbmCloudKubernetesService className="icon-spacing" size={32}/>
                    </Link>
                    <span className="icon-description">Create Token</span>
                  </div>
                )}

                <div className="icon-container">
                  <Link to="/entries">
                    <Notebook className="icon-spacing" size={32}/>
                  </Link>
                  <span className="icon-description">Entries List</span>
                </div>

                {(isAdmin || !env.REACT_APP_AUTH_SERVER_URI) && (
                  <div className="icon-container">
                    <Link to="/entry/create">
                      <Add className="icon-spacing" size={32}/>
                    </Link>
                    <span className="icon-description">Create Entries</span>
                  </div>
                )}

                <div className="icon-container">
                  <Link to="/federations">
                    <TwoPersonLift className="icon-spacing" size={32}/>
                  </Link>
                  <span className="icon-description">Federations List</span>
                </div>

                <div className="icon-container">
                  <Link to="/tornjak/serverinfo">
                    <BareMetalServer className="icon-spacing" size={32}/>
                  </Link>
                  <span className="icon-description">Tornjak ServerInfo</span>
                </div>

                <div className="icon-container">
                  <Link
                    to="/tornjak/dashboard"
                    onClick={() => {
                      if (this.props.globalClickedDashboardTable !== "dashboard") {
                        this.props.clickedDashboardTableFunc("dashboard");
                      }
                    }}
                  >
                    <Dashboard className="icon-spacing" size={32}/>
                  </Link>
                  <span className="icon-description">Tornjak Dashboard</span>
                </div>

                <div className="sidepanel">
                  <OpenPanelFilledRight onClick={this.toggleSidebar} className="panel2" size={32} />
                </div>
              </div>
          </div>
        )}
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