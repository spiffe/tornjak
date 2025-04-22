import { Component } from 'react';
import { connect } from 'react-redux';
import IsManager from './is_manager';
import Table from "tables/clusters-list-table";
import TornjakApi from './tornjak-api-helpers';
// import PropTypes from "prop-types"
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
} from 'redux/actions';
import { RootState } from 'redux/reducers';
import { ClustersList, ServerInfo, TornjakServerInfo } from './types'

type ClusterListProp = {
  // dispatches a payload for list of clusters with their metadata info as an array of ClustersList Type and has a return type of void
  clustersListUpdateFunc: (globalClustersList: ClustersList[]) => void,
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
  // list of clusters with their metadata info as an array of ClustersList Type
  globalClustersList: ClustersList[],
}

type ClusterListState = {
  message: string // error/ success messege returned for a specific function for this specific component
}

const Cluster = (props: { cluster: ClustersList }) => (
  <tr>
    <td>{props.cluster.name}</td>
    <td>{props.cluster.platformType}</td>
    <td>{props.cluster.domainName}</td>
    <td>{props.cluster.managedBy}</td>
    <td><div style={{ overflowX: 'auto', width: "400px" }}>
      <pre>{JSON.stringify(props.cluster.agentsList, null, ' ')}</pre>
    </div></td>
  </tr>
)

class ClusterList extends Component<ClusterListProp, ClusterListState> {
  TornjakApi: TornjakApi;
  constructor(props: ClusterListProp) {
    super(props);
    this.TornjakApi = new TornjakApi(props);
    this.state = {
      message: "",
    };
  }

  componentDidMount() {
    if (IsManager) {
      if (this.props.globalServerSelected !== "") {
        this.TornjakApi.populateClustersUpdate(this.props.globalServerSelected, this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
      }
    } else {
      this.TornjakApi.populateLocalClustersUpdate(this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
      if (this.props.globalTornjakServerInfo && Object.keys(this.props.globalTornjakServerInfo).length) {
        this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
      }
    }
  }

  componentDidUpdate(prevProps: ClusterListProp) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.TornjakApi.populateClustersUpdate(this.props.globalServerSelected, this.props.clustersListUpdateFunc, this.props.tornjakMessageFunc);
      }
    } else {
      if (prevProps.globalTornjakServerInfo !== this.props.globalTornjakServerInfo) {
        this.TornjakApi.populateServerInfo(this.props.globalTornjakServerInfo, this.props.serverInfoUpdateFunc);
      }
    }
  }

  clusterList() {
    if (typeof this.props.globalClustersList !== 'undefined') {
      return this.props.globalClustersList.map((currentCluster: ClustersList) => {
        return <Cluster key={currentCluster.name} cluster={currentCluster} />;
      })
    } else {
      return ""
    }
  }

  render() {
    return (
      <div data-test="cluster-list">
        <h3>Clusters List</h3>
        {this.props.globalErrorMessage !== "OK" &&
          <div className="alert-primary" role="alert">
            <pre>
              {this.props.globalErrorMessage}
            </pre>
          </div>
        }
        <br /><br />
        <div className="indvidual-list-table">
          <Table data={this.clusterList()} id="table-1" />
        </div>
      </div>
    )
  }
}

// Note: Needed for UI testing - will be removed after
// ClusterList.propTypes = {
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
  globalClustersList: state.clusters.globalClustersList,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessage: state.tornjak.globalErrorMessage,
})

export default connect(
  mapStateToProps,
  { serverSelectedFunc, agentsListUpdateFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc, selectorInfoFunc, tornjakMessageFunc, workloadSelectorInfoFunc, agentworkloadSelectorInfoFunc, clustersListUpdateFunc }
)(ClusterList)

export { ClusterList }