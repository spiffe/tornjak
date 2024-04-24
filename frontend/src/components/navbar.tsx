import React, { useEffect } from 'react';
import jwt_decode from "jwt-decode";
// import axios from 'axios';
import { connect } from 'react-redux';
import IsManager from './is_manager';
import 'carbon-components/css/carbon-components.min.css';
import './style.css';
import tornjak_logo from "res/tornjak_logo.png";
import TornjakHelper from 'components/tornjak-helper';
import KeycloakService from "auth/KeycloakAuth";
import { RootState } from 'redux/reducers';
import {
  clickedDashboardTableFunc,
  isAuthenticatedUpdateFunc,
  accessTokenUpdateFunc,
  UserRolesUpdateFunc,
} from 'redux/actions';
import {
  AccessToken
} from './types';
import HeaderToolBar from './navbar-header-toolbar';
import { env } from '../env';
import { useAuth } from "oidc-react";

const keycloak = env.REACT_APP_AUTH_SERVER_URI;
const dex = env.REACT_APP_OIDC;
const withAuth = env.REACT_APP_AUTH_SERVER_URI || env.REACT_APP_OIDC;
type NavigationBarProp = {
  // dispatches a payload if user is authenticated or not return type of void
  isAuthenticatedUpdateFunc: (globalIsAuthenticated: boolean) => void;
  // whether user is authenticated or not
  globalIsAuthenticated: boolean;
  // dispatches a payload of the updated access token return type of void
  accessTokenUpdateFunc: (globalAccessToken: string | undefined) => void;
  // updated access token
  globalAccessToken: string | undefined;
  // dispatches a payload of the updated user roles return type of void
  UserRolesUpdateFunc: (globalUserRoles: string[]) => void;
  // updated user roles
  globalUserRoles: string[];
  // dispatches a payload for the clicked table in a dashboard as a string and has a return type of void
  clickedDashboardTableFunc: (globalClickedDashboardTable: string) => void;
  // the clicked dashboard table
  globalClickedDashboardTable: string;
};

const NavigationBar: React.FC<NavigationBarProp> = ({
  isAuthenticatedUpdateFunc,
  globalIsAuthenticated,
  accessTokenUpdateFunc,
  globalAccessToken,
  UserRolesUpdateFunc,
  globalUserRoles,
  clickedDashboardTableFunc,
  globalClickedDashboardTable,
}) => {
  const tornjakHelper = new TornjakHelper({});
  const auth = useAuth();
  const isAuthenticated = auth.userData?.id_token ? true : false;
  const roles = (auth.userData?.profile.groups) as string[];
  const accessToken = auth.userData?.access_token;

  useEffect(() => {
    const fetchData = async () => {
      if (keycloak) {
        isAuthenticatedUpdateFunc(KeycloakService.isLoggedIn());
        if (KeycloakService.isLoggedIn()) {
          accessTokenUpdateFunc(KeycloakService.getToken());
          const decodedToken: AccessToken = jwt_decode(KeycloakService.getToken()!);
          if (decodedToken.realm_access !== undefined && decodedToken.realm_access.roles !== undefined) {
            UserRolesUpdateFunc(decodedToken.realm_access.roles);
          }
        }
      }
      if (dex) {
        isAuthenticatedUpdateFunc(isAuthenticated);
        if (isAuthenticated) {
          UserRolesUpdateFunc(roles);
          accessTokenUpdateFunc(accessToken);
        }
      }
    };
    fetchData();
  }, [isAuthenticated, roles, accessToken, isAuthenticatedUpdateFunc, accessTokenUpdateFunc, UserRolesUpdateFunc]);

  let isAdmin = false;
  if(globalUserRoles !== undefined) {
    isAdmin = tornjakHelper.checkRolesAdminUser(globalUserRoles)
  };

  let managerNavs;
  managerNavs =
    <div className="dropdown">
      <a href="/server/manage" className="dropbtn">Manage Servers</a>
    </div>;

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
              if (globalClickedDashboardTable !== "dashboard") {
                clickedDashboardTableFunc("dashboard")
              }
            }}
          >Tornjak Dashboard</a>
        </div>
        <HeaderToolBar />
        {withAuth && isAdmin &&
          <div className="admin-toolbar-header">
            <h5>ADMIN PORTAL</h5>
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
  </div>
);
};

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
});

export default connect(
  mapStateToProps,
  { clickedDashboardTableFunc, isAuthenticatedUpdateFunc, accessTokenUpdateFunc, UserRolesUpdateFunc }
)(NavigationBar);

export { NavigationBar }