import React, { Component } from 'react';
import axios from 'axios';
import jwt_decode from "jwt-decode";
import { connect } from 'react-redux';
import IsManager from './is_manager';
import 'carbon-components/css/carbon-components.min.css';
import './style.css';
import tornjak_logo from "res/tornjak_logo.png";
import TornjakHelper from 'components/tornjak-helper';
import {
  clickedDashboardTableFunc,
  isAuthenticatedUpdateFunc,
  accessTokenUpdateFunc,
  UserRolesUpdateFunc,
} from 'redux/actions';
import {
  AccessToken
} from './types'
//import { useKeycloak } from "@react-keycloak/web";
import {
  HeaderGlobalAction,
} from "carbon-components-react/lib/components/UIShell";
import { UserAvatar20, Notification20, Search20 } from "@carbon/icons-react";
import KeycloakService from "services/KeycloakService";
import { RootState } from 'redux/reducers';

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
}

type NavigationBarState = {}

class NavigationBar extends Component<NavigationBarProp, NavigationBarState> {
  TornjakHelper: TornjakHelper;
  constructor(props: NavigationBarProp) {
    super(props);
    this.TornjakHelper = new TornjakHelper(props);
    this.state = {};
  }

  componentDidMount() {
    this.props.isAuthenticatedUpdateFunc(KeycloakService.isLoggedIn());
    if (KeycloakService.isLoggedIn()) {
      this.props.accessTokenUpdateFunc(KeycloakService.getToken());
      var decodedToken: AccessToken = jwt_decode(KeycloakService.getToken()!);
      this.props.UserRolesUpdateFunc(decodedToken.realm_access.roles);
      console.log(decodedToken)
      console.log(decodedToken.realm_access.roles)
      console.log("Access Token: ", KeycloakService.getToken())
    }
    //this.setAuthToken(KeycloakService.getToken())
  }

  setAuthToken(token: string | undefined) {
    //axios.defaults.headers.common["content-type"] = "application/json";
    axios.defaults.headers.common["Access-Control-Allow-Origin"] = "*";
    //axios.defaults.headers.common["Access-Control-Allow-Headers"] = "*";
    //axios.defaults.headers.common["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS";
    //axios.defaults.crossdomain = true;
    axios.defaults.headers.common['Authorization'] = '';
    delete axios.defaults.headers.common['Authorization'];
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    }
  }

  render() {
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
                {this.TornjakHelper.checkRolesAdminUser(this.props.globalUserRoles) &&
                  <a href="/cluster/clustermanagement" className="nav-link">Cluster Management</a>
                }
              </div>
            </div>
            <div className="dropdown">
              <a href="/agents" className="dropbtn">Agents </a>
              <div className="dropdown-content">
                <a href="/agents" className="nav-link">Agents List</a>
                {this.TornjakHelper.checkRolesAdminUser(this.props.globalUserRoles) &&
                  <a href="/agent/createjointoken" className="nav-link">Create Token</a>
                }
              </div>
            </div>
            <div className="dropdown">
              <a href="/entries" className="dropbtn">Entries</a>
              <div className="dropdown-content">
                <a href="/entries" className="nav-link">Entries List</a>
                {this.TornjakHelper.checkRolesAdminUser(this.props.globalUserRoles) &&
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
            {/* <div className="user-name">
            <h6>{KeycloakService.getFirstName()}</h6>
          </div> */}
            <div className='header-toolbar'>
              <div className="user-dropdown">
                <HeaderGlobalAction
                  aria-label="User">
                  <UserAvatar20 />
                </HeaderGlobalAction>
                <div className="user-dropdown-content">
                  {/* {console.log("keycloak.authenticated", keycloak.authenticated)} */}
                  {/* {!keycloak.authenticated && ( */}
                  {!KeycloakService.isLoggedIn() && (
                    // eslint-disable-next-line
                    <a
                      href="#"
                      className="nav-link"
                      //onClick={() => keycloak.login()}>
                      onClick={() => KeycloakService.doLogin()}>
                      Login
                    </a>
                  )}

                  {/* {keycloak.authenticated && ( */}
                  {KeycloakService.isLoggedIn() && (
                    // eslint-disable-next-line
                    <a
                      href="#"
                      className="nav-link"
                      //onClick={() => keycloak.logout()}>
                      // onClick={() => KeycloakService.doLogout()}>
                      // Logout ({keycloak.tokenParsed.preferred_username})
                      onClick={() => KeycloakService.doLogout()}>
                      Logout [{KeycloakService.getFirstName()}]
                    </a>
                  )}
                </div>
              </div>
              <HeaderGlobalAction 
                aria-label="Notifications" 
                onClick={() => {alert("This is a place holder, functionality to be implemented on future work!")}}>
                <Notification20 />
              </HeaderGlobalAction>
              <HeaderGlobalAction 
                aria-label="Search" 
                onClick={() => {alert("This is a place holder, functionality to be implemented on future work!")}}>
                <Search20 />
              </HeaderGlobalAction>
              
            </div>
            {IsManager && managerNavs}
          </div>
        </div>
        <div className="logo">
          <span>
            <a href="/">
              <img src={tornjak_logo} height="50" width="160" alt="Tornjak" /></a>
          </span>
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
})

export default connect(
  mapStateToProps,
  { clickedDashboardTableFunc, isAuthenticatedUpdateFunc, accessTokenUpdateFunc, UserRolesUpdateFunc }
)(NavigationBar)

export { NavigationBar }