import { Component } from 'react';
import axios from 'axios';
import { InlineNotification, TextArea, Button, TextInput } from 'carbon-components-react';
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
  error: string,
  bundleEndpointUrl: string
}

class TrustBundleCreate extends Component<TrustBundleCreateProps, TrustBundleCreateState> {
  TornjakApi: TornjakApi;
  constructor(props: TrustBundleCreateProps) {
    super(props);
    this.TornjakApi = new TornjakApi(props);
    this.state = {
      trustBundle: "",
      loading: false,
      error: "",
      bundleEndpointUrl: "" 
    };
    this.getTrustBundle = this.getTrustBundle.bind(this);
    this.handleInputChange = this.handleInputChange.bind(this);
  }

  handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    this.setState({ bundleEndpointUrl: event.target.value });
  }

  getTrustBundle() {
    const { bundleEndpointUrl } = this.state;
    this.setState({loading: true, error: "", trustBundle: ""});
    const endpoint = GetApiServerUri('/api/v1/spire/bundle');

    console.log("Fetching trust bundle from:", endpoint);

    axios.get(endpoint)
      .then(res => {
        const originalBundle = res.data;
        console.log("Fetched trust bundle:", originalBundle);
        const trustDomain = originalBundle.trust_domain;

        const federationData = {
          "federation_relationships": [
            {
              "trust_domain": trustDomain,
              "bundle_endpoint_url": bundleEndpointUrl, 
              "https_spiffe": {
                "endpoint_spiffe_id": `spiffe://${trustDomain}/spire/server` 
              },
              "trust_domain_bundle": originalBundle
            }
          ]
        };

        this.setState({
          trustBundle: JSON.stringify(federationData, null, 2),
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
    const { trustBundle, loading, error, bundleEndpointUrl } = this.state;

    const downloadTrustBundle = () => {
      if (!trustBundle) return;
      const blob = new Blob([trustBundle], { type: "application/json" });
      const url = URL.createObjectURL(blob);
  
      const a = document.createElement("a");
      a.href = url;
      a.download = "trust-bundle.json";
      a.click();
  
      URL.revokeObjectURL(url);
    };

    return (
      <div className="trustbundle-create" data-test="trustbundle-create">
        <h3>Obtain Trust Bundle</h3>
        <div className="bundle-input" data-test="bundle-endpoint-input">
          <TextInput
            aria-required="true"
            helperText="e.g. https://host.docker.internal:8440"
            id="bundle-endpoint-url"
            invalidText="A valid URL is required"
            labelText="Exposed Bundle Endpoint URL [*required]"
            placeholder="Enter Exposed Bundle Endpoint URL"
            value={bundleEndpointUrl}
            onChange={(e) => this.handleInputChange(e as React.ChangeEvent<HTMLInputElement>)}
            className="bundle-input-field"
          />
        </div>
        <div className="bundle_t">
          <Button onClick={this.getTrustBundle} kind="primary" className='trustbtn'>Get Trust Bundle</Button>
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
              cols={80}
              labelText="Fetched Trust Bundle"
              rows={20}
              value={trustBundle}
              readOnly 
            />
            <div style={{ marginTop: "10px" }}>
              <Button onClick={downloadTrustBundle} kind="secondary" className="trustdownbtn">
                Download Bundle
              </Button>
            </div>
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
