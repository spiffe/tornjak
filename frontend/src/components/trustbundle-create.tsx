import { Component } from 'react';
import axios from 'axios';
import { InlineNotification, TextArea, Button } from 'carbon-components-react';
import { ToastContainer } from 'react-toastify';
import GetApiServerUri from './helpers';
import TornjakApi from './tornjak-api-helpers';
import { connect } from 'react-redux';
import { 
  tornjakMessageFunc,
  serverInfoUpdateFunc,
  agentsListUpdateFunc,
  clusterTypeInfoFunc,
  tornjakServerInfoUpdateFunc,
  selectorInfoFunc,
  serverSelectedFunc
} from 'redux/actions';
import { RootState } from 'redux/reducers';
import { showResponseToast } from './error-api';
import './style.css';

type TrustBundleCreateProps = {
  tornjakMessageFunc: (globalErrorMessage: string) => void,
  serverInfoUpdateFunc: Function,
  agentsListUpdateFunc: Function,
  clusterTypeInfoFunc: Function,
  tornjakServerInfoUpdateFunc: Function,
  selectorInfoFunc: Function,
  serverSelectedFunc: Function,
  globalErrorMessage: string,
  globalServerSelected: string,
};

type TrustBundleCreateState = {
  trustBundle: string,
  loading: boolean,
  error: string
}

class TrustBundleCreate extends Component<TrustBundleCreateProps, TrustBundleCreateState> {
  TornjakApi: TornjakApi;
  constructor(props: TrustBundleCreateProps) {
    super(props);
    this.TornjakApi = new TornjakApi(props);
    this.state = {
      trustBundle: "",
      loading: false,
      error: ""
    };
    this.getTrustBundle = this.getTrustBundle.bind(this);
  }

  getTrustBundle() {
    this.setState({loading: true, error: "", trustBundle: ""});
    const endpoint = GetApiServerUri('/api/v1/spire/bundle');

    console.log("Got:      " + endpoint);

    axios.get(endpoint)
      .then(res => {
        this.setState({
          trustBundle: JSON.stringify(res.data, null, 2),
          loading: false
        });
      })
      .catch(err => {
        console.error("Error fetching trust bundle:", err);
        let errorMessage = "Failed to fetch trust bundle. Could not connect to backend";
        if (err.response) {
          errorMessage = `Failed to fetch trust bundle. Server returned status ${err.response.status}`;
        } else if (err.request) {
          errorMessage = "Failed to fetch trust bundle. No response received from backend.";
        }

        this.setState({loading: false, error: errorMessage});
        showResponseToast(err);
      });
  }

  render() {
    const { trustBundle, loading, error } = this.state;
    return (
      <div className="trustbundle-create" data-test="trustbundle-create">
        <h3>Obtain Trust Bundle</h3>
        <div>
          <Button onClick={this.getTrustBundle} kind="primary">Get Trust Bundle</Button>
        </div>
        {loading && (
          <InlineNotification
            kind="info"
            title="Loading..."
            subtitle="Fetching the trust bundle from the SPIRE server."
            hideCloseButton
          />
        )}
        {error && (
          <InlineNotification
            kind="error"
            title="Error"
            subtitle={error}
            hideCloseButton
          />
        )}
        {!loading && !error && trustBundle && (
          <div className="trust-bundle-area">
            <TextArea
              cols={50}
              labelText="Fetched Trust Bundle"
              rows={10}
              value={trustBundle}
              readOnly
            />
          </div>
        )}
        <ToastContainer
          className="carbon-toast"
          containerId="notifications"
          draggable={false}
        />
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalErrorMessage: state.tornjak.globalErrorMessage,
});

export default connect(
  mapStateToProps,
  {
    tornjakMessageFunc,
    serverInfoUpdateFunc,
    agentsListUpdateFunc,
    clusterTypeInfoFunc,
    tornjakServerInfoUpdateFunc,
    selectorInfoFunc,
    serverSelectedFunc,
  }
)(TrustBundleCreate);

export { TrustBundleCreate };
