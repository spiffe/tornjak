import React, { Component } from 'react';
import IsManager from './is_manager';
import 'carbon-components/css/carbon-components.min.css';
import './style.css';
import tornjak_logo from "res/tornjak_logo.png";

export default class NavigationBar extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  render() {
    let managerNavs;
    managerNavs =
      <div className="dropdown">
        <a href="/server/manage" className="dropbtn">Manage Servers</a>
      </div>

    return (
      <div>
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
              <a href="/tornjak/dashboard" className="dropbtn">Tornjak Dashboard</a>
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
