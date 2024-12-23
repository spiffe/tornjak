import React, { Component, ChangeEvent } from 'react';
import axios from 'axios';
import {
  FileUploader,
  Button,
  Accordion,
  AccordionItem,
  ToastNotification,
  ModalWrapper,
  TextInput,
  Link
} from 'carbon-components-react';
import { ToastContainer } from 'react-toastify';
import GetApiServerUri from './helpers';
import './style.css';
import {
  tornjakMessageFunc,
  federationsListUpdateFunc,
} from 'redux/actions';
import { RootState } from 'redux/reducers';
import { connect } from 'react-redux';
import { link } from './types';
import { Launch, NextOutline } from '@carbon/icons-react';

type FederationCreateProps = {
  tornjakMessageFunc: (globalErrorMessage: string) => void,
  federationsListUpdateFunc: Function,
  globalServerSelected: string,
  globalErrorMessage: string,
};

type Federation = {
  trust_domain?: string,
  federation_relationships?: {
    trust_domain?: string,
    bundle_endpoint_url?: string,
    [key: string]: any
  }[],
  [key: string]: any
};

type FederationCreateState = {
  federationJson: string,
  uploadedFederation: Federation | Federation[],
  federationLoaded: boolean,
  loading: boolean,
  statusOK: string,
  successJsonMessage: string,
  message: string,
  exposedBundleEndpoint: string,
  newFederationsIds: { trustDomain: string }[],
  selectedFederationId: number,
  federationSelected: boolean,
};

const NewFederationJsonFormatLink = (props: { link: link }) => (
  <div>
    <a rel="noopener noreferrer" href={props.link} target="_blank">(Click to see new entry JSON format)</a>
    <a rel="noopener noreferrer" href={props.link} target="_blank"><Launch /></a>
  </div>
);

class FederationCreate extends Component<FederationCreateProps, FederationCreateState> {
  constructor(props: FederationCreateProps) {
    super(props);
    this.state = {
      federationJson: "",
      uploadedFederation: [],
      federationLoaded: false,
      loading: false,
      statusOK: "",
      successJsonMessage: "",
      message: "",
      exposedBundleEndpoint: "",
      newFederationsIds: [],
      selectedFederationId: -1,
      federationSelected: false,
    };
    this.handleFileUpload = this.handleFileUpload.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.applyEditToFederation = this.applyEditToFederation.bind(this);
    this.setSelectedFederation = this.setSelectedFederation.bind(this);
  }

  handleFileUpload(e: ChangeEvent<HTMLInputElement>) {
    const files = e.target.files;
    if (!files || files.length === 0) {
      return;
    }

    const file = files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const result = evt.target?.result;
      if (typeof result === 'string') {
        try {
          const parsed = JSON.parse(result);
          const uploadedFederation = parsed;

          let newFederationsIds: { trustDomain: string }[];
          if (Array.isArray(uploadedFederation)) {
            newFederationsIds = uploadedFederation.map((fed: Federation) => {
              const trustDomain = (fed.federation_relationships && fed.federation_relationships.length > 0)
                ? fed.federation_relationships[0].trust_domain || "No Trust Domain"
                : "No Trust Domain";
              return { trustDomain: trustDomain };
            });
          } else {
            const singleFed = uploadedFederation as Federation;
            const trustDomain = (singleFed.federation_relationships && singleFed.federation_relationships.length > 0)
              ? singleFed.federation_relationships[0].trust_domain || "No Trust Domain"
              : "No Trust Domain";
            newFederationsIds = [{ trustDomain: trustDomain }];
          }

          this.setState({
            federationJson: result,
            uploadedFederation: uploadedFederation,
            federationLoaded: true,
            message: "",
            statusOK: "",
            newFederationsIds: newFederationsIds,
          });
        } catch (err) {
          this.setState({ message: "Invalid JSON format.", statusOK: "ERROR" });
        }
      }
    };
    reader.onerror = () => {
      this.setState({ message: "Error reading the selected file.", statusOK: "ERROR" });
    };
    reader.readAsText(file);
  }

  onSubmit() {
    const { uploadedFederation } = this.state;

    if (!uploadedFederation || (Array.isArray(uploadedFederation) && uploadedFederation.length === 0)) {
      this.setState({ message: "No federation JSON loaded.", statusOK: "ERROR" });
      return;
    }

    let jsonData: Federation | Federation[] = uploadedFederation;

    if (Array.isArray(jsonData) && jsonData.length === 1) {
      jsonData = jsonData[0];
    }

    console.log("Final JSON to be submitted:", jsonData);

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

  setSelectedFederation(index: number) {
    if (this.state.federationSelected) {
      if (!window.confirm("All changes will be lost! Press 'Apply' to save or 'Cancel' to continue without saving.")) {
        return;
      }
    }

    let fed: Federation | undefined;
    if (Array.isArray(this.state.uploadedFederation)) {
      fed = this.state.uploadedFederation[index];
    } else {
      if (index !== 0) {
        console.warn("Index out of range for single federation object.");
        return;
      }
      fed = this.state.uploadedFederation;
    }

    const fedRel = fed?.federation_relationships && fed.federation_relationships.length > 0
      ? fed.federation_relationships[0]
      : null;

    const exposedBundleEndpoint = fedRel?.bundle_endpoint_url || "";

    this.setState({
      selectedFederationId: index,
      federationSelected: true,
      exposedBundleEndpoint: exposedBundleEndpoint,
    });
  }

  applyEditToFederation() {
    const { selectedFederationId, uploadedFederation, exposedBundleEndpoint } = this.state;

    if (selectedFederationId === -1) {
      alert("Please select a Federation from the list, and make necessary changes to apply edit!");
      return false;
    }

    let updatedFederations: Federation[];
    if (Array.isArray(uploadedFederation)) {
      updatedFederations = [...uploadedFederation];
    } else {
      updatedFederations = [uploadedFederation];
    }

    if (
      selectedFederationId >= 0 &&
      selectedFederationId < updatedFederations.length &&
      updatedFederations[selectedFederationId].federation_relationships &&
      updatedFederations[selectedFederationId].federation_relationships!.length > 0
    ) {
      const cleanedUrl = exposedBundleEndpoint.trim();
      updatedFederations[selectedFederationId].federation_relationships![0].bundle_endpoint_url = cleanedUrl;
    } else {
      console.warn("No federation_relationships to update, or index out of range.");
    }

    let finalUploadedFederation: Federation | Federation[] = updatedFederations;
    if (updatedFederations.length === 1 && !Array.isArray(this.state.uploadedFederation)) {
      finalUploadedFederation = updatedFederations[0];
    }

    this.setState({
      uploadedFederation: finalUploadedFederation,
      selectedFederationId: -1,
      federationSelected: false,
      exposedBundleEndpoint: "",
    });

    console.log("Updated Federation JSON:", finalUploadedFederation);
    alert(`Federation ${selectedFederationId + 1} Updated!`);
    return true;
  }

  render() {
    const { loading, statusOK, message, successJsonMessage, federationLoaded, uploadedFederation, newFederationsIds, selectedFederationId, federationSelected, exposedBundleEndpoint } = this.state;
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
          <AccordionItem title={<h5>Upload Federation Trust Bundle</h5>} open>
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
                onDelete={() => {
                  this.setState({
                    federationJson: "",
                    uploadedFederation: [],
                    federationLoaded: false,
                    message: "",
                    statusOK: "",
                    newFederationsIds: []
                  });
                }}
              />

              {federationLoaded && (
                <div>
                  <br />
                  <ToastNotification
                    className="toast-entry-creation-notification"
                    kind="info"
                    iconDescription="close notification"
                    subtitle={
                      <span>
                        <br />
                        {Array.isArray(uploadedFederation) && uploadedFederation.length === 1 && (
                          <div>1 Federation Loaded from File</div>
                        )}
                        {Array.isArray(uploadedFederation) && uploadedFederation.length > 1 && (
                          <div>{uploadedFederation.length} Federations Loaded from File</div>
                        )}
                        {!Array.isArray(uploadedFederation) && (
                          <div>1 Federation Loaded from File</div>
                        )}
                      </span>
                    }
                    timeout={60000}
                    title="Federations Upload Notification"
                  />

                  <div className="fed-edit-container">
                    <div className="view_federations_yaml_button">
                      <ModalWrapper
                        passiveModal={true}
                        handleSubmit={() => true}
                        size='lg'
                        triggerButtonKind="ghost"
                        buttonTriggerText="View Uploaded Bundle/s"
                        modalHeading="Federation JSON"
                        modalLabel="View Uploaded Federation(s)"
                      >
                        <pre className="yaml_view_modal_json">{JSON.stringify(uploadedFederation, null, 2)}</pre>
                      </ModalWrapper>
                    </div>

                    <div className="edit_federations_button">
                      <ModalWrapper
                        size='lg'
                        triggerButtonKind="ghost"
                        buttonTriggerText="Edit Uploaded Bundle/s"
                        handleSubmit={this.applyEditToFederation}
                        modalHeading="Bundle/s Editor"
                        modalLabel="Edit Uploaded Bundle/s"
                        primaryButtonText="Step 3. Apply"
                        secondaryButtonText="Exit"
                      >
                        <div className='edit-entry-container'>
                          <div className="entries-list-container">
                            <fieldset>
                              <legend className="modal_Entry_list_title">Step 1. Select Bundle</legend>
                              {newFederationsIds.map((fedId, index) => (
                                <div key={index}>
                                  {index === selectedFederationId &&
                                    <div>
                                      <Link
                                        className='selected-entry'
                                        id={fedId.trustDomain}
                                        href="#"
                                        renderIcon={NextOutline}
                                        visited={false}
                                        inline
                                        onClick={(e) => {
                                          this.setSelectedFederation(index);
                                          e.preventDefault();
                                        }}
                                      >
                                        {(index + 1).toString() + ". " + fedId.trustDomain}
                                      </Link>
                                    </div>
                                  }
                                  {index !== selectedFederationId &&
                                    <div>
                                      <Link
                                        id={fedId.trustDomain}
                                        href="#"
                                        renderIcon={NextOutline}
                                        onClick={(e) => {
                                          this.setSelectedFederation(index);
                                          e.preventDefault();
                                        }}
                                      >
                                        {(index + 1).toString() + ". " + fedId.trustDomain}
                                      </Link>
                                    </div>
                                  }
                                </div>
                              ))}
                            </fieldset>
                            <br />
                            <legend className="additional_info_entries_list">[Select Bundle to Edit]</legend>
                          </div>
                          <div className="entries-edit-form">
                            <p style={{
                              fontSize: 15,
                              fontWeight: "bold",
                              textDecoration: "underline",
                              marginBottom: 10
                            }}>Step 2. Edit Bundle</p>
                            <TextInput
                              aria-required="true"
                              helperText="e.g. https://host.docker.internal:8440"
                              id="exposed-bundle-endpoint"
                              invalidText="A valid value is required"
                              labelText="Exposed Bundle Endpoint URL [*required]"
                              placeholder="Enter endpoint URL"
                              value={exposedBundleEndpoint}
                              disabled={!federationSelected}
                              onChange={(e) => this.setState({ exposedBundleEndpoint: e.target.value })}
                            />
                          </div>
                        </div>
                      </ModalWrapper>
                    </div>
                  </div>
                </div>
              )}

              <br />
              <Button
                onClick={this.onSubmit}
                kind="primary"
                disabled={(!Array.isArray(uploadedFederation) && !uploadedFederation) || (Array.isArray(uploadedFederation) && uploadedFederation.length === 0)}
                className="trustbtn"
              >
                Create Federation
              </Button>
              {((!Array.isArray(uploadedFederation) && !uploadedFederation) || (Array.isArray(uploadedFederation) && uploadedFederation.length === 0)) && (
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
