//import React, { Component } from 'react';
import { connect } from 'react-redux';
import IsManager from './is_manager';
import 'carbon-components/css/carbon-components.min.css';
import './style.css';
import tornjak_logo from "res/tornjak_logo.png";
import {
  clickedDashboardTableFunc,
} from 'redux/actions';
import { useKeycloak } from "@react-keycloak/web";
import {
  HeaderGlobalAction,
} from "carbon-components-react/lib/components/UIShell";
import { UserAvatar20, Notification20, Search20 } from "@carbon/icons-react";

const NavigationBar = () => {
  const { keycloak } = useKeycloak();
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
              <a href="/cluster/clustermanagement" className="nav-link">Cluster Management</a>
            </div>
          </div>
          <div className="dropdown">
            <a href="/agents" className="dropbtn">Agents </a>
            <div className="dropdown-content">
              <a href="/agents" className="nav-link">Agents List</a>
              <a href="/agent/createjointoken" className="nav-link">Create Token</a>
            </div>
          </div>
          <div className="dropdown">
            <a href="/entries" className="dropbtn">Entries</a>
            <div className="dropdown-content">
              <a href="/entries" className="nav-link">Entries List</a>
              <a href="/entry/create" className="nav-link">Create Entries</a>
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
          <div className='header-toolbar'>
            <div className="user-dropdown">
              <HeaderGlobalAction
                aria-label="User">
                <UserAvatar20 />
              </HeaderGlobalAction>
              <div className="user-dropdown-content">
                {console.log("keycloak.authenticated", keycloak.authenticated)}
                {!keycloak.authenticated && (
                  // eslint-disable-next-line
                  <a
                    href="#"
                    className="nav-link"
                    onClick={() => keycloak.login()}>
                    Login
                  </a>
                )}

                {keycloak.authenticated && (
                  // eslint-disable-next-line
                  <a
                    href="#"
                    className="nav-link"
                    onClick={() => keycloak.logout()}>
                    Logout ({keycloak.tokenParsed.preferred_username})
                  </a>
                )}
              </div>
            </div>
            <HeaderGlobalAction aria-label="Search" onClick={() => { }}>
              <Search20 />
            </HeaderGlobalAction>
            <HeaderGlobalAction aria-label="Notifications" onClick={() => { }}>
              <Notification20 />
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
};

// Note: Needed for UI testing - will be removed after
// NavigationBar.propTypes = {
//   globalClickedDashboardTable: PropTypes.string,
//   clickedDashboardTableFunc: PropTypes.func,
// };

const mapStateToProps = (state) => ({
  globalClickedDashboardTable: state.tornjak.globalClickedDashboardTable,
})

export default connect(
  mapStateToProps,
  { clickedDashboardTableFunc }
)(NavigationBar)

export { NavigationBar }