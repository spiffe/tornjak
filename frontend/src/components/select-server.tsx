import { Component } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import GetApiServerUri from './helpers';
import IsManager from './is_manager';
import TornjakApi from './tornjak-api-helpers';
import './style.css';
import { Dropdown } from 'carbon-components-react';

import {
    serverSelectedFunc,
    serversListUpdateFunc,
    tornjakServerInfoUpdateFunc,
    serverInfoUpdateFunc,
    agentsListUpdateFunc,
    tornjakMessageFunc
} from 'redux/actions';

import { RootState } from 'redux/reducers';
import { 
    AgentsList, 
    ServersList,
    ServerInfo, 
    TornjakServerInfo,
    DebugServerInfo,
} from './types';
import { showResponseToast } from './error-api';

type SelectServerProp = {
    // tornjak server debug info of the selected server
    globalDebugServerInfo: DebugServerInfo,
    // dispatches a payload for the list of available servers and their basic info as array of strings and has a return type of void
    serversListUpdateFunc: (globalServersList: ServersList[]) => void,
    // dispatches a payload for the server selected in the redux state as a string and has a return type of void
    serverSelectedFunc: (globalServerSelected: string) => void,
    // dispatches a payload for the server trust domain and nodeAttestorPlugin and has a return type of void
    serverInfoUpdateFunc: (globalServerInfo: ServerInfo) => void,
    // dispatches a payload for the tornjak server info of the selected server and has a return type of void
    tornjakServerInfoUpdateFunc: (globalTornjakServerInfo: TornjakServerInfo) => void,
    // dispatches a payload for list of agents with their metadata info as an array of AgentListType and has a return type of void
    agentsListUpdateFunc: (globalAgentsList: AgentsList[]) => void,
    // dispatches a payload for an Error Message/ Success Message of an executed function as a string and has a return type of void
    tornjakMessageFunc: (globalErrorMessage: string) => void,
    // the selected server for manager mode 
    globalServerSelected: string,
    // tornjak server info of the selected server
    globalTornjakServerInfo: TornjakServerInfo,
    // list of avialable servers
    globalServersList: ServersList[],
    // error/ success messege returned for a specific function
    globalErrorMessage: string,
}

type SelectServerState = {}

const ServerDropdown = (props: { name: string }) => (
    <option value={props.name}>{props.name}</option>
)

class SelectServer extends Component<SelectServerProp, SelectServerState> {
    TornjakApi: TornjakApi;
    constructor(props: SelectServerProp) {
        super(props);
        this.TornjakApi = new TornjakApi(props);
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
            if ((this.props.globalDebugServerInfo && Object.keys(this.props.globalDebugServerInfo).length) && (this.props.globalErrorMessage === "OK" || this.props.globalErrorMessage === "")) {
                this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
                this.TornjakApi.populateAgentsUpdate(this.props.globalServerSelected, this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc)
            }
        }
    }

    componentDidUpdate(prevProps: SelectServerProp) {
        if (IsManager) {
            if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
                this.TornjakApi.populateTornjakServerInfo(this.props.globalServerSelected, this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
                this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
                this.TornjakApi.populateAgentsUpdate(this.props.globalServerSelected, this.props.agentsListUpdateFunc, this.props.tornjakMessageFunc);
            }
        }
    }

    populateServers() {
        //axios.get(GetApiServerUri("/manager-api/server/list"), { crossdomain: true })
        axios.get(GetApiServerUri("/manager-api/server/list"))
            .then(response => {
                this.props.serversListUpdateFunc(response.data["servers"]);
            })
            .catch((error) => showResponseToast(error, {caption: "Could not populate servers."}))
    }

    serverDropdownList() {
        if (typeof this.props.globalServersList !== 'undefined') {
            // TODO(mamy-CS): any for now - will be specifically typed when working on manager component
            return this.props.globalServersList.map((server: any) => { // remove any when working on manager component
                return <ServerDropdown key={server.name}
                    name={server.name} />
            })
        } else {
            return ""
        }
    }

    onServerSelect = ({ selectedItem }: { selectedItem: string }) => {
        if (selectedItem) {
          this.props.serverSelectedFunc(selectedItem);
        }
    };

    getServer(serverName: string) {
        var i;
        // TODO(mamy-CS): any for now - will be specifically typed when working on manager component
        const servers: any = this.props.globalServersList // remove any when working on manager component
        for (i = 0; i < servers.length; i++) {
            if (servers[i].name === serverName) {
                return servers[i]
            }
        }
        return null
    }

    render() {
        const items = this.props.globalServersList
          ? this.props.globalServersList.map((server) => server.name)
          : [];
    
        let managerServerSelector = (
          <div className="server-select-dropdown">
            <Dropdown
              id="server-dropdown"
              titleText="Choose a Server"
              label="Select an Option"
              items={items}
              selectedItem={this.props.globalServerSelected}
              onChange={this.onServerSelect}
	          style={{ width: '230px' }}
            />
          </div>
        );
        return <div>{IsManager && managerServerSelector}</div>;
    }
}

const mapStateToProps = (state: RootState) => ({
    globalServerSelected: state.servers.globalServerSelected,
    globalServersList: state.servers.globalServersList,
    globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
    globalErrorMessage: state.tornjak.globalErrorMessage,
    globalDebugServerInfo: state.servers.globalDebugServerInfo,
})

export default connect(
    mapStateToProps,
    { serverSelectedFunc, serversListUpdateFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc, agentsListUpdateFunc, tornjakMessageFunc }
)(SelectServer)