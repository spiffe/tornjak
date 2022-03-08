import React, { Component } from 'react';
import { FileUploader, ToastNotification } from 'carbon-components-react';
//import * as fs from 'fs';
import { Launch16 } from '@carbon/icons-react';
import { connect } from 'react-redux';
//import { safeLoadAll } from 'js-yaml'
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
        this.state = {
            parseError: false
        }
    }

    componentDidMount() {

    }

    componentDidUpdate(prevProps, prevState) {
    }

    handleChange(e) {
        this.setState({ parseError: false }) // reset invalid notification toast
        var yamlFile = e.target.files[0]; // yaml File List of objects
        var fileReader = new FileReader();
        fileReader.addEventListener("load", () => {
            var result = fileReader.result;
            console.log(result)
            try {
                var parsedData = JSON.parse(result);
                console.log(parsedData);
                this.setState({ parseError: false })
                this.props.newEntriesUpdateFunc(parsedData.entries[0]);
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

    render() {
        const newEntryFormatLink = "https://github.com/mamy-CS/tornjak-public/blob/adding-typescript-entries-clusters-part2/docs/plan.md";
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