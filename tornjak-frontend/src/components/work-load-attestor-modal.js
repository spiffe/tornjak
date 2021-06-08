import React from "react";
import { ModalWrapper, Dropdown, TextArea } from "carbon-components-react";
import { connect } from 'react-redux';
import IsManager from './is_manager';
import TornjakApi from './tornjak-api-helpers';
import {
    agentsListUpdateFunc,
    agentworkloadSelectorInfoFunc,
} from 'redux/actions';

class WorkLoadAttestor extends React.Component {
    constructor(props) {
        super(props);
        this.TornjakApi = new TornjakApi();
        this.state = {
            workloadPlugin: "",
            selectorsList: "",
            selectors: "",
            wLoadAttdata: [{}],
            agentId: "",
            agentSpiffeId: "",
        };
        this.onChangeWorkloadPlugin = this.onChangeWorkloadPlugin.bind(this);
        this.prepareAgentData = this.prepareAgentData.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
    }

    componentDidMount() {
        this.prepareAgentData();
        if (IsManager) {
            this.TornjakApi.refreshSelectorsState(this.props.globalServerSelected, this.props.agentworkloadSelectorInfoFunc);
        }
        else {
            this.TornjakApi.refreshLocalSelectorsState(this.props.agentworkloadSelectorInfoFunc, this.props.globalServerSelected);
        }
    }
    componentDidUpdate(prevProps, prevState) {
    }

    prepareAgentData() {
        const { spiffeid } = this.props;
        this.setState({
            agentSpiffeId: spiffeid,
        })
    }

    handleSubmit = () => {
        var wLoadAttdata = {
            "spiffeid": this.state.agentSpiffeId,
            "plugin": this.state.workloadPlugin,
        };
        if (IsManager) {
            this.TornjakApi.registerSelectors(this.props.globalServerSelected, wLoadAttdata, this.TornjakApi.refreshSelectorsState, this.props.agentworkloadSelectorInfoFunc);
        } else {
            this.TornjakApi.registerLocalSelectors(wLoadAttdata, this.TornjakApi.refreshLocalSelectorsState, this.props.agentworkloadSelectorInfoFunc);
        }
        return true;
    };

    onChangeWorkloadPlugin = selected => {
        var selectors = "";
        var sid = selected.selectedItem.label;
        var selectorsObject = this.props.globalWorkloadSelectorInfo[sid];
        for (let i = 0; i < selectorsObject.length; i++) {
            if (i !== sid.length - 1) {
                selectors = selectors + selectorsObject[i].label + ":\n";
            }
            else {
                selectors = selectors + selectorsObject[i].label + ":"
            }
        }
        this.setState({
            workloadPlugin: sid,
            selectorsList: selectors,
        })
    }

    render() {
        //TODO: dynamically populated pluginlist
        const PluginList =
            [
                {
                    id: "1",
                    label: "Docker",
                },
                {
                    id: "2",
                    label: "Kubernetes",
                },
                {
                    id: "3",
                    label: "Unix",
                },
            ];
        return (
            <ModalWrapper
                triggerButtonKind="ghost"
                buttonTriggerText="Add WorkLoad Attestor Info"
                primaryButtonText="Save & Add"
                handleSubmit={this.handleSubmit}
                shouldCloseAfterSubmit={true}
            >
                <p> Define WorkLoad Attestor Information: </p>
                <br />
                <div className="parentId-drop-down">
                    <Dropdown
                        ariaLabel="workload-attestor-kind-drop-down"
                        id="workload-attestor-kind-drop-down"
                        items={PluginList}
                        label="Select WorkLoad Attestor Plugin"
                        titleText="WorkLoad Attestor Plugin"
                        onChange={this.onChangeWorkloadPlugin}
                    />
                </div>
                <div className="selectors-textArea">
                    <TextArea
                        cols={50}
                        helperText="i.e. docker:label:,..."
                        id="selectors-textArea"
                        invalidText="A valid value is required"
                        labelText="Workload Selectors"
                        placeholder="Select Workload Attestor Plugin from above and selectors will be populated here - Refer to Workload Attestor Plugin"
                        defaultValue={this.state.selectorsList}
                        rows={8}
                        disabled
                    />
                </div>
            </ModalWrapper>
        );
    }
}

const mapStateToProps = (state) => ({
    globalServerSelected: state.servers.globalServerSelected,
    globalAgentsList: state.agents.globalAgentsList,
    globalWorkloadSelectorInfo: state.servers.globalWorkloadSelectorInfo,
})

export default connect(
    mapStateToProps,
    { agentsListUpdateFunc, agentworkloadSelectorInfoFunc }
)(WorkLoadAttestor)
