import React from "react";
import { connect } from 'react-redux';
import GetApiServerUri from 'components/helpers';
import IsManager from 'components/is_manager';
import axios from 'axios'
import {
    entriesListUpdateFunc
} from 'redux/actions';
import Table from './list-table';

// EntriesListTable takes in 
// listTableData: entries data to be rendered on table
// returns entries data inside a carbon component table with specified functions
class EntriesListTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listData: props.data,
            listTableData: [{ "id": "0" }],
        };
        this.prepareTableData = this.prepareTableData.bind(this);
        this.deleteEntry = this.deleteEntry.bind(this);
    }

    componentDidMount() {
        this.prepareTableData();
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps !== this.props) {
            this.setState({
                listData: this.props.globalEntriesList
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
            listtabledata[i]["idx"] = (i + 1).toString();
            listtabledata[i]["id"] = listData[i].props.entry.id;
            listtabledata[i]["spiffeid"] = "spiffe://" + listData[i].props.entry.spiffe_id.trust_domain + listData[i].props.entry.spiffe_id.path;
            listtabledata[i]["parentid"] = "spiffe://" + listData[i].props.entry.parent_id.trust_domain + listData[i].props.entry.parent_id.path;
            listtabledata[i]["selectors"] = listData[i].props.entry.selectors.map(s => s.type + ":" + s.value).join(', ');
            listtabledata[i]["info"] = JSON.stringify(listData[i].props.entry, null, ' ');
        }
        this.setState({
            listTableData: listtabledata
        })
    }

    deleteEntry(selectedRows) {
        var id = [], endpoint = "";
        let promises = [];
        if (IsManager) {
            endpoint = GetApiServerUri('/manager-api/entry/delete') + "/" + this.props.globalServerSelected
        } else {
            endpoint = GetApiServerUri('/api/entry/delete')
        }
        if (selectedRows.length !== 0) {
            for (let i = 0; i < selectedRows.length; i++) {
                id[i] = selectedRows[i].id;
                promises.push(axios.post(endpoint, {
                    "ids": [id[i]]
                }))
            }
        } else {
            return ""
        }
        Promise.all(promises)
            .then(responses => {
                for (let i = 0; i < responses.length; i++) {
                    console.log("Status: ", responses[i].statusText)
                    this.props.entriesListUpdateFunc(this.props.globalEntriesList.filter(el => el.id !== responses[i].data.results[0].id))
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
                key: 'idx',
            },
            {
                header: 'Id',
                key: 'id',
            },
            {
                header: 'SPIFFE ID',
                key: 'spiffeid',
            },
            {
                header: 'Parent ID',
                key: 'parentid',
            },
            {
                header: 'Selectors',
                key: 'selectors',
            },
            {
                header: 'Info',
                key: 'info',
            },
        ];
        return (
            <div>
                <Table
                    listTableData={listTableData}
                    headerData={headerData}
                    deleteEntity={this.deleteEntry}
                />
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    globalServerSelected: state.servers.globalServerSelected,
    globalEntriesList: state.entries.globalEntriesList
})

export default connect(
    mapStateToProps,
    { entriesListUpdateFunc }
)(EntriesListTable)
