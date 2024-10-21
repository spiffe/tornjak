import React from "react";
import { connect } from 'react-redux';=
import {
    federationsListUpdateFunc
} from 'redux/actions';
import Table from './list-table';
import { FederationsList } from "components/types";
import { RootState } from "redux/reducers";
import TornjakApi from 'components/tornjak-api-helpers';

// FederationListTable takes in 
// listTableData: federation data to be rendered on table
// returns federations data inside a carbon component table with specified functions

type FederationsListTableProp = {
    // dispatches a payload for list of federations with their metadata info as an array of FederationsList Type and has a return type of void
    federationsListUpdateFunc: (globalFederationsList: FederationsList[]) => void,
    // data provided to the federations table
    data: {
        key: string,
        props: { federation: FederationsList }
    }[] | string | JSX.Element[],
    id: string,
    // list of federations with their metadata info as an array of FederationsList Type
    globalFederationsList: FederationsList[],
    // the selected server for manager mode 
    globalServerSelected: string,
}

type FederationsListTableState = {
    listData: { key: string, props: { federation: FederationsList } }[] | FederationsList[] | string | JSX.Element[],
    listTableData: {
        id: string;
        federationTrustDomain: string;
        federationBundleUrl: string;
        federationBundleProfile: string;
    }[]

}
class FederationsListTable extends React.Component<FederationsListTableProp, FederationsListTableState> {
    TornjakApi: TornjakApi;
    constructor(props: FederationsListTableProp) {
        super(props);
        this.TornjakApi = new TornjakApi(props);
        this.state = {
            listData: props.data,
            listTableData: [],
        };
        this.prepareTableData = this.prepareTableData.bind(this);
    }

    componentDidMount() {
        this.prepareTableData();
    }
    componentDidUpdate(prevProps: FederationsListTableProp) {
        if (prevProps !== this.props) {
            this.setState({
                listData: this.props.globalFederationsList
            })
            this.prepareTableData();
        }
    }

    prepareTableData() {
        const { data } = this.props;
        let listData: { props: { federation: FederationsList; }; }[] | ({ key: string; props: { federation: FederationsList; }; } | JSX.Element)[] = [];
        if (typeof (data) === "string" || data === undefined)
            return
        data.forEach(val => listData.push(Object.assign({}, val)));
        let listtabledata: { id: string; federationTrustDomain: string; federationBundleUrl: string; federationBundleProfile: string  }[] = [];
        for (let i = 0; i < listData.length; i++) {
            listtabledata[i] = { id: "", federationTrustDomain: "", federationBundleUrl: "", federationBundleProfile: "" };
            listtabledata[i]["id"] = (i + 1).toString();
            listtabledata[i]["federationTrustDomain"] = listData[i].props.federation.trust_domain;
            listtabledata[i]["federationBundleUrl"] = listData[i].props.federation.bundle_endpoint_url;
            listtabledata[i]["federationBundleProfile"] = listData[i].props.federation.BundleEndpointProfile.HttpsSpiffe ? 'https_spiffe' : 'https_web';
        }
        this.setState({
            listTableData: listtabledata
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
                header: 'Trust Domain',
                key: 'federationTrustDomain',
            },
            {
                header: 'Bundle Endpoint URL',
                key: 'federationBundleUrl',
            },
            {
                header: 'Bundle Endpoint Profile',
                key: 'federationBundleProfile',
            },
        ];
        return (
            <div>
                <Table
                    entityType={"Federation"}
                    listTableData={listTableData}
                    headerData={headerData}
                    deleteEntity={() => {}}
                    banEntity={undefined}
                    downloadEntity={undefined} />
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    globalServerSelected: state.servers.globalServerSelected,
    globalFederationsList: state.federations.globalFederationsList,
})

export default connect(
    mapStateToProps,
    { federationsListUpdateFunc }
)(FederationsListTable)