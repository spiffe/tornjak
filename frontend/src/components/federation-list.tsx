import { Component } from 'react';
import { connect } from 'react-redux';
import Table from "tables/federations-list-table";
import TornjakApi from './tornjak-api-helpers';
import {
  serverSelectedFunc,
  agentsListUpdateFunc,
  tornjakServerInfoUpdateFunc,
  serverInfoUpdateFunc,
  selectorInfoFunc,
  tornjakMessageFunc,
  workloadSelectorInfoFunc,
  agentworkloadSelectorInfoFunc,
  clustersListUpdateFunc,
  federationsListUpdateFunc
} from 'redux/actions';
import { RootState } from 'redux/reducers';
import { FederationsList, ServerInfo, TornjakServerInfo } from './types'

type FederationsListProp = {
  // dispatches a payload for list of federations with their metadata info as an array of FederationsList Type and has a return type of void
  federationsListUpdateFunc: (globalFederationsList: FederationsList[]) => void,
  // dispatches a payload for the tornjak error messsege and has a return type of void
  tornjakMessageFunc: (globalErrorMessage: string) => void,
  // dispatches a payload for the server trust domain and nodeAttestorPlugin as a ServerInfoType and has a return type of void
  serverInfoUpdateFunc: (globalServerInfo: ServerInfo) => void,
  // the selected server for manager mode 
  globalServerSelected: string,
  // error/ success messege returned for a specific function
  globalErrorMessage: string,
  // tornjak server info of the selected server
  globalTornjakServerInfo: TornjakServerInfo,
  // list of federations with their metadata info as an array of FederationsList Type
  globalFederationsList: FederationsList[],
}

type FederationsListState = {
  message: string // error/ success messege returned for a specific function for this specific component
}

const Federation = (props: { federation: FederationsList }) => (
  <tr>
    <td>{props.federation.trust_domain}</td>
    <td>{props.federation.bundle_endpoint_url}</td>
    <td>{props.federation.BundleEndpointProfile.HttpsSpiffe ? 'https_spiffe' : 'https_web'}</td>
    <td><div style={{ overflowX: 'auto', width: "400px" }}>
      <pre>{JSON.stringify(props.federation, null, ' ')}</pre>
    </div></td>
  </tr>
)

class FederationList extends Component<FederationsListProp, FederationsListState> {
  TornjakApi: TornjakApi;
  constructor(props: FederationsListProp) {
    super(props);
    this.TornjakApi = new TornjakApi(props);
    this.state = {
      message: "",
    };
  }

  componentDidMount() {
    this.TornjakApi.populateLocalFederationsUpdate(this.props.federationsListUpdateFunc, this.props.tornjakMessageFunc);
    if (this.props.globalTornjakServerInfo && Object.keys(this.props.globalTornjakServerInfo).length) {
      this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
    }
  }

  componentDidUpdate(prevProps: FederationsListProp) {
    if (prevProps.globalTornjakServerInfo !== this.props.globalTornjakServerInfo) {
      this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
    }
  }

  federationList() {
    if (typeof this.props.globalFederationsList !== 'undefined') {
      return this.props.globalFederationsList.map((currentFederation: FederationsList, index) => {
        return <Federation key={`federation-${index}`} federation={currentFederation} />;
      })
    } else {
      return ""
    }
  }

  render() {
    return (
      <div>
        <h3>Federations List</h3>
        {this.props.globalErrorMessage !== "OK" &&
          <div className="alert-primary" role="alert">
            <pre>
              {this.props.globalErrorMessage}
            </pre>
          </div>
        }
        <br /><br />
        <div className="indvidual-list-table">
          <Table data={this.federationList()} id="table-1" />
        </div>
      </div>
    )
  }
}

// Note: Needed for UI testing - will be removed after
// FederationsList.propTypes = {
//   globalServerSelected: PropTypes.string,
//   globalClustersList: PropTypes.array,
//   globalTornjakServerInfo: PropTypes.object,
//   globalErrorMessage: PropTypes.string,
//   serverSelectedFunc: PropTypes.func,
//   agentsListUpdateFunc: PropTypes.func,
//   tornjakServerInfoUpdateFunc: PropTypes.func,
//   serverInfoUpdateFunc: PropTypes.func,
//   clusterTypeList: PropTypes.array,
//   agentsList: PropTypes.array,
//   selectorInfoFunc: PropTypes.func,
//   tornjakMessageFunc: PropTypes.func,
//   workloadSelectorInfoFunc: PropTypes.func,
//   agentworkloadSelectorInfoFunc: PropTypes.func,
//   clustersListUpdateFunc: PropTypes.func
// };

const mapStateToProps = (state: RootState) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalFederationsList: state.federations.globalFederationsList,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessage: state.tornjak.globalErrorMessage,
})

export default connect(
  mapStateToProps,
  { serverSelectedFunc, agentsListUpdateFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc, selectorInfoFunc, tornjakMessageFunc, workloadSelectorInfoFunc, agentworkloadSelectorInfoFunc, clustersListUpdateFunc, federationsListUpdateFunc }
)(FederationList)

export { FederationList }