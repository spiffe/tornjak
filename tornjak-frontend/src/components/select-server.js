import React, { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import TornjakApi from './tornjak-api-helpers';

import {
    serverSelectedFunc,
    serversListUpdateFunc,
    tornjakServerInfoUpdateFunc,
    serverInfoUpdateFunc,
    agentsListUpdateFunc,
    tornjakMessageFunc
} from 'redux/actions';

const ServerDropdown = props => (
    <option value={props.value}>{props.name}</option>
)

class SelectServer extends Component {
    constructor(props) {
        super(props);
        this.TornjakApi = new TornjakApi();
        this.serverDropdownList = this.serverDropdownList.bind(this);
        this.onServerSelect = this.onServerSelect.bind(this);

        this.state = {
        };
    }

    componentDidMount() {
        if (IsManager) {
            this.populateServers()
            if ((this.props.globalServerSelected !== "") && (this.props.globalErrorMessage === "OK" || this.props.globalErrorMessage === "")) {
                this.TornjakApi.populateTornjakServerInfo(this.props.globalServerSelected, this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
            }
            if ((this.props.globalTornjakServerInfo !== "") && (this.props.globalErrorMessage === "OK" || this.props.globalErrorMessage === "")) {
                this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
                this.TornjakApi.populateAgentsUpdate(this.props.globalServerSelected, this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc)
            }
        }
    }

    componentDidUpdate(prevProps) {
        if (IsManager) {
            if (prevProps.globalServerSelected !== this.props.globalServerSelected ) {
                this.TornjakApi.populateTornjakServerInfo(this.props.globalServerSelected, this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
                this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
                this.TornjakApi.populateAgentsUpdate(this.props.globalServerSelected, this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
            }
        }
    }

    populateServers() {
        axios.get(GetApiServerUri("/manager-api/server/list"), { crossdomain: true })
            .then(response => {
                this.props.serversListUpdateFunc(response.data["servers"]);
            })
            .catch((error) => {
                console.log(error);
            })
    }

    serverDropdownList() {
        if (typeof this.props.globalServersList !== 'undefined') {
            return this.props.globalServersList.map(server => {
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
        if (serverName !== "") {
            this.props.serverSelectedFunc(serverName);
        }
    }

    getServer(serverName) {
        var i;
        const servers = this.props.globalServersList
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
                <label id="server-dropdown">Choose a Server</label>
                <div className="servers-drp-dwn">
                    <select name="servers" id="servers" onChange={this.onServerSelect}>
                        <optgroup label="Servers">
                            <option value="none" selected disabled>Select an Option </option>
                            <option value="none" selected disabled>{this.props.globalServerSelected} </option>
                            {this.serverDropdownList()}
                        </optgroup>
                    </select>
                </div>
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
    globalServerSelected: state.servers.globalServerSelected,
    globalServersList: state.servers.globalServersList,
    globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
    globalErrorMessage: state.tornjak.globalErrorMessage,
})

export default connect(
    mapStateToProps,
    { serverSelectedFunc, serversListUpdateFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc, agentsListUpdateFunc, tornjakMessageFunc }
)(SelectServer)
