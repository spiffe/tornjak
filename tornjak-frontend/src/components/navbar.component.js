import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import IsManager from './is_manager';
import 'carbon-components/css/carbon-components.min.css';
import { Dropdown } from 'carbon-components-react';
import './style.css';


export default class NavigationBar extends Component {

  render() {
    let managerNavs;
    managerNavs =
      <li className="navbar-item">
        <a href="/server/manage" className="nav-link">Manage Servers</a>
      </li>

    return (
      <div className="navigation-bar">
        <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
          <a href="/" className="navbar-brand">Tornjak</a>
          <div className="collpase navbar-collapse">
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
            <ul className="navbar-nav mr-auto">
              <li className="navbar-item">
                <a href="/tornjak/serverinfo" className="nav-link">Tornjak ServerInfo</a>
              </li>
              {IsManager && managerNavs}
            </ul>
          </div>
        </nav>
      </div>
    );
  }
}
