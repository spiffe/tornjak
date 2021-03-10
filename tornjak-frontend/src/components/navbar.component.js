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
        <Link to="/" className="navbar-brand">Tornjak</Link>
        <div className="collpase navbar-collapse">
          <div class="dropdown">
          <Link to="/agents" class="dropbtn">Agents</Link>
            <div class="dropdown-content">
              <Link to="/agents" className="nav-link">Agents List</Link>
              <Link to="/agent/createjointoken" className="nav-link">Create Token</Link>
            </div>
          </div>
          <div class="dropdown">
            <Link to="/entries" class="dropbtn">Entries</Link>
            <div class="dropdown-content">
              <Link to="/entries" className="nav-link">Entries List</Link>
              <Link to="/entry/create" className="nav-link">Create Entries</Link>
            </div>
          </div>
            <ul className="navbar-nav mr-auto">
              <li className="navbar-item">
                <Link to="/tornjak/serverinfo" className="nav-link">Tornjak ServerInfo</Link>
              </li>
              {IsManager && managerNavs}
          </ul>
        </div>
      </nav>
    );
  }
}
