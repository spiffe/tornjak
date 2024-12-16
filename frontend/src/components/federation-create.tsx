import { Component, ChangeEvent } from 'react';
import { connect } from 'react-redux';
import axios from 'axios';
import {
  FileUploader,
  Button,
  Accordion,
  AccordionItem,
  ToastNotification,
} from 'carbon-components-react';
import { ToastContainer } from 'react-toastify';
import GetApiServerUri from './helpers';
import './style.css';
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
  statusOK: string,
  successJsonMessage: string,
  message: string,
};

const NewFederationJsonFormatLink = (props: { link: link }) => (
  <div>
    <a rel="noopener noreferrer" href={props.link} target="_blank">(Click to see new entry JSON format)</a>
    <a rel="noopener noreferrer" href={props.link} target="_blank">{<Launch />}</a>
  </div>
);

class FederationCreate extends Component<FederationCreateProps, FederationCreateState> {
  constructor(props: FederationCreateProps) {
    super(props);
    this.state = {
      federationJson: "",
      loading: false,
      statusOK: "",
      successJsonMessage: "",
      message: "",
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
          message: "",
          statusOK: "",
        });
      }
    };
    reader.onerror = () => {
      this.setState({ message: "Error reading the selected file.", statusOK: "ERROR" });
    };
    reader.readAsText(file);
  }

  onSubmit() {
    if (!this.state.federationJson) {
      this.setState({ message: "No federation JSON loaded.", statusOK: "ERROR" });
      return;
    }

    let jsonData: any;
    try {
      jsonData = JSON.parse(this.state.federationJson);
    } catch (err) {
      this.setState({ message: "Invalid JSON format.", statusOK: "ERROR" });
      return;
    }

    const endpoint = GetApiServerUri('/api/v1/spire/federations');
    this.setState({ loading: true, statusOK: "" });

    axios
      .post(endpoint, jsonData)
      .then((res) => {
        const responseMessage = res.data?.results?.[0]?.status?.message || "OK";
        this.setState({
          loading: false,
          statusOK: responseMessage === "OK" ? "OK" : "ERROR",
          successJsonMessage: responseMessage,
          message: JSON.stringify(res.data, null, ' '),
        });
      })
      .catch((err) => {
        const errorMessage = err.response?.data?.results?.[0]?.status?.message || "Failed to create federation.";
        this.setState({
          loading: false,
          statusOK: "ERROR",
          successJsonMessage: errorMessage,
          message: JSON.stringify(err.response?.data || err.message, null, ' '),
        });
      });
  }

  render() {
    const { federationJson, loading, statusOK, message, successJsonMessage } = this.state;
    const newFederationFormatLink = "https://github.com/spiffe/tornjak/blob/main/docs/newFederation-json-format.md";

    return (
      <div className="federation-create" data-test="federation-create">
        <h3 style={{ marginBottom: 30 }}>Create Federation</h3>

        {statusOK !== "" && (
          <div>
            <ToastNotification
              className="toast-entry-creation-notification"
              kind={statusOK === "OK" ? "info" : "error"}
              iconDescription="close notification"
              subtitle={
                <span>
                  <br />
                  <div role="alert" data-test="success-message">
                    {statusOK === "OK" && successJsonMessage === "OK" && (
                      <p className="success-message">--FEDERATION SUCCESSFULLY CREATED--</p>
                    )}
                    {statusOK === "ERROR" && (
                      <p className="failed-message">--FEDERATION CREATION FAILED--</p>
                    )}
                  </div>
                  <br />
                  <div className="toast-messege" data-test="alert-primary">
                    <pre className="toast-messege-color">{message}</pre>
                  </div>
                </span>
              }
              timeout={0}
              title="Federation Creation Notification"
            />
            {window.scrollTo({ top: 0, behavior: 'smooth' })}
          </div>
        )}

        <Accordion>
          <AccordionItem title={<h5>Upload Federation JSON</h5>} open>
            <div className="entry-form">
              <h6 style={{ marginBottom: 15 }}>Choose your local file:</h6>
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
            </div>
          </AccordionItem>

          <AccordionItem
            title={
              <>
                <h5>Custom Federation Form</h5>
                <p style={{ fontSize: 16 }}>(click to expand)</p>
              </>
            }
          >
            <div className="custom-federation-form"></div>
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
