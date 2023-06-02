import React from "react";
import { connect } from 'react-redux';
import GetApiServerUri from 'components/helpers';
import IsManager from 'components/is_manager';
import axios from 'axios'
import {
    entriesListUpdateFunc
} from 'redux/actions';
import Table from './list-table';
import { EntriesList } from "components/types";
import { RootState } from "redux/reducers";
import { DenormalizedRow } from "carbon-components-react";
import { saveAs } from "file-saver";
import { showResponseToast } from "components/error-api";

// EntriesListTable takes in 
// listTableData: entries data to be rendered on table
// returns entries data inside a carbon component table with specified functions

type EntriesListTableProp = {
    // dispatches a payload for list of entries with their metadata info as an array of EntriesListType and has a return type of void
    entriesListUpdateFunc: (globalEntriesList: EntriesList[]) => void,
    // data provided to the entries table
    data: {
        key: string,
        props: { entry: EntriesList }
    }[] | string | JSX.Element[],
    id: string,
    // list of available entries as array of EntriesListType
    globalEntriesList: EntriesList[],
    // the selected server for manager mode 
    globalServerSelected: string,
}

type EntriesListTableState = {
    listData: { key: string, props: { entry: EntriesList } }[] | EntriesList[] | string | JSX.Element[],
    listTableData: { id: string, [x: string]: string; }[]
}

class EntriesListTable extends React.Component<EntriesListTableProp, EntriesListTableState> {
    constructor(props: EntriesListTableProp) {
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
    componentDidUpdate(prevProps: EntriesListTableProp) {
        if (prevProps !== this.props) {
            this.setState({
                listData: this.props.globalEntriesList
            })
            this.prepareTableData();
        }
    }

    prepareTableData() {
        const { data } = this.props;
        let listData: { props: { entry: EntriesList; }; }[] | ({ key: string; props: { entry: EntriesList; }; } | JSX.Element)[] = [];
        if (typeof (data) === "string" || data === undefined)
            return
        data.forEach(val => listData.push(Object.assign({}, val)));
        let listtabledata: { idx: string; id: string; spiffeid: string; parentid: string; selectors: string; info: string }[] = [];
        let i = 0;
        for (i = 0; i < listData.length; i++) {
            listtabledata[i] = { "idx": "", "id": "", "spiffeid": "", "parentid": "", "selectors": "", "info": "" };
            listtabledata[i]["idx"] = (i + 1).toString();
            listtabledata[i]["id"] = listData[i].props.entry.id;
            listtabledata[i]["spiffeid"] = "spiffe://" + listData[i].props.entry.spiffe_id.trust_domain + listData[i].props.entry.spiffe_id.path;
            listtabledata[i]["parentid"] = "spiffe://" + listData[i].props.entry.parent_id.trust_domain + listData[i].props.entry.parent_id.path;
            listtabledata[i]["selectors"] = listData[i].props.entry.selectors.map((s: { type: string; value: string; }) => s.type + ":" + s.value).join(', ');
            listtabledata[i]["info"] = JSON.stringify(listData[i].props.entry, null, ' ');
        }
        this.setState({
            listTableData: listtabledata
        })
    }

    deleteEntry(selectedRows: readonly DenormalizedRow[]) {
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
                if (this.props.globalEntriesList === undefined) {
                    return
                }
                for (let i = 0; i < responses.length; i++) {
                    this.props.entriesListUpdateFunc(this.props.globalEntriesList.filter(el => el.id !== responses[i].data.results[0].id))
                }
            })
            .catch((error) => showResponseToast(error, {caption: "Could not delete entry."}))
    }

    downloadEntries(selectedRows: readonly DenormalizedRow[]) {
        var selectedEntriesInfo = [], infoCell = 5, jsonInit = "{\n  \"entries\": [\n";
        if (selectedRows.length !== 0) {
            selectedEntriesInfo[0] = jsonInit;
            for (let i = 0; i < selectedRows.length; i++) {
                if( i < selectedRows.length-1) {
                    selectedEntriesInfo[i+1] = selectedRows[i].cells[infoCell].value + ",\n" ;
                } else {
                    selectedEntriesInfo[i+1] = selectedRows[i].cells[infoCell].value + "\n]\n}" ;
                }
            }
        }
        var blob = new Blob(selectedEntriesInfo, {type: "application/json"});
        saveAs(
            blob,
            "selectedEntries.json"
        );
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
                    entityType={"Entry"}
                    listTableData={listTableData}
                    headerData={headerData}
                    deleteEntity={this.deleteEntry}
                    banEntity={undefined}
                    downloadEntity={this.downloadEntries} />
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    globalServerSelected: state.servers.globalServerSelected,
    globalEntriesList: state.entries.globalEntriesList
})

export default connect(
    mapStateToProps,
    { entriesListUpdateFunc }
)(EntriesListTable)