import React from "react";
import { connect } from 'react-redux';
import GetApiServerUri from 'components/helpers';
import IsManager from 'components/is_manager';
import axios from 'axios';
import {
    agentsListUpdateFunc
} from 'redux/actions';
import Table from './list-table';
import { AgentsList, AgentsWorkLoadAttestorInfo } from "components/types";
import { DenormalizedRow } from "carbon-components-react";
import { RootState } from "redux/reducers";

// AgentListTable takes in 
// listTableData: agents data to be rendered on table
// returns agents data inside a carbon component table with specified functions

type AgentsListTableProp = {
    // dispatches a payload for list of agents with their metadata info as an array of AgentListType and has a return type of void
    agentsListUpdateFunc: (globalAgentsList: AgentsList[]) => void,
    // list of available agents as array of AgentsListType
    globalAgentsList: AgentsList[],
    // 
    globalAgentsWorkLoadAttestorInfo: AgentsWorkLoadAttestorInfo[],
    // the selected server for manager mode 
    globalServerSelected: string,
    //
    data: {
        key: string,
        props: { agent: AgentsList }
    }[] | string | JSX.Element[],
    id: string
}

type AgentsListTableState = {
    listData: { key: string, props: { agent: AgentsList } }[] | AgentsList[] | string | JSX.Element[],
    listTableData: { id: string, [x: string]: string; }[]
}
class AgentsListTable extends React.Component<AgentsListTableProp, AgentsListTableState> {
    constructor(props: AgentsListTableProp) {
        super(props);
        this.state = {
            listData: props.data,
            listTableData: [{ "id": "0" }],
        };
        this.prepareTableData = this.prepareTableData.bind(this);
        this.deleteAgent = this.deleteAgent.bind(this);
        this.banAgent = this.banAgent.bind(this);
    }

    componentDidMount() {
        this.prepareTableData();
    }
    componentDidUpdate(prevProps: AgentsListTableProp) {
        if (prevProps !== this.props) {
            this.setState({
                listData: this.props.globalAgentsList
            })
            this.prepareTableData();
        }
    }

    prepareTableData() {
        const { data } = this.props;
        let listData: { props: { agent: AgentsList; }; }[] | ({ key: string; props: { agent: AgentsList; }; } | JSX.Element)[] = [];
        if (typeof (data) === "string" || data === undefined)
            return
        data.forEach(val => listData.push(Object.assign({}, val)));
        let listtabledata: { id: string, [x: string]: string; }[] = [];
        for (let i = 0; i < listData.length; i++) {
            listtabledata[i] = { "id": "" };
            listtabledata[i]["id"] = (i + 1).toString();
            listtabledata[i]["trustdomain"] = listData[i].props.agent.id.trust_domain;
            listtabledata[i]["spiffeid"] = "spiffe://" + listData[i].props.agent.id.trust_domain + listData[i].props.agent.id.path;
            listtabledata[i]["info"] = JSON.stringify(listData[i].props.agent, null, ' ');
            if (this.props.globalAgentsWorkLoadAttestorInfo !== undefined) {
                var check_id = this.props.globalAgentsWorkLoadAttestorInfo.filter(agent => (agent.spiffeid) === listtabledata[i].spiffeid);
                if (check_id.length !== 0) {
                    listtabledata[i]["plugin"] = check_id[0].plugin;
                }
                else {
                    listtabledata[i]["plugin"] = "No Plugin Configured For Agent";
                }
            } else {
                listtabledata[i]["plugin"] = "No Plugin Configured For Agent";
            }
        }
        this.setState({
            listTableData: listtabledata
        })
    }

    deleteAgent(selectedRows: readonly DenormalizedRow[]) {
        var id: { path: string; trust_domain: string; }[] = [], endpoint = "", prefix = "spiffe://";
        let promises = [];
        if (IsManager) {
            endpoint = GetApiServerUri('/manager-api/agent/delete') + "/" + this.props.globalServerSelected;
        } else {
            endpoint = GetApiServerUri('/api/agent/delete');
        }
        if (selectedRows !== undefined && selectedRows.length !== 0) {
            for (let i = 0; i < selectedRows.length; i++) {
                id[i] = { "path": "", "trust_domain": "" }
                id[i]["trust_domain"] = selectedRows[i].cells[1].value;
                id[i]["path"] = selectedRows[i].cells[2].value.substr(selectedRows[i].cells[1].value.concat(prefix).length);
                promises.push(axios.post(endpoint, {
                    "id": {
                        "trust_domain": id[i].trust_domain,
                        "path": id[i].path,
                    }
                }))
            }
        } else {
            return ""
        }
        Promise.all(promises)
            .then(responses => {
                if (this.props.globalAgentsList === undefined) {
                    return
                }
                for (let i = 0; i < responses.length; i++) {
                    this.props.agentsListUpdateFunc(this.props.globalAgentsList.filter(el =>
                        el.id.trust_domain !== id[i].trust_domain ||
                        el.id.path !== id[i].path));
                }
            })
            .catch((error) => {
                console.log(error);
            })
    }

    banAgent(selectedRows: readonly DenormalizedRow[]) {
        var id: { path: string; trust_domain: string; }[] = [], i = 0, endpoint = "", prefix = "spiffe://";
        if (IsManager) {
            endpoint = GetApiServerUri('/manager-api/agent/ban') + "/" + this.props.globalServerSelected
        } else {
            endpoint = GetApiServerUri('/api/agent/ban')
        }
        if (selectedRows !== undefined && selectedRows.length !== 0) {
            for (i = 0; i < selectedRows.length; i++) {
                id[i] = { "path": "", "trust_domain": "" }
                id[i]["trust_domain"] = selectedRows[i].cells[1].value;
                id[i]["path"] = selectedRows[i].cells[2].value.substr(selectedRows[i].cells[1].value.concat(prefix).length);
                axios.post(endpoint, {
                    "id": {
                        "trust_domain": id[i].trust_domain,
                        "path": id[i].path,
                    }
                })
                    .then(res => {
                        console.log(res.data)
                        alert("Ban SUCCESS")
                        this.componentDidMount()
                    })
                    .catch((error) => {
                        console.log(error);
                    })
            }
        } else {
            return ""
        }
    }
    render() {
        const { listTableData } = this.state;
        const headerData = [
            {
                header: '#No',
                key: 'id',
            },
            {
                header: 'Trust Domain',
                key: 'trustdomain',
            },
            {
                header: 'SPIFFE ID',
                key: 'spiffeid',
            },
            {
                header: 'Info',
                key: 'info',
            },
            {
                header: 'Workload Attestor Plugin',
                key: 'plugin',
            }
        ];
        return (
            <div>
                <Table
                    entityType={"Agent"}
                    listTableData={listTableData}
                    headerData={headerData}
                    deleteEntity={this.deleteAgent}
                    banEntity={this.banAgent}
                    downloadEntity={undefined}
                />
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    globalServerSelected: state.servers.globalServerSelected,
    globalAgentsList: state.agents.globalAgentsList,
    globalAgentsWorkLoadAttestorInfo: state.agents.globalAgentsWorkLoadAttestorInfo,
})

export default connect(
    mapStateToProps,
    { agentsListUpdateFunc }
)(AgentsListTable)