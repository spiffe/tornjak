import React from "react";
import { connect } from 'react-redux';
import IsManager from 'components/is_manager';
import GetApiServerUri from 'components/helpers';
import axios from 'axios';
import {
    clustersListUpdateFunc
} from 'redux/actions';
import Table from './list-table';

// ClusterListTable takes in 
// listTableData: clusters data to be rendered on table
// returns clusters data inside a carbon component table with specified functions
class ClustersListTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listData: props.data,
            listTableData: [{ "id": "0" }],
        };
        this.prepareTableData = this.prepareTableData.bind(this);
        this.deleteCluster = this.deleteCluster.bind(this);
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
        if (selectedRows.length !== 0) {
            for (let i = 0; i < selectedRows.length; i++) {
                cluster[i] = {}
                cluster[i]["name"] = selectedRows[i].cells[1].value;
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
            <div>
                <Table
                    listTableData={listTableData}
                    headerData={headerData}
                    deleteEntity={this.deleteCluster}
                />
            </div>
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
)(ClustersListTable)
