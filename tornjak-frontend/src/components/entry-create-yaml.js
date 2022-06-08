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
import {
    Button,
} from '@material-ui/core';
import { Launch16, NextOutline16 } from '@carbon/icons-react';
import { connect } from 'react-redux';
// import axios from 'axios';
// import IsManager from './is_manager';
import TornjakApi from './tornjak-api-helpers';
import './style.css';
import SpiffeHelper from './spiffe-helper';
import {
    newEntriesUpdateFunc
} from 'redux/actions';
// import {
//     serverSelectedFunc,
//     selectorInfoFunc,
//     agentsListUpdateFunc,
//     entriesListUpdateFunc,
//     tornjakMessageFunc,
//     tornjakServerInfoUpdateFunc,
//     serverInfoUpdateFunc,
//     agentworkloadSelectorInfoFunc
// } from 'redux/actions';
// import {
//     EntriesList,
//     AgentsList,
//     AgentsWorkLoadAttestorInfo,
//     ServerInfo,
//     TornjakServerInfo,
// } from './types';
//import { RootState } from 'redux/reducers';

const NewEntryYamlFormatLink = (props) => (
    <div>
        <a rel="noopener noreferrer" href={props.link} target="_blank">(Click to see new entry yaml format)</a>
        <a rel="noopener noreferrer" href={props.link} target="_blank">{<Launch16 />}</a>
    </div>
)
class CreateEntryYaml extends Component {
    constructor(props) {
        super(props);
        this.TornjakApi = new TornjakApi(props);
        this.SpiffeHelper = new SpiffeHelper(props);
        this.handleChange = this.handleChange.bind(this);
        this.setSelectedEntriesIds = this.setSelectedEntriesIds.bind(this);
        this.onChangeSelectors = this.onChangeSelectors.bind(this);
        this.onChangeTtl = this.onChangeTtl.bind(this);
        this.onChangeExpiresAt = this.onChangeExpiresAt.bind(this);
        this.onChangeFederatesWith = this.onChangeFederatesWith.bind(this);
        this.onChangeDnsNames = this.onChangeDnsNames.bind(this);
        this.onChangeAdminFlag = this.onChangeAdminFlag.bind(this);
        this.onChangeDownStream = this.onChangeDownStream.bind(this);
        this.handleModalSubmit = this.handleModalSubmit.bind(this);
        // this.onChangeSpiffeId = this.onChangeSpiffeId.bind(this);
        this.onChangeParentId = this.onChangeParentId.bind(this);

        this.state = {
            prefix: "spiffe://",
            parseError: false,
            isEntriesLoaded: false,
            newEntriesIds: [],
            newEntrySelected: [],
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
            ttl: 0,
            expiresAt: 0,
            federatesWith: "",
            dnsNames: "",
            adminFlag: false,
            downstream: false,
            entrySelected: false,
            spiffeIdPrefix: "",
        }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState) {
        if (prevState.globalAgentsList !== this.state.globalAgentsList) {
            this.props.newEntriesUpdateFunc(this.state.uploadedEntries);
        }
    }

    handleChange(e) {
        var idx = 0;
        let localNewEntriesIds = [];
        this.setState({
            parseError: false, // reset invalid notification toast
            isEntriesLoaded: true
        })
        var yamlFile = e.target.files[0]; // yaml File List of objects
        var fileReader = new FileReader();
        fileReader.addEventListener("load", () => {
            var result = fileReader.result;
            console.log(result)
            try {
                var parsedData = JSON.parse(result);
                this.props.newEntriesUpdateFunc(parsedData.entries);
                for (let i = 0; i < parsedData.entries.length; i++) {
                    localNewEntriesIds[idx] = [];
                    localNewEntriesIds[idx]["spiffeId"] = this.SpiffeHelper.getEntrySpiffeid(parsedData.entries[i]);
                    if(localNewEntriesIds[idx]["spiffeId"] === "") {
                        localNewEntriesIds[idx]["spiffeId"] = parsedData.entries[i].spiffe_id.path
                    }
                    idx++;
                }
                this.setState({
                    parseError: false,
                    newEntriesIds: localNewEntriesIds,
                    uploadedEntries: parsedData.entries,
                })

            } catch (e) {
                console.log(e)
                this.setState({ parseError: true })
                return false;
            }
            return true;
        }, false);

        if (yamlFile) {
            fileReader.readAsText(yamlFile);
        }
    }

    setSelectedEntriesIds(e, id) {
        var prefix = this.state.prefix, localNewEntry = this.state.uploadedEntries[id],
            spiffeId_trustDomain = "",
            spiffeId_path = "",
            spiffeId = "",
            parentId_trustDomain = "",
            parentId_path = "",
            parentId = "",
            selectorsWithNewline = "",
            federates_with = "",
            dns_names = "";
            

        if (localNewEntry.spiffe_id !== undefined) {
            spiffeId_trustDomain = localNewEntry.spiffe_id.trust_domain;
            spiffeId_path = localNewEntry.spiffe_id.path;
            if(localNewEntry.spiffe_id.trust_domain !== undefined && localNewEntry.spiffe_id.path !== undefined) {
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
            if(localNewEntry.parent_id.trust_domain !== undefined && localNewEntry.parent_id.path !== undefined) {
                parentId = prefix + localNewEntry.parent_id.trust_domain + localNewEntry.parent_id.path;
            } else if (localNewEntry.parent_id.trust_domain !== undefined) {
                parentId = prefix + localNewEntry.parent_id.trust_domain;
            } else if (localNewEntry.parent_id.path !== undefined) {
                parentId = localNewEntry.parent_id.path;
            }
        }
        if (localNewEntry.selectors !== undefined && localNewEntry.selectors !== "" && localNewEntry.selectors[0] !== null) {
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
            ttl: localNewEntry.ttl,
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
            alert("Please Select an Entry From the List, and make Necessary Changes!");
            return
        }
        if(this.state.spiffeIdTrustDomain === undefined || this.state.spiffeIdTrustDomain === "") {
            alert("SPIFFE ID Trust Domain Empty/ Invalid, Please Input Trust Domain!");
            return
        }
            
        if(this.state.spiffeIdPath === undefined || this.state.spiffeIdPath === "") {
            alert("SPIFFE ID Path Empty/ Invalid, Please Input Path!");
            return
        }
        console.log(this.state.parentIdTrustDomain)
        if(this.state.parentIdTrustDomain === undefined || this.state.parentIdTrustDomain === "") {
            alert("Parent ID Trust Domain Empty/ Invalid, Please Input Trust Domain!");
            return
        }
            
        if(this.state.parentIdPath === undefined || this.state.parentIdPath === "") {
            alert("Parent ID Path Empty/ Invalid, Please Input Path!");
            return
        }
        if (this.state.selectorsList.length === 0) {
            alert("Selectors List Empty/ Invalid, Please Input Selectors!");
            return
        }
        var entriesToUpload = this.state.uploadedEntries,
            selectedEntryId = this.state.selectedEntryId,
            selectorStrings = [],
            selectorEntries = [],
            federatedWithList = [],
            dnsNamesWithList = [];

        if (this.state.selectorsList.length !== 0) {
            selectorStrings = this.state.selectorsList.split('\n').map(x => x.trim())
        }
        selectorEntries = selectorStrings.filter(String).map(x => x.indexOf(":") > 0 ?
            {
                "type": x.substr(0, x.indexOf(":")),
                "value": x.substr(x.indexOf(":") + 1)
            } : null)
        if (this.state.federatesWith.length !== 0) {
            federatedWithList = this.state.federatesWith.split(',').map((x) => x.trim())
        }
        if (this.state.dnsNames.length !== 0) {
            dnsNamesWithList = this.state.dnsNames.split(',').map((x) => x.trim())
        }
        if(entriesToUpload[selectedEntryId].spiffe_id === undefined) {
            entriesToUpload[selectedEntryId]["spiffe_id"] = {};
        }
        entriesToUpload[selectedEntryId]["spiffe_id"]["trust_domain"] = this.state.spiffeIdTrustDomain;
        entriesToUpload[selectedEntryId]["spiffe_id"]["path"] = this.state.spiffeIdPath;
        if(entriesToUpload[selectedEntryId].parent_id === undefined) {
            entriesToUpload[selectedEntryId]["parent_id"] = {};
        }
        entriesToUpload[selectedEntryId]["parent_id"]["trust_domain"] = this.state.parentIdTrustDomain;
        entriesToUpload[selectedEntryId]["parent_id"]["path"] = this.state.parentIdPath;
        entriesToUpload[selectedEntryId]["selectors"] = selectorEntries;
        if(this.state.ttl !== undefined) {
            entriesToUpload[selectedEntryId]["ttl"] = this.state.ttl;
        }
        if(this.state.ttl !== undefined) {
            entriesToUpload[selectedEntryId]["expires_at"] = this.state.expiresAt;
        }
        if(this.state.expiresAt !== undefined) {
            entriesToUpload[selectedEntryId]["federates_with"] = federatedWithList;
        }
        if(this.state.dnsNames.length !== 0) {
            entriesToUpload[selectedEntryId]["dns_names"] = dnsNamesWithList;
        }
        if(this.state.adminFlag !== undefined) {
            entriesToUpload[selectedEntryId]["admin"] = this.state.adminFlag;
        }
        if(this.state.downstream !== undefined) {
            entriesToUpload[selectedEntryId]["downstream"] = this.state.downstream;
        }
        var updatedIds = this.state.newEntriesIds;
        updatedIds[selectedEntryId]["spiffeId"] = this.SpiffeHelper.getEntrySpiffeid(entriesToUpload[selectedEntryId]);
        this.setState({
            newEntriesIds: updatedIds,
            uploadedEntries: entriesToUpload
        })
        alert("Entry " + (selectedEntryId+1).toString() + " Updated!");
        //this.props.newEntriesUpdateFunc(entriesToUpload);
    }

    onChangeSpiffeIdTrustDomain(e) {
        var value = e.target.value;
        this.setState({
            spiffeIdTrustDomain: value,
        });
    }

    onChangeSpiffeIdPath(e) {
        var value = e.target.value;
        this.setState({
            spiffeIdPath: value,
        });
    }

    onChangeParentIdTrustDomain(e) {
        var value = e.target.value;
        this.setState({
            parentIdTrustDomain: value,
        });
    }

    onChangeParentIdPath(e) {
        var value = e.target.value;
        this.setState({
            parentIdPath: value,
        });
    }

    onChangeSelectors(e) {
        var value = e.target.value;
        this.setState({
            selectorsList: value,
        });
    }

    onChangeTtl(e) {
        this.setState({
            ttl: Number(e.target.value)
        });
    }

    onChangeExpiresAt(e) {
        this.setState({
            expiresAt: Number(e.target.value)
        });
    }

    onChangeDnsNames(e) {
        if (e === undefined) {
            return;
        }
        var sid = e.target.value;
        this.setState({
            dnsNames: sid,
        });
    }

    onChangeFederatesWith(e) {
        if (e === undefined) {
            return;
        }
        var sid = e.target.value;
        this.setState({
            federatesWith: sid,
        });
    }

    onChangeAdminFlag = (selected) => {
        var sid = selected;
        this.setState({
            adminFlag: sid,
        });
    }
    onChangeDownStream = (selected) => {
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
            ttl: 0,
            expiresAt: 0,
            federatesWith: "",
            dnsNames: "",
            adminFlag: false,
            downstream: false,
            entrySelected: false,
        })
        return true;
    }

    parseSpiffeId(sid) {
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

    onChangeParentId = (selected) => {
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

    onChangeParentIdInput(e) {
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

    onChangeSpiffeId(e) {
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
                            subtitle={<span>Invalid yaml Format/ yaml File Empty. <NewEntryYamlFormatLink link={newEntryFormatLink} /></span>}
                            timeout={0}
                            title="New Entry yaml Format Notification"
                        />
                    </div>
                }
                <div>
                    <FileUploader
                        accept={[
                            '.yaml'
                        ]}
                        size="small"
                        buttonKind="tertiary"
                        buttonLabel="Upload file"
                        filenameStatus="edit"
                        iconDescription="Clear file"
                        labelDescription={
                            <div>
                                <p style={{ fontSize: 15 }}>only .yaml files </p>
                                <NewEntryYamlFormatLink link={newEntryFormatLink} />
                            </div>}
                        labelTitle="Choose your local file:"
                        onChange={this.handleChange}
                    />
                </div>
                {this.state.isEntriesLoaded && !this.state.parseError &&
                    <div>
                        <br></br>
                        <h6
                            style={{
                                color: "green",
                                marginLeft: "1rem",
                            }}>[{this.state.newEntriesIds.length} Entries Loaded]</h6>
                        <div className="view_entries_yaml_button">
                            <ModalWrapper
                                passiveModal={true}
                                size='lg'
                                triggerButtonKind="ghost"
                                buttonTriggerText="View Entries Yaml"
                                modalHeading="Entries Yaml"
                                modalLabel="View Uploaded Entries"
                            >
                                <pre className="yaml_view_modal_json">{JSON.stringify(this.state.uploadedEntries, null, ' ')}</pre>
                            </ModalWrapper>
                        </div>
                        <div className="edit_entries_button">
                            <ModalWrapper
                                size='lg'
                                triggerButtonKind="ghost"
                                buttonTriggerText="Edit Uploaded Entries"
                                handleSubmit={this.handleModalSubmit}
                                shouldCloseAfterSubmit={true}
                                modalHeading="Entries Edit"
                                modalLabel="Edit Uploaded Entries"
                            >
                                <div className='edit-entry-container'>
                                    <div className="entries-list-container">
                                        <fieldset>
                                            <legend className="modal_Entry_list_title">UPLOADED ENTRIES</legend>
                                            {this.state.newEntriesIds.map((entryId, index) => (
                                                <div key={index}>
                                                    {/* eslint-disable-next-line */}
                                                    <Link
                                                        id={entryId.spiffeId}
                                                        href="#"
                                                        renderIcon={NextOutline16}
                                                        visited={false}
                                                        onClick={(e) => {
                                                            this.setSelectedEntriesIds(entryId, index);
                                                            e.preventDefault();
                                                        }}
                                                    >
                                                        {(index + 1).toString() + ". " + entryId.spiffeId}
                                                    </Link>
                                                </div>
                                            ))}
                                        </fieldset>
                                        <br></br>
                                        <legend className="additional_info_entries_list">[i.e. Select Entry to Populate Metadata to Free Form]</legend>
                                    </div>
                                    <div className="entries-edit-form">
                                        <div className="parentId-drop-down-yaml" data-test="parentId-drop-down-yaml">
                                            {!this.state.entrySelected &&
                                                <div>
                                                    <Dropdown
                                                        disabled="true"
                                                        aria-required="true"
                                                        ariaLabel="parentId-drop-down"
                                                        id="parentId-drop-down"
                                                        items={ParentIdList}
                                                        label="Select Entry to Enable Dropdown"
                                                        titleText="Parent ID - [*optional Selection]"
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
                                                    <p className="parentId-helper">i.e. select if no Parent ID provided/ to Edit</p>
                                                </div>
                                            }
                                        </div>
                                        <div className="parentId-input-field" data-test="parentId-input-field">
                                            <TextInput
                                                aria-required="true"
                                                helperText="i.e. spiffe://example.org/agent/myagent1 - For node entries, specify spiffe server as parent i.e. spiffe://example.org/spire/server"
                                                id="parentIdInputField"
                                                invalidText="A valid value is required - refer to helper text below"
                                                labelText="PARENT ID [*required]"
                                                placeholder="Enter PARENT ID"
                                                value={this.state.parentId}
                                                onChange={(e) => {
                                                    this.onChangeParentIdInput(e);
                                                }}
                                                required />
                                        </div>
                                        <div className="spiffeId-input-field" data-test="spiffeId-input-field">
                                            <TextInput
                                                aria-required="true"
                                                helperText="i.e. spiffe://example.org/sample/spiffe/id"
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
                                                required />
                                        </div>
                                        <TextArea
                                            cols={50}
                                            helperText="i.e. k8s_sat:cluster:demo-cluster,..."
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
                                                        helperText="Ttl for identities issued for this entry (In seconds)"
                                                        id="ttl-input"
                                                        invalidText="Number is not valid"
                                                        label="Time to Leave (Ttl)"
                                                        //max={100}
                                                        min={0}
                                                        step={1}
                                                        value={this.state.ttl}
                                                        onChange={this.onChangeTtl}
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
                                                        helperText="i.e. example.org,abc.com (Separated By Commas)"
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
                                                        helperText="i.e. example.org,abc.com (Separated By Commas)"
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
                                        <Button
                                            size="medium"
                                            color="primary"
                                            variant="contained"
                                            onClick={() => {
                                                this.applyEditToEntry();
                                            }}
                                        >
                                            Apply Edit
                                        </Button>
                                        <p>i.e. Apply Change to Selected Entry/ Entries</p>
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

const mapStateToProps = (state) => ({
    globalNewEntries: state.entries.globalNewEntries,
})

export default connect(
    mapStateToProps,
    { newEntriesUpdateFunc }
)(CreateEntryYaml)

//export { CreateEntryYaml };