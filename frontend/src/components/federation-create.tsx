import { Component, ChangeEvent } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import { Dropdown, TextInput, FileUploader, Button, Accordion, AccordionItem, ToastNotification } from 'carbon-components-react';
import { ToastContainer } from 'react-toastify';
import GetApiServerUri from './helpers';
import './style.css';
import { showResponseToast } from './error-api';
import {
  tornjakMessageFunc,
  federationsListUpdateFunc,
} from 'redux/actions';
import { RootState } from 'redux/reducers';
import { link } from './types';
import { Launch } from '@carbon/icons-react';

type FederationCreateProps = {
  tornjakMessageFunc: (globalErrorMessage: string) => void,
  federationsListUpdateFunc: Function,
  globalServerSelected: string,
  globalErrorMessage: string,
};

type FederationCreateState = {
  federationJson: string,
  loading: boolean,
  success: boolean,
  error: string,
};

const NewFederationJsonFormatLink = (props: { link: link }) => (
  <div>
      <a rel="noopener noreferrer" href={props.link} target="_blank">(Click to see new entry JSON format)</a>
      <a rel="noopener noreferrer" href={props.link} target="_blank">{<Launch />}</a>
  </div>
)

class FederationCreate extends Component<FederationCreateProps, FederationCreateState> {
  constructor(props: FederationCreateProps) {
    super(props);
    this.state = {
      federationJson: "",
      loading: false,
      success: false,
      error: "",
    };
    this.handleFileUpload = this.handleFileUpload.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
  }

  handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result;
      if (typeof result === 'string') {
        this.setState({
          federationJson: result,
          success: false,
          error: "",
        });
      }
    };
    reader.onerror = () => {
      this.setState({ error: "Error reading the selected file." });
    };
    reader.readAsText(file);
  }

  onSubmit() {
    if (!this.state.federationJson) {
      this.setState({ error: "No federation JSON loaded." });
      return;
    }

    let jsonData: any;
    try {
      jsonData = JSON.parse(this.state.federationJson);
    } catch (err) {
      this.setState({ error: "Invalid JSON format." });
      return;
    }

    const endpoint = GetApiServerUri('/api/v1/spire/federations');
    this.setState({ loading: true, error: "", success: false });

    axios
      .post(endpoint, jsonData)
      .then(() => {
        this.setState({
          loading: false,
          success: true,
          error: "",
        });
      })
      .catch((err) => {
        this.setState({ loading: false, success: false });
        showResponseToast(err, { caption: "Could not create federation." });
        let errorMessage = "Failed to create federation.";
        if (err.response) {
          errorMessage = `Failed to create federation. Server returned status ${err.response.status}`;
        } else if (err.request) {
          errorMessage = "Failed to create federation. No response received from backend.";
        }
        this.setState({ error: errorMessage });
      });
  }

  render() {
    const { federationJson, loading, success, error } = this.state;
    const newFederationFormatLink = "https://github.com/spiffe/tornjak/blob/main/docs/newFederation-json-format.md";

    return (
      <div className="federation-create" data-test="federation-create">
        <h3 style={{marginBottom: 30}}>Create Federation</h3>

        <Accordion>
          <AccordionItem title={<h5>Upload Federation JSON</h5>} open>
            <div className="entry-form">
              <h6 style={{marginBottom: 15}}>Choose your local file:</h6>
              <p style={{ fontSize: 15 }}>only .json files </p>
              <NewFederationJsonFormatLink link={newFederationFormatLink} />
              <FileUploader
                accept={[".json"]}
                buttonKind="tertiary"
                buttonLabel="Upload file"
                filenameStatus="edit"
                iconDescription="Clear file"
                onChange={this.handleFileUpload}
              />
              
              <br />
              <Button
                onClick={this.onSubmit}
                kind="primary"
                disabled={!federationJson}
                className="trustbtn"
              >
                Create Federation
              </Button>
              {!federationJson && (
                <p style={{ fontSize: 13 }}>(Upload JSON File to Enable)</p>
              )}

              {loading && (
                <ToastNotification
                  kind="info"
                  title="Loading..."
                  subtitle="Uploading federation JSON..."
                  timeout={0}
                />
              )}

              {error && (
                <ToastNotification
                  kind="error"
                  title="Error"
                  subtitle={error}
                  timeout={0}
                />
              )}

              {success && (
                <ToastNotification
                  kind="success"
                  title="Success"
                  subtitle="Federation created successfully! Check Federation List."
                  timeout={0}
                />
              )}
            </div>
          </AccordionItem>

          {/*Custom Form To Be Implemented */}
          <AccordionItem title={<><h5>Custom Federation Form</h5><p style={{ fontSize: 16}}>(click to expand)</p></>}>
            <div className="custom-federation-form">
            </div>
          </AccordionItem>
        </Accordion>

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

export default connect(mapStateToProps, {
  tornjakMessageFunc,
  federationsListUpdateFunc,
})(FederationCreate);

export { FederationCreate };
