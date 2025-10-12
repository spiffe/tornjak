import React from "react";
import { connect } from 'react-redux';
import IsManager from 'components/is_manager';
import {
    serversListUpdateFunc
} from 'redux/actions';
import Table from './list-table';
import { ServersList } from "components/types";
import { DenormalizedRow } from "carbon-components-react";
import { RootState } from "redux/reducers";
import TornjakApi from 'components/tornjak-api-helpers';



// ServersListTable takes in 
// listTableData: servers data to be rendered on table
// returns servers data inside a carbon component table with specified functions

type ServersListTableProp = {
    // dispatches a payload for list of servers with their metadata info as an array of ServersList Type and has a return type of void
    serversListUpdateFunc: (globalServersList: ServersList[]) => void,
    // data provided to the servers table
    data: {
        key: string,
        props: { server: ServersList }
    }[] | string | JSX.Element[],
    id: string,
    // list of servers with their metadata info as an array of ServersList Type
    globalServersList: ServersList[],
    // the selected server for manager mode 
    globalServerSelected: string,
}

type ServersListTableState = {
    listData: { key: string, props: { server: ServersList } }[] | ServersList[] | string | JSX.Element[],
    listTableData: {
        id: string;
        serverName: string;
        serverAddress: string;
        tls: string;
        mtls: string;
    }[]

}
class ServersListTable extends React.Component<ServersListTableProp, ServersListTableState> {
    TornjakApi: TornjakApi;
    constructor(props: ServersListTableProp) {
        super(props);
        this.TornjakApi = new TornjakApi(props);
        this.state = {
            listData: props.data,
            listTableData: [],
        };
        this.prepareTableData = this.prepareTableData.bind(this);
        this.deleteServer = this.deleteServer.bind(this);
    }

    componentDidMount() {
        this.prepareTableData();
    }
    componentDidUpdate(prevProps: ServersListTableProp) {
        if (prevProps !== this.props) {
            this.setState({
                listData: this.props.globalServersList
            })
            this.prepareTableData();
        }
    }

    prepareTableData() {
        const { data } = this.props;
        let listData: { props: { server: ServersList; }; }[] | ({ key: string; props: { server: ServersList; }; } | JSX.Element)[] = [];
        if (typeof (data) === "string" || data === undefined)
            return
        data.forEach(val => listData.push(Object.assign({}, val)));
        let listtabledata: { id: string; serverName: string; serverAddress: string; tls: string; mtls: string;}[] = [];
        for (let i = 0; i < listData.length; i++) {
            listtabledata[i] = { id: "", serverName: "", serverAddress: "", tls: "", mtls: ""};
            listtabledata[i]["id"] = (i + 1).toString();
            listtabledata[i]["serverName"] = listData[i].props.server.name;
            listtabledata[i]["serverAddress"] = listData[i].props.server.address;
            listtabledata[i]["tls"] = listData[i].props.server.tls ? listData[i].props.server.tls : "None";
            listtabledata[i]["mtls"] = listData[i].props.server.mtls ? listData[i].props.server.mtls : "None";
        }
        this.setState({
            listTableData: listtabledata
        })
    }

    deleteServer(selectedRows: readonly DenormalizedRow[]) {
        if (!selectedRows || selectedRows.length === 0) return "";
        if (!IsManager) return "";
        let server: { name: string }[] = [], successMessage

        for (let i = 0; i < selectedRows.length; i++) {
            server[i] = { name: selectedRows[i].cells[1].value };
            successMessage = this.TornjakApi.serverDelete({ server: server[i] }, this.props.serversListUpdateFunc, this.props.globalServersList);
            successMessage.then(function (result) {
                if (result === "SUCCESS") {
                    window.alert(`SERVER "${server[i].name}" DELETED SUCCESSFULLY!`);
                    window.location.reload();
                } else {
                    window.alert(`Error deleting server "${server[i].name}": ` + result);
                }
                return;
            })
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
                header: 'Server Name',
                key: 'serverName',
            },
            {
                header: 'Server Address',
                key: 'serverAddress',
            },
            {
                header: 'TLS',
                key: 'tls',
            },
            {
                header: 'mTLS',
                key: 'mtls',
            }
        ];
        return (
            <div>
                <Table
                    entityType={"Server"}
                    listTableData={listTableData}
                    headerData={headerData}
                    deleteEntity={this.deleteServer}
                    banEntity={undefined}
                    downloadEntity={undefined} />
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    globalServerSelected: state.servers.globalServerSelected,
    globalServersList: state.servers.globalServersList,
})

export default connect(
    mapStateToProps,
    { serversListUpdateFunc }
)(ServersListTable)