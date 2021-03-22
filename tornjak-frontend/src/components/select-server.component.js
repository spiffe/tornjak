import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router-dom';
import axios from 'axios';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import {
    serverSelected
} from '../actions';

const ServerDropdown = props => (
    <option value={props.value}>{props.name}</option>
)

class SelectServer extends Component {
    constructor(props) {
        super(props);
        this.serverDropdownList = this.serverDropdownList.bind(this);
        this.onServerSelect = this.onServerSelect.bind(this);
        this.state = {
            servers: [],
            selectedServer: "",
        };
    }

    componentDidMount() {
        if (IsManager) {
            this.populateServers()
        }
    }

    populateServers() {
        axios.get(GetApiServerUri("/manager-api/server/list"), { crossdomain: true })
            .then(response => {
                this.setState({ servers: response.data["servers"] });
            })
            .catch((error) => {
                console.log(error);
            })
    }

    serverDropdownList() {
        if (typeof this.state.servers !== 'undefined') {
            return this.state.servers.map(server => {
                return <ServerDropdown key={server.name}
                    value={server.name}
                    name={server.name} />
            })
        } else {
            return ""
        }
    }

    onServerSelect(e) {
        const serverName = e.target.value;
        this.setState({ selectedServer: serverName })
        if (serverName !== "") {
            this.props.serverSelected(serverName);
        }
    }

    getServer(serverName) {
        var i;
        const servers = this.state.servers
        for (i = 0; i < servers.length; i++) {
            if (servers[i].name === serverName) {
                return servers[i]
            }
        }
        return null
    }

    render() {

        let managerServerSelector = (
            <div id="server-dropdown-div">
                <label id="server-dropdown">Choose a Server:</label>
                <select name="servers" id="servers" onChange={this.onServerSelect}>
                    <optgroup label="Servers">
                    <option value="none" selected disabled>Select an Option </option>
                    <option value="none" selected disabled>{this.props.globalServerSelected} </option>
                        {this.serverDropdownList()}
                    </optgroup>
                </select>
            </div>
        )

        return (
            <div>
                {IsManager && managerServerSelector}
            </div>
        )
    }
}

const mapStateToProps = (state) => ({
    globalServerSelected: state.filteredData.globalServerSelected,
})

export default connect(
    mapStateToProps,
    { serverSelected }
)(SelectServer)