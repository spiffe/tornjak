import React from "react";
import { ClusterEdit } from "../components/cluster-edit";
import { findByTestId, checkProps } from "../../Utils";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("Cluster Edit Component", () => {
  const mockFunc = jest.fn();
  const props = {
    clusterTypeList: [{}],
    agentsList: [{}],
    globalAgentsList: [{}],
    globalClustersList: [
      {
        agentsList: ["testAgent1", "testAgent2"],
        creationTime: "testTime",
        domainName: "testDomain",
        editedName: "testEditName",
        managedBy: "testManagedBy",
        name: "testOriginalClusterName",
        platformType: "testPlatformType",
      },
    ],
    globalServerSelected: "Test Global Server",
    globalErrorMessage: "Test Global Error Message",
    clustersListUpdateFunc: mockFunc,
    tornjakMessageFunc: mockFunc,
  };
  describe("Checking PropTypes", () => {
    test("Should NOT throw Warning/ Error", () => {
      const expectedInitialProps = props;
      const propsErr = checkProps(ClusterEdit, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders Cluster Edit Components", () => {
    let wrapper, store;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<ClusterEdit {...props} />);
    });

    test("Should Render Cluster Edit Component without Errors", () => {
      const clusterEditComp = findByTestId(wrapper, "cluster-edit");
      expect(clusterEditComp.length).toBe(1);
    });

    test("Should Render Cluster Edit Title without Errors", () => {
      const clusterEditTitle = findByTestId(wrapper, "cluster-edit-title");
      expect(clusterEditTitle.length).toBe(1);
    });

    test("Should Render Clusters DropDown without Errors", () => {
      const clustersDropDown = findByTestId(wrapper, "clusters-drop-down");
      expect(clustersDropDown.length).toBe(1);
    });

    test("Should Render Cluster Name Input without Errors", () => {
      const clusterNameInput = findByTestId(wrapper, "clustername-input-field");
      expect(clusterNameInput.length).toBe(1);
    });

    test("Should Render Cluster Type Selection without Errors", () => {
      const clusterTypeSelection = findByTestId(
        wrapper,
        "clustertype-drop-down"
      );
      expect(clusterTypeSelection.length).toBe(1);
    });

    test("Should NOT Render Cluster Type Manual Input Initially", () => {
      const clusterTypeManualInput = findByTestId(
        wrapper,
        "clustertype-manual-input-field"
      );
      expect(clusterTypeManualInput.length).toBe(0);
    });

    test("Should Render Cluster Domain Input without Errors", () => {
      const clusterDomainInput = findByTestId(
        wrapper,
        "cluster-domain-name-input-field"
      );
      expect(clusterDomainInput.length).toBe(1);
    });

    test("Should Render Cluster ManagedBy Input without Errors", () => {
      const clusterManagedByInput = findByTestId(
        wrapper,
        "cluster-managed-by-input-field"
      );
      expect(clusterManagedByInput.length).toBe(1);
    });

    test("Should Render Cluster Agents Selection without Errors", () => {
      const clusterAgentsSelection = findByTestId(
        wrapper,
        "agents-multiselect"
      );
      expect(clusterAgentsSelection.length).toBe(1);
    });

    test("Should Render Cluster Agents TextArea without Errors", () => {
      const clusterAgentsTextArea = findByTestId(wrapper, "selectors-textArea");
      expect(clusterAgentsTextArea.length).toBe(1);
    });

    test("Should Render Cluster Edit Button without Errors", () => {
      const clusterEditButton = findByTestId(wrapper, "cluster-edit-button");
      expect(clusterEditButton.length).toBe(1);
    });

    test("Should Render Success Message without Errors", () => {
      const successMessage = findByTestId(wrapper, "success-message");
      expect(successMessage.length).toBe(1);
    });

    test("Should Render Primary Alert without Errors", () => {
      const primaryAlert = findByTestId(wrapper, "alert-primary");
      expect(primaryAlert.length).toBe(1);
    });
  });

  describe("Test Cluster Edit Methods and their states", () => {
    let wrapper, store;
    let clusterEditClassInstance;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<ClusterEdit {...props} />);
      clusterEditClassInstance = wrapper.instance();
    });

    test("prepareClusterNameList Method SHOULD NOT UPDATE initial states if input not given", () => {
      clusterEditClassInstance.prepareClusterNameList();
      const initialState = {
        clusterNameList: [],
      };
      const newState = {
        clusterNameList: clusterEditClassInstance.state.clusterNameList,
      };
      expect(newState.clusterNameList).toStrictEqual(
        initialState.clusterNameList
      );
    });

    test("onChangeClusterNameList Method SHOULD NOT UPDATE initial states if input not given", () => {
      clusterEditClassInstance.onChangeClusterNameList();
      const initialState = {
        originalClusterName: "",
        clusterName: "",
        clusterType: "",
        clusterDomainName: "",
        clusterManagedBy: "",
        clusterAgentsList: [],
        agentsListDisplay: "Select Agents",
        assignedAgentsListDisplay: "",
        agentsListSelected: [],
      };
      const newState = {
        originalClusterName: clusterEditClassInstance.state.originalClusterName,
        clusterName: clusterEditClassInstance.state.clusterName,
        clusterType: clusterEditClassInstance.state.clusterType,
        clusterDomainName: clusterEditClassInstance.state.clusterDomainName,
        clusterManagedBy: clusterEditClassInstance.state.clusterManagedBy,
        clusterAgentsList: clusterEditClassInstance.state.clusterAgentsList,
        agentsListDisplay: clusterEditClassInstance.state.agentsListDisplay,
        assignedAgentsListDisplay:
          clusterEditClassInstance.state.assignedAgentsListDisplay,
        agentsListSelected: clusterEditClassInstance.state.agentsListSelected,
      };
      expect(newState.originalClusterName).toStrictEqual(
        initialState.originalClusterName
      );
      expect(newState.clusterName).toStrictEqual(initialState.clusterName);
      expect(newState.clusterType).toStrictEqual(initialState.clusterType);
      expect(newState.clusterDomainName).toStrictEqual(
        initialState.clusterDomainName
      );
      expect(newState.clusterManagedBy).toStrictEqual(
        initialState.clusterManagedBy
      );
      expect(newState.clusterAgentsList).toStrictEqual(
        initialState.clusterAgentsList
      );
      expect(newState.agentsListDisplay).toStrictEqual(
        initialState.agentsListDisplay
      );
      expect(newState.assignedAgentsListDisplay).toStrictEqual(
        initialState.assignedAgentsListDisplay
      );
      expect(newState.agentsListSelected).toStrictEqual(
        initialState.agentsListSelected
      );
    });

    test("onChangeClusterNameList Method SHOULD UPDATE states as expected", () => {
      const mockClusterName = { selectedItem: "testOriginalClusterName" };
      clusterEditClassInstance.onChangeClusterNameList(mockClusterName);
      const newState = {
        originalClusterName: clusterEditClassInstance.state.originalClusterName,
        clusterName: clusterEditClassInstance.state.clusterName,
        clusterType: clusterEditClassInstance.state.clusterType,
        clusterDomainName: clusterEditClassInstance.state.clusterDomainName,
        clusterManagedBy: clusterEditClassInstance.state.clusterManagedBy,
        clusterAgentsList: clusterEditClassInstance.state.clusterAgentsList,
        agentsListDisplay: clusterEditClassInstance.state.agentsListDisplay,
        assignedAgentsListDisplay:
          clusterEditClassInstance.state.assignedAgentsListDisplay,
        agentsListSelected: clusterEditClassInstance.state.agentsListSelected,
      };
      expect(newState.originalClusterName).toStrictEqual(
        mockClusterName.selectedItem
      );
      expect(newState.clusterName).toStrictEqual(mockClusterName.selectedItem);
      expect(newState.clusterType).toStrictEqual("testPlatformType");
      expect(newState.clusterDomainName).toStrictEqual("testDomain");
      expect(newState.clusterManagedBy).toStrictEqual("testManagedBy");
      expect(newState.clusterAgentsList).toStrictEqual([
        "testAgent1",
        "testAgent2",
      ]);
      expect(newState.agentsListDisplay).toStrictEqual("testAgent1,testAgent2");
      expect(newState.assignedAgentsListDisplay).toStrictEqual(
        "testAgent1\ntestAgent2"
      );
      expect(newState.agentsListSelected).toStrictEqual([
        { label: "testAgent1" },
        { label: "testAgent2" },
      ]);
    });

    test("onChangeClusterName Method SHOULD NOT UPDATE initial states if input not given", () => {
      clusterEditClassInstance.onChangeClusterName();
      const initialState = {
        clusterName: "",
      };
      const newState = {
        clusterName: clusterEditClassInstance.state.clusterName,
      };
      expect(newState.clusterName).toStrictEqual(initialState.clusterName);
    });

    test("onChangeClusterName Method SHOULD UPDATE states as expected", () => {
      const mockClusterName = { target: { value: "TestClusterName" } };
      clusterEditClassInstance.onChangeClusterName(mockClusterName);
      const newState = {
        clusterName: clusterEditClassInstance.state.clusterName,
      };
      expect(newState.clusterName).toStrictEqual(mockClusterName.target.value);
    });

    test("onChangeClusterType Method SHOULD NOT UPDATE initial states if input not given", () => {
      clusterEditClassInstance.onChangeClusterType();
      const initialState = {
        clusterTypeManualEntry: false,
        clusterType: "",
      };
      const newState = {
        clusterTypeManualEntry:
          clusterEditClassInstance.state.clusterTypeManualEntry,
        clusterType: clusterEditClassInstance.state.clusterType,
      };
      expect(newState.clusterTypeManualEntry).toStrictEqual(
        initialState.clusterTypeManualEntry
      );
      expect(newState.clusterType).toBe(initialState.clusterType);
    });

    test("onChangeClusterType Method SHOULD UPDATE states as expected", () => {
      const mockSelectedItems = { selectedItem: "testSelectedItem" };
      clusterEditClassInstance.onChangeClusterType(mockSelectedItems);
      const newState = {
        clusterTypeManualEntry:
          clusterEditClassInstance.state.clusterTypeManualEntry,
        clusterType: clusterEditClassInstance.state.clusterType,
      };
      expect(newState.clusterTypeManualEntry).toStrictEqual(false);
      expect(newState.clusterType).toBe("testSelectedItem");
    });

    test("onChangeClusterType Method SHOULD UPDATE states as expected for custom manual cluster type entry", () => {
      const mockSelectedItems = {
        selectedItem:
          "----Select this option and Enter Custom Cluster Type Below----",
      };
      clusterEditClassInstance.onChangeClusterType(mockSelectedItems);
      const newState = {
        clusterTypeManualEntry:
          clusterEditClassInstance.state.clusterTypeManualEntry,
        clusterType: clusterEditClassInstance.state.clusterType,
      };
      expect(newState.clusterTypeManualEntry).toStrictEqual(true);
      expect(newState.clusterType).toBe(
        "----Select this option and Enter Custom Cluster Type Below----"
      );
    });

    test("onChangeManualClusterType Method SHOULD NOT UPDATE initial states if input not given", () => {
      clusterEditClassInstance.onChangeManualClusterType();
      const initialState = {
        clusterType: "",
      };
      const newState = {
        clusterType: clusterEditClassInstance.state.clusterType,
      };
      expect(newState.clusterType).toStrictEqual(initialState.clusterType);
    });

    test("onChangeManualClusterType Method SHOULD UPDATE states as expected", () => {
      const mockClusterType = { target: { value: "TestClusterType" } };
      clusterEditClassInstance.onChangeManualClusterType(mockClusterType);
      const newState = {
        clusterType: clusterEditClassInstance.state.clusterType,
      };
      expect(newState.clusterType).toStrictEqual(mockClusterType.target.value);
    });

    test("onChangeClusterDomainName Method SHOULD NOT UPDATE initial states if input not given", () => {
      clusterEditClassInstance.onChangeClusterDomainName();
      const initialState = {
        clusterDomainName: "",
      };
      const newState = {
        clusterDomainName: clusterEditClassInstance.state.clusterDomainName,
      };
      expect(newState.clusterDomainName).toStrictEqual(
        initialState.clusterDomainName
      );
    });

    test("onChangeClusterDomainName Method SHOULD UPDATE states as expected", () => {
      const mockClusterDomainName = {
        target: { value: "TestClusterDomainName" },
      };
      clusterEditClassInstance.onChangeClusterDomainName(mockClusterDomainName);
      const newState = {
        clusterDomainName: clusterEditClassInstance.state.clusterDomainName,
      };
      expect(newState.clusterDomainName).toStrictEqual(
        mockClusterDomainName.target.value
      );
    });

    test("onChangeClusterManagedBy Method SHOULD NOT UPDATE initial states if input not given", () => {
      clusterEditClassInstance.onChangeClusterManagedBy();
      const initialState = {
        clusterManagedBy: "",
      };
      const newState = {
        clusterManagedBy: clusterEditClassInstance.state.clusterManagedBy,
      };
      expect(newState.clusterManagedBy).toStrictEqual(
        initialState.clusterManagedBy
      );
    });

    test("onChangeClusterManagedBy Method SHOULD UPDATE states as expected", () => {
      const mockClusterManagedBy = {
        target: { value: "TestClusterManagedBy" },
      };
      clusterEditClassInstance.onChangeClusterManagedBy(mockClusterManagedBy);
      const newState = {
        clusterManagedBy: clusterEditClassInstance.state.clusterManagedBy,
      };
      expect(newState.clusterManagedBy).toStrictEqual(
        mockClusterManagedBy.target.value
      );
    });

    test("onChangeAgentsList Method SHOULD NOT UPDATE initial states if input not given", () => {
      clusterEditClassInstance.onChangeAgentsList();
      const initialState = {
        clusterAgentsList: "",
        agentsListDisplay: "Select Agents",
        assignedAgentsListDisplay: "",
        agentsListSelected: [],
      };
      const newState = {
        clusterAgentsList: clusterEditClassInstance.state.clusterAgentsList,
        agentsListDisplay: clusterEditClassInstance.state.agentsListDisplay,
        assignedAgentsListDisplay:
          clusterEditClassInstance.state.assignedAgentsListDisplay,
        agentsListSelected: clusterEditClassInstance.state.agentsListSelected,
      };
      expect(newState.clusterName).toStrictEqual(initialState.clusterName);
      expect(newState.agentsListDisplay).toStrictEqual(
        initialState.agentsListDisplay
      );
      expect(newState.assignedAgentsListDisplay).toStrictEqual(
        initialState.assignedAgentsListDisplay
      );
      expect(newState.agentsListSelected).toStrictEqual(
        initialState.agentsListSelected
      );
    });

    test("onChangeAgentsList Method SHOULD UPDATE states as expected", () => {
      const mockClusterSelectedAgents = {
        selectedItems: [
          { label: "testAgentSelected1" },
          { label: "testAgentSelected2" },
          { label: "testAgentSelected3" },
        ],
      };
      clusterEditClassInstance.onChangeAgentsList(mockClusterSelectedAgents);
      const newState = {
        clusterAgentsList: clusterEditClassInstance.state.clusterAgentsList,
        agentsListDisplay: clusterEditClassInstance.state.agentsListDisplay,
        assignedAgentsListDisplay:
          clusterEditClassInstance.state.assignedAgentsListDisplay,
        agentsListSelected: clusterEditClassInstance.state.agentsListSelected,
      };
      expect(newState.clusterAgentsList).toStrictEqual([
        "testAgentSelected1",
        "testAgentSelected2",
        "testAgentSelected3",
      ]);
      expect(newState.agentsListDisplay).toStrictEqual(
        "testAgentSelected1,testAgentSelected2,testAgentSelected3"
      );
      expect(newState.assignedAgentsListDisplay).toStrictEqual(
        "testAgentSelected1\ntestAgentSelected2\ntestAgentSelected3"
      );
      expect(newState.agentsListSelected).toStrictEqual([
        { label: "testAgentSelected1" },
        { label: "testAgentSelected2" },
        { label: "testAgentSelected3" },
      ]);
    });

    test("getApiEntryCreateEndpoint Method SHOULD return expected value if in agent mode", () => {
      const newValue = clusterEditClassInstance.getApiEntryCreateEndpoint();
      expect(newValue).toStrictEqual("/api/tornjak/clusters/edit");
    });

    test("onSubmit Method SHOULD UPDATE states as expected when originalClusterName is empty", () => {
      clusterEditClassInstance.onSubmit();
      const newState = {
        message: clusterEditClassInstance.state.message,
      };
      expect(newState.message).toStrictEqual("ERROR: Please Choose a Cluster");
    });
  });
});
