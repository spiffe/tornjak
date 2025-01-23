import React from "react";
import { connect } from 'react-redux';
import IsManager from 'components/is_manager';
import {
    entriesListUpdateFunc
} from 'redux/actions';
import Table from './list-table';
import { EntriesList } from "components/types";
import { RootState } from "redux/reducers";
import { DenormalizedRow } from "carbon-components-react";
import { saveAs } from "file-saver";
import TornjakApi from 'components/tornjak-api-helpers';

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
    TornjakApi: TornjakApi;
    constructor(props: EntriesListTableProp) {
        super(props);
        this.TornjakApi = new TornjakApi(props);
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
        var currTime = Date.now();
        let listData: { props: { entry: EntriesList; }; }[] | ({ key: string; props: { entry: EntriesList; }; } | JSX.Element)[] = [];
        if (typeof (data) === "string" || data === undefined)
            return
        data.forEach(val => listData.push(Object.assign({}, val)));
        let listtabledata: { idx: string; id: string; spiffeid: string; parentid: string; selectors: string; info: string; expired: string }[] = [];
        let i = 0;
        for (i = 0; i < listData.length; i++) {
            listtabledata[i] = { "idx": "", "id": "", "spiffeid": "", "parentid": "", "selectors": "", "info": "", "expired": ""};
            listtabledata[i]["idx"] = (i + 1).toString();
            listtabledata[i]["id"] = listData[i].props.entry.id;
            listtabledata[i]["spiffeid"] = "spiffe://" + listData[i].props.entry.spiffe_id.trust_domain + listData[i].props.entry.spiffe_id.path;
            listtabledata[i]["parentid"] = "spiffe://" + listData[i].props.entry.parent_id.trust_domain + listData[i].props.entry.parent_id.path;
            listtabledata[i]["selectors"] = listData[i].props.entry.selectors.map((s: { type: string; value: string; }) => s.type + ":" + s.value).join(', ');
            listtabledata[i]["info"] = JSON.stringify(listData[i].props.entry, null, ' ');
            if (listData[i].props.entry.expires_at <= Math.floor(currTime / 1000)) {
                listtabledata[i]["expired"] = "Expired";
            }
            else {
                listtabledata[i]["expired"] = "Active";
            }
        }
        this.setState({
            listTableData: listtabledata
        })
    }

    deleteEntry(selectedRows: readonly DenormalizedRow[]) {
        if (!selectedRows || selectedRows.length === 0) return "";

        // Collect the IDs of the selected entries
        const idsToDelete = selectedRows.map(row => row.cells[1].value);

        const deletePromise = IsManager
            ? this.TornjakApi.entryDelete(this.props.globalServerSelected, { ids: idsToDelete }, this.props.entriesListUpdateFunc, this.props.globalEntriesList)
            : this.TornjakApi.localEntryDelete({ ids: idsToDelete }, this.props.entriesListUpdateFunc, this.props.globalEntriesList);

        deletePromise
            .then(response => {
                const results = response.results; // Ensure you're accessing the 'results' array in the response

                if (Array.isArray(results)) {
                    const successIds = results.map(result => result.id);
                    const failedIds = idsToDelete.filter(id => !successIds.includes(id));

                    if (failedIds.length === 0) {
                        window.alert(`Entries deleted successfully!`);
                        window.location.reload(); // Reload the page or update the UI as needed
                    } else {
                        window.alert(`Error deleting entries with IDs: ${failedIds.join(', ')}`);
                    }
                } else {
                    window.alert("Unexpected response format. Could not delete entries.");
                }
            })
            .catch(error => {
                window.alert(`Error deleting entries: ${error.message}`);
            });
    }

    downloadEntries(selectedRows: readonly DenormalizedRow[]) {
        var selectedEntriesInfo = [], infoCell = 5, jsonInit = "{\n  \"entries\": [\n";
        if (selectedRows.length !== 0) {
            selectedEntriesInfo[0] = jsonInit;
            for (let i = 0; i < selectedRows.length; i++) {
                if (i < selectedRows.length - 1) {
                    selectedEntriesInfo[i + 1] = selectedRows[i].cells[infoCell].value + ",\n";
                } else {
                    selectedEntriesInfo[i + 1] = selectedRows[i].cells[infoCell].value + "\n]\n}";
                }
            }
        }
        var blob = new Blob(selectedEntriesInfo, { type: "application/json" });
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
            {
                header: 'Expiry Status',
                key: 'expired',
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