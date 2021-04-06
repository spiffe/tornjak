import React from "react";
import { DataTable } from "carbon-components-react";
import { connect } from 'react-redux';
import ResetIcon from "@carbon/icons-react/es/reset--alt/20";
import GetApiServerUri from 'components/helpers';
import IsManager from 'components/is_manager';
import axios from 'axios'
import {
    agentsListUpdate
} from 'actions';
const {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    TableHeader,
    TableSelectRow,
    TableSelectAll,
    TableToolbar,
    TableToolbarSearch,
    TableToolbarContent,
    TableBatchActions,
    TableBatchAction,
} = DataTable;

class DataTableRender extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listData: props.data,
            listTableData: [{}]
        };
        this.prepareTableData = this.prepareTableData.bind(this);
    }

    componentDidMount() {
        //this.prepareTableData();
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps !== this.props) {
            this.setState({
                listData: this.props.globalagentsList
            })
            this.prepareTableData();
        }
    }

    prepareTableData() {
        const { data } = this.props;
        let listData = [...data];
        let listtabledata = [];
        let i = 0;
        for (i = 0; i < listData.length; i++) {
            listtabledata[i] = {};
            listtabledata[i]["id"] = i + 1;
            listtabledata[i]["trustdomain"] = listData[i].props.agent.id.trust_domain;
            listtabledata[i]["spiffeid"] = "spiffe://" + listData[i].props.agent.id.trust_domain + listData[i].props.agent.id.path;
            listtabledata[i]["info"] = <div style={{ overflowX: 'auto', width: "400px" }}><pre>{JSON.stringify(listData[i].props.agent, null, ' ')}</pre></div>;
            // listtabledata[i]["actions"] = <div><a href="#" onClick={() => { listData[i].props.banAgent(listData[i].props.agent.id) }}>Ban</a> <br /> <a href="#" onClick={() => { listData[i].props.deleteAgent(listData[i].props.agent.id) }}>Delete</a></div>;
        }
        this.setState({
            listTableData: listtabledata
        })
    }

    deleteAgent(selectedRows) {
        var id = [], i = 0, endpoint = "", prefix = "spiffe://";
        let promises = [];
        if (IsManager) {
            endpoint = GetApiServerUri('/manager-api/agent/delete') + "/" + this.props.globalServerSelected;
        } else {
            endpoint = GetApiServerUri('/api/agent/delete');
        }
        if (selectedRows.length !== 0) {
            for (i = 0; i < selectedRows.length; i++) {
                id[i] = {}
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
                for (i = 0; i < responses.length; i++) {
                    console.log("Status: ", responses[i].data)
                    this.props.agentsListUpdate(this.props.globalagentsList.filter(el =>
                        el.id.trust_domain !== id[i].trust_domain ||
                        el.id.path !== id[i].path));
                }
            })
            .catch((error) => {
                console.log(error);
            })
    }

    banAgent(selectedRows) {
        var id = [], i = 0, endpoint = "";
        if (IsManager) {
            endpoint = GetApiServerUri('/manager-api/agent/ban') + "/" + this.props.globalServerSelected
        } else {
            endpoint = GetApiServerUri('/api/agent/ban')
        }
        if (selectedRows.length !== 0) {
            for (i = 0; i < selectedRows.length; i++) {
                id[i] = {}
                id[i]["trust_domain"] = selectedRows[i].cells[1].value;
                id[i]["path"] = selectedRows[i].cells[2].value.substr(selectedRows[i].cells[1].value.concat(prefix).length);
                axios.post(endpoint, {
                    "id": {
                        "trust_domain": id[i].trust_domain,
                        "path": id[i].path,
                    }
                })
                    .then(res => console.log(res.data), alert("Ban SUCCESS"), this.componentDidMount())
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
                header: 'ID',
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
            // {
            //     header: 'Actions',
            //     key: 'actions',
            // },
        ];
        return (
            <DataTable
                isSortable
                rows={listTableData}
                headers={headerData}
                render={({
                    rows,
                    headers,
                    getHeaderProps,
                    getSelectionProps,
                    onInputChange,
                    getPaginationProps,
                    getBatchActionProps,
                    getTableContainerProps,
                    selectedRows,
                }) => (
                    <TableContainer
                        {...getTableContainerProps()}
                    >
                        <TableToolbar>
                            <TableToolbarContent>
                                <TableToolbarSearch onChange={(e) => onInputChange(e)} />
                            </TableToolbarContent>
                            <TableBatchActions
                                {...getBatchActionProps()}
                            >
                                <TableBatchAction
                                    renderIcon={ResetIcon}
                                    iconDescription="Delete"
                                    onClick={() => {
                                        this.deleteAgent(selectedRows);
                                    }}
                                >
                                    Delete
                                </TableBatchAction>
                                <TableBatchAction
                                    renderIcon={ResetIcon}
                                    iconDescription="Ban"
                                    onClick={() => {
                                        this.banAgent(selectedRows);
                                    }}
                                >
                                    Ban
                                </TableBatchAction>
                            </TableBatchActions>
                        </TableToolbar>
                        <Table size="short" useZebraStyles>
                            <TableHead>
                                <TableRow>
                                    <TableSelectAll {...getSelectionProps()} />
                                    {headers.map((header) => (
                                        <TableHeader {...getHeaderProps({ header })}>
                                            {header.header}
                                        </TableHeader>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableSelectRow {...getSelectionProps({ row })} />
                                        {row.cells.map((cell) => (
                                            <TableCell key={cell.id}>{cell.value}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            />
        );
    }
}

const mapStateToProps = (state) => ({
    globalServerSelected: state.server.globalServerSelected,
    globalagentsList: state.agents.globalagentsList
})

export default connect(
    mapStateToProps,
    { agentsListUpdate }
)(DataTableRender)
