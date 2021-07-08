import React from "react";
import { DataTable } from "carbon-components-react";
import { connect } from 'react-redux';
import {
    Delete16 as Delete,
} from '@carbon/icons-react';
import IsManager from 'components/is_manager';
import GetApiServerUri from 'components/helpers';
import axios from 'axios';
import {
    clustersListUpdateFunc
} from 'redux/actions';
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
            listTableData: [{"id":"0"}],
        };
        this.prepareTableData = this.prepareTableData.bind(this);
    }

    componentDidMount() {
        this.prepareTableData();
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps !== this.props) {
            this.setState({
                listData: this.props.globalClustersList
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
            listtabledata[i]["id"] = (i + 1).toString();
            listtabledata[i]["clusterName"] = listData[i].props.cluster.name;
            listtabledata[i]["clusterType"] = listData[i].props.cluster.platformType;
            listtabledata[i]["clusterManagedBy"] = listData[i].props.cluster.managedBy;
            listtabledata[i]["clusterDomainName"] = listData[i].props.cluster.domainName;
            listtabledata[i]["clusterAssignedAgents"] = <pre>{JSON.stringify(listData[i].props.cluster.agentsList, null, ' ')}</pre>
        }
        this.setState({
            listTableData: listtabledata
        })
    }

    deleteCluster(selectedRows) {
        var cluster = [], endpoint = "";
        let promises = [];
        if (IsManager) {
            endpoint = GetApiServerUri('/manager-api/tornjak/clusters/delete') + "/" + this.props.globalServerSelected;
        } else {
            endpoint = GetApiServerUri('/api/tornjak/clusters/delete');
        }
        console.log("selectedRows", selectedRows)
        if (selectedRows.length !== 0) {
            for (let i = 0; i < selectedRows.length; i++) {
                cluster[i] = {}
                cluster[i]["name"] = selectedRows[i].cells[1].value;
                console.log("cluster", cluster)
                promises.push(axios.post(endpoint, {
                    "cluster": {
                        "name": cluster[i].name
                    }
                }))
            }
        } else {
            return ""
        }
        Promise.all(promises)
            .then(responses => {
                for (let i = 0; i < responses.length; i++) {
                    this.props.clustersListUpdateFunc(this.props.globalClustersList.filter(el =>
                        el.name !== cluster[i].name));
                }
            })
            .catch((error) => {
                console.log(error);
            })
    }

    render() {
        const { listTableData } = this.state;
        const headerData = [
            {
                header: '#No',
                key: 'id',
            },
            {
                header: 'Cluster Name',
                key: 'clusterName',
            },
            {
                header: 'Cluster Type',
                key: 'clusterType',
            },
            {
                header: 'Cluster Managed By',
                key: 'clusterManagedBy',
            },
            {
                header: 'Cluster Domain Name',
                key: 'clusterDomainName',
            },
            {
                header: 'Assigned Agents',
                key: 'clusterAssignedAgents',
            },
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
                                        this.deleteCluster(selectedRows);
                                        getBatchActionProps().onCancel();
                                    }}
                                >
                                    Delete
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
                                {rows.map((row, key) => (
                                    <TableRow key={key}>
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
    globalClustersList: state.clusters.globalClustersList,
})

export default connect(
    mapStateToProps,
    { clustersListUpdateFunc }
)(DataTableRender)
