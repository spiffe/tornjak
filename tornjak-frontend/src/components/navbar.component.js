import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import IsManager from './is_manager';

export default class Navbar extends Component {

  render() {
    let managerNavs;
    managerNavs =
          <li className="navbar-item">
          <Link to="/entry/create" className="nav-link">Manage Servers</Link>
          </li>

    return (
      <nav className="navbar navbar-dark bg-dark navbar-expand-lg">
        <Link to="/" className="navbar-brand">Tornjak</Link>
        <div className="collpase navbar-collapse">
        <ul className="navbar-nav mr-auto">
          <li className="navbar-item">
          <Link to="/agents" className="nav-link">Agents</Link>
          </li>
          <li className="navbar-item">
          <Link to="/agent/createjointoken" className="nav-link">Join Token</Link>
          </li>

          <li className="navbar-item">
          <Link to="/entries" className="nav-link">Entries</Link>
          </li>
 
          <li className="navbar-item">
          <Link to="/entry/create" className="nav-link">Create Entry</Link>
          </li>
          {IsManager && managerNavs}
        </ul>
        </div>
      </nav>
    );
  }
}
