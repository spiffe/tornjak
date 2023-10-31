import React, { Component } from 'react';
import {
    FileUploader,
    ToastNotification,
    ModalWrapper,
    Checkbox, TextInput,
    TextArea,
    NumberInput,
    Link,
    Dropdown
} from 'carbon-components-react';
import { Launch, NextOutline } from '@carbon/icons-react';
import { connect } from 'react-redux';
import TornjakApi from './tornjak-api-helpers';
import './style.css';
import SpiffeHelper from './spiffe-helper';
import {
    newEntriesUpdateFunc
} from 'redux/actions';
import {
    EntriesList,
    link,
    AgentsList,
} from './types';
import { RootState } from 'redux/reducers';
import { showToast } from './error-api';

type CreateEntryJsonProp = {
    // dispatches a payload for list of new entries uploaded with their metadata info as an array of EntriesListType and has a return type of void
    newEntriesUpdateFunc: (globalNewEntries: EntriesList[]) => void,
    // list of new entries to be created as array of EntriesListType
    globalNewEntries: EntriesList[],
    // list of available agents as array of AgentsListType
    globalAgentsList: AgentsList[],
    // list of available parent ids
    ParentIdList: string[],
}

type CreateEntryJsonState = {
    prefix: string,
    parseError: boolean,
    isEntriesLoaded: boolean,
    newEntriesIds: { spiffeId: string, [x: string]: string; }[],
    newEntrySelected: EntriesList,
    selectedEntryId: number,
    uploadedEntries: EntriesList[],
    yamlFormSpiffeId: string,
    spiffeIdTrustDomain: string,
    spiffeIdPath: string,
    spiffeId: string,
    parentIdTrustDomain: string,
    parentIdPath: string,
    parentId: string,
    selectorsList: string,
    jwt_svid_ttl: number,
    x509_svid_ttl: number,
    expiresAt: number,
    federatesWith: string,
    dnsNames: string,
    adminFlag: boolean,
    downstream: boolean,
    entrySelected: boolean,
    spiffeIdPrefix: string,
    newEntriesLoaded: boolean,
    newFileUploaded: boolean,
}

const NewEntryJsonFormatLink = (props: { link: link }) => (
    <div>
        <a rel="noopener noreferrer" href={props.link} target="_blank">(Click to see new entry JSON format)</a>
        <a rel="noopener noreferrer" href={props.link} target="_blank">{<Launch />}</a>
    </div>
)
class CreateEntryJson extends Component<CreateEntryJsonProp, CreateEntryJsonState>  {
    TornjakApi: TornjakApi;
    SpiffeHelper: SpiffeHelper;
    constructor(props: CreateEntryJsonProp) {
        super(props);
        this.TornjakApi = new TornjakApi(props);
        this.SpiffeHelper = new SpiffeHelper(props);
        this.handleChange = this.handleChange.bind(this);
        this.setSelectedEntriesIds = this.setSelectedEntriesIds.bind(this);
        this.onChangeSelectors = this.onChangeSelectors.bind(this);
        this.onChangex509Ttl = this.onChangex509Ttl.bind(this);
        this.onChangeJwtTtl = this.onChangeJwtTtl.bind(this);
        this.onChangeExpiresAt = this.onChangeExpiresAt.bind(this);
        this.onChangeFederatesWith = this.onChangeFederatesWith.bind(this);
        this.onChangeDnsNames = this.onChangeDnsNames.bind(this);
        this.onChangeAdminFlag = this.onChangeAdminFlag.bind(this);
        this.onChangeDownStream = this.onChangeDownStream.bind(this);
        this.handleModalSubmit = this.handleModalSubmit.bind(this);
        // this.onChangeSpiffeId = this.onChangeSpiffeId.bind(this);
        this.onChangeParentId = this.onChangeParentId.bind(this);
        this.applyEditToEntry = this.applyEditToEntry.bind(this);
        this.passiveModal = this.passiveModal.bind(this);

        this.state = {
            prefix: "spiffe://",
            parseError: false,
            isEntriesLoaded: false,
            newEntriesIds: [],
            newEntrySelected: {
                id: "",
                spiffe_id: { trust_domain: "", path: "" },
                parent_id: { trust_domain: "", path: "" },
                selectors: [],
                jwt_svid_ttl: 0,
                x509_svid_ttl: 0,
                federates_with: [],
                admin: false,
                downstream: false,
                expires_at: 0,
                dns_names: [],
                revision_number: 0,
                store_svid: false,
            },
            selectedEntryId: -1,
            uploadedEntries: [],
            yamlFormSpiffeId: "",
            spiffeIdTrustDomain: "",
            spiffeIdPath: "",
            spiffeId: "",
            parentIdTrustDomain: "",
            parentIdPath: "",
            parentId: "",
            selectorsList: "",
            x509_svid_ttl: 0,
            jwt_svid_ttl: 0,
            expiresAt: 0,
            federatesWith: "",
            dnsNames: "",
            adminFlag: false,
            downstream: false,
            entrySelected: false,
            spiffeIdPrefix: "",
            newEntriesLoaded: false,
            newFileUploaded: false,
        }
    }

    componentDidMount() { }

    componentDidUpdate(prevProps: CreateEntryJsonProp, prevState: CreateEntryJsonState) {
        if (prevProps.globalAgentsList !== this.props.globalAgentsList) {
            this.props.newEntriesUpdateFunc(this.state.uploadedEntries);
        }
    }

    // TODO(mamy-CS): e - any for now will be explicitly typed
    handleChange(e: any): void {
        var idx = 0;
        let localNewEntriesIds: { spiffeId: string, [x: string]: string; }[] = [];
        this.setState({
            parseError: false, // reset invalid notification toast
            isEntriesLoaded: true,
            newEntriesLoaded: false, //reset new entries loaded toast
        })
        var yamlFile = e.target.files[0]; // json File List of objects
        var fileReader = new FileReader();
        fileReader.addEventListener("load", () => {
            var result = fileReader.result;
            if (typeof result !== "string") {
                return
            }
            try {
                var parsedData = JSON.parse(result);
                this.props.newEntriesUpdateFunc(parsedData.entries);
                for (let i = 0; i < parsedData.entries.length; i++) {
                    localNewEntriesIds[idx] = { "spiffeId": "" };
                    localNewEntriesIds[idx]["spiffeId"] = this.SpiffeHelper.getEntrySpiffeid(parsedData.entries[i]);
                    if (localNewEntriesIds[idx]["spiffeId"] === "") {
                        localNewEntriesIds[idx]["spiffeId"] = parsedData.entries[i].spiffe_id.path
                    }
                    idx++;
                }
                this.setState({
                    parseError: false,
                    newEntriesIds: localNewEntriesIds,
                    uploadedEntries: parsedData.entries,
                    newEntriesLoaded: true,
                })
                // populate first entry
                this.setSelectedEntriesIds(0, 0, parsedData.entries[0])
            } catch (e) {
                showToast({caption: "Encountered a parse error. Is the JSON invalid?"})
                console.log(e)
                this.setState({
                    parseError: true,
                    newFileUploaded: false
                })
                return false;
            }
            return true;
        }, false);

        if (yamlFile) {
            fileReader.readAsText(yamlFile);
        }
    }

    setSelectedEntriesIds(_e: number, id: number, _uploadedEntries: EntriesList | undefined) {
        if (this.state.entrySelected) {
            if (window.confirm("All changes will be lost! Press 'Step 3. APPLY' to save or 'Cancel' to continue without saving.")) {
                return;
            }
        }
        var prefix = this.state.prefix,
            spiffeId_trustDomain = "",
            spiffeId_path = "",
            spiffeId = "",
            parentId_trustDomain = "",
            parentId_path = "",
            parentId = "",
            selectorsWithNewline = "",
            federates_with = "",
            dns_names = "";

        if (_uploadedEntries !== undefined) {
            var localNewEntry: EntriesList = _uploadedEntries;
        } else (localNewEntry = this.state.uploadedEntries[id])

        if (localNewEntry.spiffe_id !== undefined) {
            spiffeId_trustDomain = localNewEntry.spiffe_id.trust_domain;
            spiffeId_path = localNewEntry.spiffe_id.path;
            if (localNewEntry.spiffe_id.trust_domain !== undefined && localNewEntry.spiffe_id.path !== undefined) {
                spiffeId = prefix + localNewEntry.spiffe_id.trust_domain + localNewEntry.spiffe_id.path;
            } else if (localNewEntry.spiffe_id.trust_domain !== undefined) {
                spiffeId = prefix + localNewEntry.spiffe_id.trust_domain;
            } else if (localNewEntry.spiffe_id.path !== undefined) {
                spiffeId = localNewEntry.spiffe_id.path;
            }
        }
        if (localNewEntry.parent_id !== undefined) {
            parentId_trustDomain = localNewEntry.parent_id.trust_domain;
            parentId_path = localNewEntry.parent_id.path;
            if (localNewEntry.parent_id.trust_domain !== undefined && localNewEntry.parent_id.path !== undefined) {
                parentId = prefix + localNewEntry.parent_id.trust_domain + localNewEntry.parent_id.path;
            } else if (localNewEntry.parent_id.trust_domain !== undefined) {
                parentId = prefix + localNewEntry.parent_id.trust_domain;
            } else if (localNewEntry.parent_id.path !== undefined) {
                parentId = localNewEntry.parent_id.path;
            }
        }
        if (localNewEntry.selectors !== undefined && localNewEntry.selectors.length !== 0 && localNewEntry.selectors[0] !== null) {
            var selectors = localNewEntry.selectors;
            var selectorJoinedArray = selectors.map((x) => (x.type + ":" + x.value + "\n"));
            selectorsWithNewline = selectorJoinedArray.join('');
        }
        if (localNewEntry.federates_with !== undefined) {
            federates_with = localNewEntry.federates_with.toString();
        }
        if (localNewEntry.dns_names !== undefined) {
            dns_names = localNewEntry.dns_names.toString();
        }
        this.setState({
            selectedEntryId: id,
            newEntrySelected: localNewEntry,
            spiffeIdTrustDomain: spiffeId_trustDomain,
            spiffeIdPath: spiffeId_path,
            spiffeId: spiffeId,
            parentId: parentId,
            parentIdTrustDomain: parentId_trustDomain,
            parentIdPath: parentId_path,
            selectorsList: selectorsWithNewline,
            x509_svid_ttl: localNewEntry.x509_svid_ttl,
            jwt_svid_ttl: localNewEntry.jwt_svid_ttl,
            expiresAt: localNewEntry.expires_at,
            federatesWith: federates_with,
            dnsNames: dns_names,
            adminFlag: localNewEntry.admin,
            downstream: localNewEntry.downstream,
            entrySelected: true,
            spiffeIdPrefix: prefix + spiffeId_trustDomain
        })
    }

    applyEditToEntry() {
        if (this.state.selectedEntryId === -1) {
            alert("Please Select an Entry From the List, and make Necessary Changes to Apply Edit!");
            return false;
        }
        if (this.state.spiffeIdTrustDomain === undefined || this.state.spiffeIdTrustDomain === "") {
            alert("SPIFFE ID Trust Domain Empty/ Invalid, Please Input Trust Domain!");
            return false;
        }

        if (this.state.spiffeIdPath === undefined || this.state.spiffeIdPath === "") {
            alert("SPIFFE ID Path Empty/ Invalid, Please Input Path!");
            return false;
        }
        console.log(this.state.parentIdTrustDomain)
        if (this.state.parentIdTrustDomain === undefined || this.state.parentIdTrustDomain === "") {
            alert("Parent ID Trust Domain Empty/ Invalid, Please Input Trust Domain!");
            return false;
        }

        if (this.state.parentIdPath === undefined || this.state.parentIdPath === "") {
            alert("Parent ID Path Empty/ Invalid, Please Input Path!");
            return false;
        }
        if (this.state.selectorsList.length === 0) {
            alert("Selectors List Empty/ Invalid, Please Input Selectors!");
            return false;
        }
        var entriesToUpload: EntriesList[] = this.state.uploadedEntries,
            selectedEntryId = this.state.selectedEntryId,
            selectorStrings: string[] = [],
            selectorEntries = [],
            federatedWithList: string[] = [],
            dnsNamesWithList: string[] = [];

        if (this.state.selectorsList.length !== 0) {
            selectorStrings = this.state.selectorsList.split('\n').map(x => x.trim())
        }
        selectorEntries = selectorStrings.filter(String).map(x => x.indexOf(":") > 0 ?
            {
                "type": x.substr(0, x.indexOf(":")),
                "value": x.substr(x.indexOf(":") + 1)
            } :
            {
                "type": "",
                "value": ""
            })
        if (this.state.federatesWith.length !== 0) {
            federatedWithList = this.state.federatesWith.split(',').map((x) => x.trim())
        }
        if (this.state.dnsNames.length !== 0) {
            dnsNamesWithList = this.state.dnsNames.split(',').map((x) => x.trim())
        }
        if (entriesToUpload[selectedEntryId].spiffe_id === undefined) {
            entriesToUpload[selectedEntryId]["spiffe_id"] = { trust_domain: "", path: "" };
        }
        entriesToUpload[selectedEntryId]["spiffe_id"]["trust_domain"] = this.state.spiffeIdTrustDomain;
        entriesToUpload[selectedEntryId]["spiffe_id"]["path"] = this.state.spiffeIdPath;
        if (entriesToUpload[selectedEntryId].parent_id === undefined) {
            entriesToUpload[selectedEntryId]["parent_id"] = { trust_domain: "", path: "" };
        }
        entriesToUpload[selectedEntryId]["parent_id"]["trust_domain"] = this.state.parentIdTrustDomain;
        entriesToUpload[selectedEntryId]["parent_id"]["path"] = this.state.parentIdPath;
        entriesToUpload[selectedEntryId]["selectors"] = selectorEntries;
        if (this.state.jwt_svid_ttl !== undefined) {
            entriesToUpload[selectedEntryId]["jwt_svid_ttl"] = this.state.jwt_svid_ttl;
        }
        if (this.state.x509_svid_ttl !== undefined) {
            entriesToUpload[selectedEntryId]["x509_svid_ttl"] = this.state.x509_svid_ttl;
        }
        if (this.state.expiresAt !== undefined) {
            entriesToUpload[selectedEntryId]["expires_at"] = this.state.expiresAt;
        }
        if (federatedWithList !== undefined) {
            entriesToUpload[selectedEntryId]["federates_with"] = federatedWithList;
        }
        if (this.state.dnsNames.length !== 0) {
            entriesToUpload[selectedEntryId]["dns_names"] = dnsNamesWithList;
        }
        if (this.state.adminFlag !== undefined) {
            entriesToUpload[selectedEntryId]["admin"] = this.state.adminFlag;
        }
        if (this.state.downstream !== undefined) {
            entriesToUpload[selectedEntryId]["downstream"] = this.state.downstream;
        }
        var updatedIds = this.state.newEntriesIds;
        updatedIds[selectedEntryId]["spiffeId"] = this.SpiffeHelper.getEntrySpiffeid(entriesToUpload[selectedEntryId]);
        this.setState({
            selectedEntryId: -1,
            newEntriesIds: updatedIds,
            uploadedEntries: entriesToUpload,
            entrySelected: false,
            parentId: "",
            spiffeId: "",
            selectorsList: "",
            x509_svid_ttl: 0,
            jwt_svid_ttl: 0,
            expiresAt: 0,
            federatesWith: "",
            dnsNames: "",
            adminFlag: false,
            downstream: false,
        })
        alert("Entry " + (selectedEntryId + 1).toString() + " Updated!");
        return true;
    }

    passiveModal() {
        return true;
    }

    onChangeSpiffeIdTrustDomain(e: { target: { value: string; }; }) {
        var value = e.target.value;
        this.setState({
            spiffeIdTrustDomain: value,
        });
    }

    onChangeSpiffeIdPath(e: { target: { value: string; }; }) {
        var value = e.target.value;
        this.setState({
            spiffeIdPath: value,
        });
    }

    onChangeParentIdTrustDomain(e: { target: { value: string; }; }) {
        var value = e.target.value;
        this.setState({
            parentIdTrustDomain: value,
        });
    }

    onChangeParentIdPath(e: { target: { value: string; }; }) {
        var value = e.target.value;
        this.setState({
            parentIdPath: value,
        });
    }

    onChangeSelectors(e: { target: { value: string; }; }) {
        var value = e.target.value;
        this.setState({
            selectorsList: value,
        });
    }

    // TODO(mamy-CS): e - any for now will be explicitly typed
    onChangeJwtTtl(e: any): void {
        this.setState({
            jwt_svid_ttl: Number(e.target.value)
        });
    }

    // TODO(mamy-CS): e - any for now will be explicitly typed
    onChangex509Ttl(e: any): void {
        this.setState({
            x509_svid_ttl: Number(e.target.value)
        });
    }

    // TODO(mamy-CS): e - any for now will be explicitly typed
    onChangeExpiresAt(e: any): void {
        this.setState({
            expiresAt: Number(e.target.value)
        });
    }

    onChangeDnsNames(e: { target: { value: string; }; } | undefined) {
        if (e === undefined) {
            return;
        }
        var sid = e.target.value;
        this.setState({
            dnsNames: sid,
        });
    }

    onChangeFederatesWith(e: { target: { value: string; }; } | undefined) {
        if (e === undefined) {
            return;
        }
        var sid = e.target.value;
        this.setState({
            federatesWith: sid,
        });
    }

    onChangeAdminFlag = (selected: boolean) => {
        var sid = selected;
        this.setState({
            adminFlag: sid,
        });
    }
    onChangeDownStream = (selected: boolean) => {
        var sid = selected;
        this.setState({
            downstream: sid,
        });
    }

    handleModalSubmit = () => {
        this.setState({
            parentId: "",
            spiffeId: "",
            selectorsList: "",
            x509_svid_ttl: 0,
            jwt_svid_ttl: 0,
            expiresAt: 0,
            federatesWith: "",
            dnsNames: "",
            adminFlag: false,
            downstream: false,
            entrySelected: false,
        })
        return true;
    }

    parseSpiffeId(sid: string): [boolean, string, string] {
        if (sid.startsWith('spiffe://')) {
            var sub = sid.substr("spiffe://".length)
            var sp = sub.indexOf("/")
            if (sp > 0 && sp !== sub.length - 1) {
                var trustDomain = sub.substr(0, sp);
                var path = sub.substr(sp);
                return [true, trustDomain, path];
            }
        }
        return [false, "", ""];
    }

    onChangeParentId = (selected: { selectedItem: string; }): void => {
        var prefix = this.state.prefix,
            sid = selected.selectedItem;
        const [validSpiffeId, trustDomain, path] = this.parseSpiffeId(sid)
        var spiffeIdPrefix = prefix + trustDomain;
        if (validSpiffeId) {
            this.setState({
                parentIdTrustDomain: trustDomain,
                parentIdPath: path,
                spiffeId: spiffeIdPrefix + this.state.spiffeIdPath,
                parentId: sid,
                spiffeIdPrefix: spiffeIdPrefix,
                spiffeIdTrustDomain: trustDomain,
            });
            return
        }
        // else invalid spiffe ID
        this.setState({
            parentIdTrustDomain: "",
            parentIdPath: "",
        });
        return
    }

    onChangeParentIdInput(e: React.ChangeEvent<HTMLInputElement>) {
        var sid = e.target.value;
        this.setState({
            parentId: sid
        })
        if (sid.length === 0) {
            this.setState({
                parentIdTrustDomain: "",
                parentIdPath: "",
            });
            return
        }
        const [validParentId, trustDomain, path] = this.parseSpiffeId(sid)
        if (validParentId) {
            this.setState({
                parentIdTrustDomain: trustDomain,
                parentIdPath: path,
            });
            return
        }
        // else invalid parent ID
        this.setState({
            parentIdTrustDomain: "",
            parentIdPath: "",
        });
        return
    }

    onChangeSpiffeId(e: { target: { value: string; }; }): void {
        var sid = e.target.value;
        this.setState({
            spiffeId: sid
        })
        if (sid.length === 0) {
            this.setState({
                spiffeIdTrustDomain: "",
                spiffeIdPath: "",
            });
            return
        }

        const [validSpiffeId, trustDomain, path] = this.parseSpiffeId(sid)
        if (validSpiffeId) {
            this.setState({
                spiffeIdTrustDomain: trustDomain,
                spiffeIdPath: path,
            });
            return
        }
        // else invalid spiffe ID
        this.setState({
            spiffeIdTrustDomain: "",
            spiffeIdPath: "",
        });
        return
    }

    render() {
        const newEntryFormatLink = "https://github.com/mamy-CS/tornjak-public/blob/create-entries-yaml/docs/newEntry-json-format.md";
        const ParentIdList = this.props.ParentIdList;
        return (
            <div>
                {this.state.parseError &&
                    <div>
                        <ToastNotification className="toast-entry-creation-notification"
                            kind="error"
                            iconDescription="close notification"
                            subtitle={<span>Invalid JSON Format/ JSON File Empty. <NewEntryJsonFormatLink link={newEntryFormatLink} /></span>}
                            timeout={0}
                            title="New Entry JSON Format Notification"
                        />
                    </div>
                }
                <div>
                    <h6>Choose your local file:</h6>
                    <br></br>
                    <p style={{ fontSize: 15 }}>only .json files </p>
                    <NewEntryJsonFormatLink link={newEntryFormatLink} />
                </div>
                <div>
                    <FileUploader
                        accept={[
                            '.json'
                        ]}
                        size="small"
                        buttonKind="tertiary"
                        buttonLabel="Upload file"
                        filenameStatus="edit"
                        iconDescription="Clear file"
                        onChange={this.handleChange}
                    />
                </div>
                {this.state.isEntriesLoaded && !this.state.parseError &&
                    <div>
                        <br></br>
                        <div>
                            {this.state.isEntriesLoaded && this.state.newEntriesLoaded &&
                                <div>
                                    <ToastNotification className="toast-entry-creation-notification"
                                        kind="info"
                                        iconDescription="close notification"
                                        subtitle={
                                            <span>
                                                <br></br>
                                                <div>
                                                    {this.state.newEntriesIds.length === 0 &&
                                                        <div>
                                                            {this.state.newEntriesIds.length} Entries Loaded/ No Entries Found in File
                                                        </div>
                                                    }
                                                    {this.state.newEntriesIds.length === 1 &&
                                                        <div>
                                                            {this.state.newEntriesIds.length} Entry Loaded from File
                                                        </div>
                                                    }
                                                    {this.state.newEntriesIds.length > 1 &&
                                                        <div>
                                                            {this.state.newEntriesIds.length} Entries Loaded from File
                                                        </div>
                                                    }
                                                </div>
                                            </span>}
                                        timeout={60000}
                                        title="Entries Upload Notification"
                                    />
                                </div>
                            }
                        </div>
                        <div className="view_entries_yaml_button">
                            <ModalWrapper
                                passiveModal={true}
                                size='lg'
                                triggerButtonKind="ghost"
                                buttonTriggerText="View Uploaded Entries"
                                modalHeading="Entries JSON"
                                modalLabel="View Uploaded Entries"
                                handleSubmit={this.passiveModal}
                            >
                                <pre className="yaml_view_modal_json">{JSON.stringify(this.state.uploadedEntries, null, ' ')}</pre>
                            </ModalWrapper>
                        </div>
                        <div className="edit_entries_button">
                            <ModalWrapper
                                size='lg'
                                triggerButtonKind="ghost"
                                buttonTriggerText="Edit Uploaded Entries"
                                handleSubmit={this.applyEditToEntry}
                                //shouldCloseAfterSubmit={true}
                                modalHeading="Entries Editor"
                                modalLabel="Edit Uploaded Entries"
                                primaryButtonText="Step 3. Apply"
                                secondaryButtonText="Exit"
                            >
                                <div className='edit-entry-container'>
                                    <div className="entries-list-container">
                                        <fieldset>
                                            <legend className="modal_Entry_list_title">Step 1. SELECT ENTRY</legend>
                                            {this.state.newEntriesIds.map((entryId, index) => (
                                                <div key={index}>
                                                    {/* eslint-disable-next-line */}
                                                    {index === this.state.selectedEntryId &&
                                                        <div>
                                                            <Link
                                                                className='selected-entry'
                                                                id={entryId.spiffeId}
                                                                href="#"
                                                                renderIcon={NextOutline}
                                                                visited={false}
                                                                inline
                                                                onClick={(e) => {
                                                                    this.setSelectedEntriesIds(index, index, undefined);
                                                                    e.preventDefault();
                                                                }}
                                                            >
                                                                {(index + 1).toString() + ". " + entryId.spiffeId}
                                                            </Link>
                                                        </div>
                                                    }
                                                    {index !== this.state.selectedEntryId &&
                                                        <div>
                                                            <Link
                                                                id={entryId.spiffeId}
                                                                href="#"
                                                                renderIcon={NextOutline}
                                                                onClick={(e) => {
                                                                    this.setSelectedEntriesIds(index, index, undefined);
                                                                    e.preventDefault();
                                                                }}
                                                            >
                                                                {(index + 1).toString() + ". " + entryId.spiffeId}
                                                            </Link>
                                                        </div>
                                                    }
                                                </div>
                                            ))}
                                        </fieldset>
                                        <br></br>
                                        <legend className="additional_info_entries_list">[Select Entry to Edit]</legend>
                                    </div>
                                    <div className="entries-edit-form">
                                        <p style={{
                                            fontSize: 15,
                                            fontWeight: "bold",
                                            textDecoration: "underline",
                                            marginBottom: 10
                                        }}>Step 2. EDIT ENTRY</p>
                                        <div className="parentId-drop-down-yaml" data-test="parentId-drop-down-yaml">
                                            {!this.state.entrySelected &&
                                                <div>
                                                    <Dropdown
                                                        disabled={true}
                                                        aria-required="true"
                                                        ariaLabel="parentId-drop-down"
                                                        id="parentId-drop-down"
                                                        items={ParentIdList}
                                                        label="Select Entry to Enable Dropdown"
                                                        titleText="Parent ID"
                                                        onChange={this.onChangeParentId}
                                                    />
                                                </div>
                                            }
                                            {this.state.entrySelected &&
                                                <div>
                                                    <Dropdown
                                                        aria-required="true"
                                                        ariaLabel="parentId-drop-down"
                                                        id="parentId-drop-down"
                                                        items={ParentIdList}
                                                        label="Select Parent ID"
                                                        titleText="Parent ID - [*optional Selection]"
                                                        onChange={this.onChangeParentId}
                                                    />
                                                    <p className="parentId-helper">e.g. select if no Parent ID provided</p>
                                                </div>
                                            }
                                        </div>
                                        <div className="parentId-input-field" data-test="parentId-input-field">
                                            <TextInput
                                                aria-required="true"
                                                helperText="e.g. spiffe://example.org/agent/myagent1 - For node entries, specify spiffe server as parent - spiffe://example.org/spire/server"
                                                id="parentIdInputField"
                                                invalidText="A valid value is required - refer to helper text below"
                                                labelText="PARENT ID [*required]"
                                                placeholder="Enter PARENT ID"
                                                value={this.state.parentId}
                                                onChange={(e) => {this.onChangeParentIdInput(e)}}
                                            />
                                        </div>
                                        <div className="spiffeId-input-field" data-test="spiffeId-input-field">
                                            <TextInput
                                                aria-required="true"
                                                helperText="e.g. spiffe://example.org/sample/spiffe/id"
                                                id="spiffeIdInputField"
                                                invalidText="A valid value is required - refer to helper text below"
                                                labelText="SPIFFE ID [*required]"
                                                placeholder="Enter SPIFFE ID"
                                                value={this.state.spiffeId}
                                                onChange={(e) => {
                                                    const input = e.target.value
                                                    e.target.value = this.state.spiffeIdPrefix + input.substr(this.state.spiffeIdPrefix.length);
                                                    this.onChangeSpiffeId(e);
                                                }}
                                            />
                                        </div>
                                        <TextArea
                                            cols={50}
                                            helperText="e.g. k8s_sat:cluster:demo-cluster,..."
                                            id="selectors-textArea"
                                            invalidText="A valid value is required"
                                            labelText="Selectors"
                                            placeholder="Enter Selectors"
                                            value={this.state.selectorsList}
                                            rows={8}
                                            onChange={this.onChangeSelectors}
                                        />
                                        <br></br>
                                        <div className="advanced">
                                            <fieldset className="bx--fieldset">
                                                <legend className="bx--label">Advanced</legend>
                                                <div className="ttl-input" data-test="ttl-input">
                                                    <NumberInput
                                                        helperText="x509 SVID Ttl for identities issued for this entry (In seconds) Overrides JWT TTL if set"
                                                        id="ttl-input"
                                                        invalidText="Number is not valid"
                                                        label="x509 Time to Leave (Ttl)"
                                                        //max={100}
                                                        min={0}
                                                        step={1}
                                                        value={this.state.x509_svid_ttl}
                                                        onChange={this.onChangex509Ttl}
                                                    />
                                                </div>
                                                <div className="ttl-input" data-test="ttl-input">
                                                    <NumberInput
                                                        helperText="JWT SVID ttl for identities issued for this entry (In seconds) "
                                                        id="ttl-input"
                                                        invalidText="Number is not valid"
                                                        label="JWT Time to Leave (Ttl)"
                                                        //max={100}
                                                        min={0}
                                                        step={1}
                                                        value={this.state.jwt_svid_ttl}
                                                        onChange={this.onChangeJwtTtl}
                                                    />
                                                </div>
                                                <div className="expiresAt-input" data-test="expiresAt-input">
                                                    <NumberInput
                                                        helperText="Entry expires at (seconds since Unix epoch)"
                                                        id="expiresAt-input"
                                                        invalidText="Number is not valid"
                                                        label="Expires At"
                                                        //max={100}
                                                        min={0}
                                                        step={1}
                                                        value={this.state.expiresAt}
                                                        onChange={this.onChangeExpiresAt}
                                                    />
                                                </div>
                                                <div className="federates-with-input-field-yaml" data-test="federates-with-input-field">
                                                    <TextInput
                                                        helperText="e.g. example.org,abc.com (Separated By Commas)"
                                                        id="federates-with-input-field"
                                                        invalidText="A valid value is required - refer to helper text below"
                                                        labelText="Federates With"
                                                        placeholder="Enter Names of trust domains the identity described by this entry federates with"
                                                        value={this.state.federatesWith}
                                                        onChange={this.onChangeFederatesWith}
                                                    />
                                                </div>
                                                <div className="dnsnames-input-field-yaml" data-test="dnsnames-input-field">
                                                    <TextInput
                                                        helperText="e.g. example.org,abc.com (Separated By Commas)"
                                                        id="dnsnames-input-field"
                                                        invalidText="A valid value is required - refer to helper text below"
                                                        labelText="DNS Names"
                                                        placeholder="Enter DNS Names associated with the identity described by this entry"
                                                        value={this.state.dnsNames}
                                                        onChange={this.onChangeDnsNames}
                                                    />
                                                </div>
                                                <div className="admin-flag-checkbox" data-test="admin-flag-checkbox">
                                                    <Checkbox
                                                        labelText="Admin Flag"
                                                        id="admin-flag"
                                                        checked={this.state.adminFlag}
                                                        onChange={this.onChangeAdminFlag}
                                                    />
                                                </div>
                                                <div className="down-stream-checkbox" data-test="down-stream-checkbox">
                                                    <Checkbox
                                                        labelText="Down Stream"
                                                        id="down-steam"
                                                        checked={this.state.downstream}
                                                        onChange={this.onChangeDownStream}
                                                    />
                                                </div>
                                            </fieldset>
                                        </div>
                                    </div>
                                </div>
                            </ModalWrapper>
                        </div>
                    </div>
                }
            </div>
        )

    }

}

const mapStateToProps = (state: RootState) => ({
    globalNewEntries: state.entries.globalNewEntries,
    globalAgentsList: state.agents.globalAgentsList,
})

export default connect(
    mapStateToProps,
    { newEntriesUpdateFunc }
)(CreateEntryJson)

//export { CreateEntryJson };