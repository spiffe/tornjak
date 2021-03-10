import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import IsManager from './is_manager';
import 'carbon-components/css/carbon-components.min.css';
import { Dropdown } from 'carbon-components-react';
import './style.css';
  

export default class Navbar extends Component {

  render() {
    let managerNavs;
    managerNavs =
          <li className="navbar-item">
          <Link to="/server/manage" className="nav-link">Manage Servers</Link>
          </li>

    return (
      <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
        <a href="/" className="navbar-brand">Tornjak</a>
        <div className="collpase navbar-collapse">
          <div class="dropdown">
          <a href="/agents" class="dropbtn">Agents</a>
            <div class="dropdown-content">
              <a href="/agents" className="nav-link">Agents List</a>
              <a href="/agent/createjointoken" className="nav-link">Create Token</a>
            </div>
          </div>
          <div class="dropdown">
            <a href="/entries" class="dropbtn">Entries</a>
            <div class="dropdown-content">
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
    );
  }
}
