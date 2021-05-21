import React from "react";
import { DataTable, OverflowMenu} from "carbon-components-react";
import { connect } from 'react-redux';
import {
    Delete16 as Delete,
} from '@carbon/icons-react';
import ResetIcon from "@carbon/icons-react/es/reset--alt/20";
import GetApiServerUri from 'components/helpers';
import IsManager from 'components/is_manager';
import WorkLoadAttestor from './workLoadAttestorModal';
import axios from 'axios'
import {
    agentsListUpdateFunc
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
        this.prepareTableData();
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps !== this.props) {
            this.setState({
                listData: this.props.globalAgentsList
            })
            this.prepareTableData();
        }
    }

    prepareTableData() {
        const { data } = this.props;
        let listData = [...data];
        let listtabledata = [];
        for (let i = 0; i < listData.length; i++) {
            listtabledata[i] = {};
            listtabledata[i]["id"] = i + 1;
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

    deleteAgent(selectedRows) {
        var id = [], endpoint = "", prefix = "spiffe://";
        let promises = [];
        if (IsManager) {
            endpoint = GetApiServerUri('/manager-api/agent/delete') + "/" + this.props.globalServerSelected;
        } else {
            endpoint = GetApiServerUri('/api/agent/delete');
        }
        if (selectedRows.length !== 0) {
            for (let i = 0; i < selectedRows.length; i++) {
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

    banAgent(selectedRows) {
        var id = [], i = 0, endpoint = "", prefix = "spiffe://";
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
            {
                header: 'Workload Attestor Plugin',
                key: 'plugin',
            }
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
                                    renderIcon={Delete}
                                    iconDescription="Delete"
                                    onClick={() => {
                                        this.deleteAgent(selectedRows);
                                        getBatchActionProps().onCancel();
                                    }}
                                >
                                    Delete
                                </TableBatchAction>
                                <TableBatchAction
                                    renderIcon={ResetIcon}
                                    iconDescription="Ban"
                                    onClick={() => {
                                        this.banAgent(selectedRows);
                                        getBatchActionProps().onCancel();
                                    }}
                                >
                                    Ban
                                </TableBatchAction>
                            </TableBatchActions>
                        </TableToolbar>
                        <Table size="short" useZebraStyles>
                            <TableHead>
                                <TableRow>
                                    <TableSelectAll
                                        {...getSelectionProps()} />
                                    {headers.map((header) => (
                                        <TableHeader key={header.header} {...getHeaderProps({ header })}>
                                            {header.header}
                                        </TableHeader>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableSelectRow
                                            {...getSelectionProps({ row })} />
                                        {row.cells.map((cell) => (
                                            <TableCell key={cell.id}>
                                                {cell.info.header === "info" ? (
                                                    <div style={{ overflowX: 'auto', width: "400px" }}>
                                                        <pre>{cell.value}</pre>
                                                    </div>
                                                ) : (
                                                    cell.value)}
                                            </TableCell>
                                        ))}
                                        <TableCell>
                                            <div>
                                                <OverflowMenu flipped>
                                                    <WorkLoadAttestor
                                                        spiffeid={row.cells[2].value}
                                                        agentData={row}
                                                    />
                                                </OverflowMenu>
                                            </div>
                                        </TableCell>
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
    globalServerSelected: state.servers.globalServerSelected,
    globalAgentsList: state.agents.globalAgentsList,
    globalAgentsWorkLoadAttestorInfo: state.agents.globalAgentsWorkLoadAttestorInfo,
})

export default connect(
    mapStateToProps,
    { agentsListUpdateFunc }
)(DataTableRender)
