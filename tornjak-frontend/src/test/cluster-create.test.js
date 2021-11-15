import React from "react";
import ReactDOM from "react-dom";
import { render, screen, cleanup } from "@testing-library/react";
import renderer from "react-test-renderer";
//const ClusterCreate = require('../components/cluster-create');
import { ClusterCreate } from "../components/cluster-create";
import { findByTestId, checkProps } from "../../Utils";
const puppeteer = require("puppeteer");
import { shallow, mount } from "enzyme";
//import "../setupTests";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import toJson from "enzyme-to-json";
import moxios from "moxios";
import '@testing-library/jest-dom/extend-expect';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

// const evalByTestAttr = async(page, attr, expected) => {
//     const evaluate = await page.$eval(`[data-test='${attr}']`, el => el.textContent);
//     expect(evaluate).toBe(expected);
// };
describe("Cluster Create Component", () => {
  let mockFunc = jest.fn();
  const props = {
    clusterTypeList: [{}],
    agentsList: [{}],
    globalServerSelected: "Test Global Server",
    globalErrorMessage: "Test Global Error Message",
    globalTornjakServerInfo: {},
    clusterTypeInfoFunc: mockFunc,
    tornjakMessageFunc: mockFunc,
    agentsListUpdateFunc: mockFunc,
    tornjakServerInfoUpdateFunc: mockFunc,
    serverInfoUpdateFunc: mockFunc,
  };
  describe("Checking PropTypes", () => {
    const expectedInitialProps = props;
    test("Should NOT throw Warning/ Error", () => {
      const propsErr = checkProps(ClusterCreate, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders Cluster Create Components", () => {
    let wrapper, store;
    let onSubmitSpy;
    beforeEach(() => {
      onSubmitSpy = jest.fn();
      store = mockStore(props);
      wrapper = shallow(<ClusterCreate {...props} onSubmit={onSubmitSpy} />);
    });

    test("Should Render Cluster Create Component without Errors", () => {
      const createClusterComp = findByTestId(wrapper, "cluster-create");
      expect(createClusterComp.length).toBe(1);
    });

    test("Should Render Create Cluster Title without Errors", () => {
      const createClusterTitle = findByTestId(wrapper, "create-title");
      expect(createClusterTitle.length).toBe(1);
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

    test("Should Render Create Cluster Button without Errors", () => {
      const createClusterButton = findByTestId(
        wrapper,
        "create-cluster-button"
      );
      expect(createClusterButton.length).toBe(1);
    });

    test("Should Render Success Message without Errors", () => {
      const successMessage = findByTestId(wrapper, "success-message");
      expect(successMessage.length).toBe(1);
    });

    test("Should Render Primary Alert without Errors", () => {
      const primaryAlert = findByTestId(wrapper, "alert-primary");
      expect(primaryAlert.length).toBe(1);
    });

    test("Should emit callback on Cluster Create button click", () => {
      const createClusterButton = findByTestId(wrapper, "create-cluster-form");
      createClusterButton.simulate('submit', { preventDefault: () => {} });
      const callback = mockFunc.mock.calls;
      expect(callback.length).toBe(1);
    });
  });

  describe("Test Cluster Create Methods and their states", () => {
    let wrapper, store;
    let clusterCreateClassInstance;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<ClusterCreate {...props}/>);
      clusterCreateClassInstance = wrapper.instance();
    });

    test("onChangeAgentsList Method SHOULD NOT UPDATE initial states if input not given", () => {
      clusterCreateClassInstance.onChangeAgentsList();
      const initialState = {
        clusterAgentsList: [],
        agentsListDisplay: "Select Agents",
        assignedAgentsListDisplay: "",
      };
      const newState = {
        clusterAgentsList: clusterCreateClassInstance.state.clusterAgentsList,
        agentsListDisplay: clusterCreateClassInstance.state.agentsListDisplay,
        assignedAgentsListDisplay:
          clusterCreateClassInstance.state.assignedAgentsListDisplay,
      };
      expect(newState.clusterAgentsList).toStrictEqual(
        initialState.clusterAgentsList
      );
      expect(newState.agentsListDisplay).toBe(initialState.agentsListDisplay);
      expect(newState.assignedAgentsListDisplay).toBe(
        initialState.assignedAgentsListDisplay
      );
    });

    test("onChangeAgentsList Method SHOULD UPDATE states as expected", () => {
      const mockSelectedItems = {
        selectedItems: [
          { label: "agentTest1" },
          { label: "agentTest2" },
          { label: "agentTest3" },
        ],
      };
      clusterCreateClassInstance.onChangeAgentsList(mockSelectedItems);
      const newState = {
        clusterAgentsList: clusterCreateClassInstance.state.clusterAgentsList,
        agentsListDisplay: clusterCreateClassInstance.state.agentsListDisplay,
        assignedAgentsListDisplay:
          clusterCreateClassInstance.state.assignedAgentsListDisplay,
      };
      expect(newState.clusterAgentsList).toStrictEqual([
        "agentTest1",
        "agentTest2",
        "agentTest3",
      ]);
      expect(newState.agentsListDisplay).toBe(
        "agentTest1,agentTest2,agentTest3"
      );
      expect(newState.assignedAgentsListDisplay).toBe(
        "agentTest1\nagentTest2\nagentTest3"
      );
    });

    test("onChangeClusterName Method SHOULD NOT UPDATE initial states if input not given", () => {
      clusterCreateClassInstance.onChangeClusterName();
      const initialState = {
        clusterName: "",
      };
      const newState = {
        clusterName: clusterCreateClassInstance.state.clusterName,
      };
      expect(newState.clusterName).toStrictEqual(initialState.clusterName);
    });

    test("onChangeClusterName Method SHOULD UPDATE states as expected", () => {
      const mockClusterName = { target: { value: "TestClusterName" } };
      clusterCreateClassInstance.onChangeClusterName(mockClusterName);
      const newState = {
        clusterName: clusterCreateClassInstance.state.clusterName,
      };
      expect(newState.clusterName).toStrictEqual(mockClusterName.target.value);
    });

    test("onChangeClusterType Method SHOULD NOT UPDATE initial states if input not given", () => {
      clusterCreateClassInstance.onChangeClusterType();
      const initialState = {
        clusterTypeManualEntry: false,
        clusterType: "",
      };
      const newState = {
        clusterTypeManualEntry:
          clusterCreateClassInstance.state.clusterTypeManualEntry,
        clusterType: clusterCreateClassInstance.state.clusterType,
      };
      expect(newState.clusterTypeManualEntry).toStrictEqual(
        initialState.clusterTypeManualEntry
      );
      expect(newState.clusterType).toBe(initialState.clusterType);
    });

    test("onChangeClusterType Method SHOULD UPDATE states as expected", () => {
      const mockSelectedItems = { selectedItem: "testSelectedItem" };
      clusterCreateClassInstance.onChangeClusterType(mockSelectedItems);
      const newState = {
        clusterTypeManualEntry:
          clusterCreateClassInstance.state.clusterTypeManualEntry,
        clusterType: clusterCreateClassInstance.state.clusterType,
      };
      expect(newState.clusterTypeManualEntry).toStrictEqual(false);
      expect(newState.clusterType).toBe("testSelectedItem");
    });

    test("onChangeClusterType Method SHOULD UPDATE states as expected for custom manual cluster type entry", () => {
      const mockSelectedItems = {
        selectedItem:
          "----Select this option and Enter Custom Cluster Type Below----",
      };
      clusterCreateClassInstance.onChangeClusterType(mockSelectedItems);
      const newState = {
        clusterTypeManualEntry:
          clusterCreateClassInstance.state.clusterTypeManualEntry,
        clusterType: clusterCreateClassInstance.state.clusterType,
      };
      expect(newState.clusterTypeManualEntry).toStrictEqual(true);
      expect(newState.clusterType).toBe(
        "----Select this option and Enter Custom Cluster Type Below----"
      );
    });

    test("onChangeManualClusterType Method SHOULD NOT UPDATE initial states if input not given", () => {
      clusterCreateClassInstance.onChangeManualClusterType();
      const initialState = {
        clusterType: "",
      };
      const newState = {
        clusterType: clusterCreateClassInstance.state.clusterType,
      };
      expect(newState.clusterType).toStrictEqual(initialState.clusterType);
    });

    test("onChangeManualClusterType Method SHOULD UPDATE states as expected", () => {
      const mockClusterType = { target: { value: "TestClusterType" } };
      clusterCreateClassInstance.onChangeManualClusterType(mockClusterType);
      const newState = {
        clusterType: clusterCreateClassInstance.state.clusterType,
      };
      expect(newState.clusterType).toStrictEqual(mockClusterType.target.value);
    });

    test("onChangeClusterDomainName Method SHOULD NOT UPDATE initial states if input not given", () => {
      clusterCreateClassInstance.onChangeClusterDomainName();
      const initialState = {
        clusterDomainName: "",
      };
      const newState = {
        clusterDomainName: clusterCreateClassInstance.state.clusterDomainName,
      };
      expect(newState.clusterDomainName).toStrictEqual(
        initialState.clusterDomainName
      );
    });

    test("onChangeClusterDomainName Method SHOULD UPDATE states as expected", () => {
      const mockClusterDomainName = {
        target: { value: "TestClusterDomainName" },
      };
      clusterCreateClassInstance.onChangeClusterDomainName(
        mockClusterDomainName
      );
      const newState = {
        clusterDomainName: clusterCreateClassInstance.state.clusterDomainName,
      };
      expect(newState.clusterDomainName).toStrictEqual(
        mockClusterDomainName.target.value
      );
    });

    test("onChangeClusterManagedBy Method SHOULD NOT UPDATE initial states if input not given", () => {
      clusterCreateClassInstance.onChangeClusterManagedBy();
      const initialState = {
        clusterManagedBy: "",
      };
      const newState = {
        clusterManagedBy: clusterCreateClassInstance.state.clusterManagedBy,
      };
      expect(newState.clusterManagedBy).toStrictEqual(
        initialState.clusterManagedBy
      );
    });

    test("onChangeClusterManagedBy Method SHOULD UPDATE states as expected", () => {
      const mockClusterManagedBy = {
        target: { value: "TestClusterManagedBy" },
      };
      clusterCreateClassInstance.onChangeClusterManagedBy(mockClusterManagedBy);
      const newState = {
        clusterManagedBy: clusterCreateClassInstance.state.clusterManagedBy,
      };
      expect(newState.clusterManagedBy).toStrictEqual(
        mockClusterManagedBy.target.value
      );
    });

    test("getApiEntryCreateEndpoint Method SHOULD return expected value if in agent mode", () => {
      const newValue = clusterCreateClassInstance.getApiEntryCreateEndpoint();
      expect(newValue).toStrictEqual("/api/tornjak/clusters/create");
    });

    test("onSubmit Method SHOULD UPDATE states as expected when clusterName is empty", () => {
      clusterCreateClassInstance.onSubmit();
      const newState = {
        message: clusterCreateClassInstance.state.message,
      };
      expect(newState.message).toStrictEqual(
        "ERROR: Cluster Name Can Not Be Empty - Enter Cluster Name"
      );
    });
  });

  describe("Renders The Correct Input Change", () => {
    let wrapper, store;
    let onSubmitSpy;
    let clusterCreateClassInstance;
    beforeEach(() => {
      onSubmitSpy = jest.fn();
      store = mockStore(props);
      wrapper = shallow(<ClusterCreate {...props} onSubmit={onSubmitSpy} />);
      clusterCreateClassInstance = wrapper.instance();
    });

    test("Renders correct input change for clustername-Text-input-field without Errors", () => {
      const clusterNameInput = findByTestId(wrapper, "clustername-Text-input-field");
      clusterNameInput.simulate('change', {target: {value: 'TestSimulateClusterName'}});
      clusterCreateClassInstance.onChangeClusterName();
      const newState = {
        clusterName: clusterCreateClassInstance.state.clusterName,
      };
      expect(newState.clusterName).toStrictEqual('TestSimulateClusterName');
      // const createClusterButton = findByTestId(wrapper, "create-cluster-form");
      // createClusterButton.simulate('submit', { preventDefault: () => {} });
      // const callback = mockFunc.mock.calls;
      // expect(callback.length).toBe(1);
      //expect(props.clickedDashboardTableFunc).toHaveBeenCalledWith(props.title.toLowerCase());
      //expect(createClusterComp.length).toBe(1);
    });

    test("Renders correct input change for cluster-domain-name-input-field without Errors", () => {
      const clusterDomainNameInput = findByTestId(wrapper, "cluster-domain-name-input-text-field");
      clusterDomainNameInput.simulate('change', {target: {value: 'TestSimulateClusterDomainName'}});
      clusterCreateClassInstance.onChangeClusterDomainName();
      const newState = {
        clusterDomainName: clusterCreateClassInstance.state.clusterDomainName,
      };
      expect(newState.clusterDomainName).toStrictEqual('TestSimulateClusterDomainName');
    });

    test("Renders correct input change for cluster-managed-by-input-text-field without Errors", () => {
      const clusterManagedByInput = findByTestId(wrapper, "cluster-managed-by-input-text-field");
      clusterManagedByInput.simulate('change', {target: {value: 'TestSimulateClusterManagedBy'}});
      clusterCreateClassInstance.onChangeClusterManagedBy();
      const newState = {
        clusterManagedBy: clusterCreateClassInstance.state.clusterManagedBy,
      };
      expect(newState.clusterManagedBy).toStrictEqual('TestSimulateClusterManagedBy');
    });
  });
  // describe('Render with Puppeter', () => {
  //     // cleanup after each test
  //     afterEach(cleanup);

  //     let browser;
  //     //let page;

  //     // check if ClusterCreate class is defined
  //     test('ClusterCreate class exists', () => {
  //         expect(ClusterCreate).toBeDefined();
  //     });

  //     //open a browser before tests
  //     beforeAll(async () => {
  //         browser = await puppeteer.launch({
  //             headless: false,
  //             slowMo: 80,
  //             args: ['--window-size=1920,1080'],
  //             defaultViewport: {
  //                 width:1920,
  //                 height:1080
  //             }
  //         });
  //         //page = await browser.newPage();
  //     });

  //     // should render Cluster Create page
  //     test('should render Cluster Create page without crashing', async () => {
  //         const context = await browser.createIncognitoBrowserContext();
  //         const page = await context.newPage();
  //         await page.goto(
  //             'http://localhost:3000/cluster/clustermanagement'
  //         );

  //         await context.close();
  //     })

  //     // should render components as expected
  //     test('should render components as expected', async () => {
  //         const context = await browser.createIncognitoBrowserContext();
  //         const page = await context.newPage();
  //         await page.goto(
  //             'http://localhost:3000/cluster/clustermanagement'
  //         );
  //         await page.waitForSelector(".create-create-title");
  //         // evalByTestAttr(page, 'create-title', "Create Cluster"); //createClusterTitle
  //         // evalByTestAttr(page, 'clustername-input-field', "Cluster Name [*required]i.e. exampleabc"); //clusterNameInput
  //         // evalByTestAttr(page, 'clustertype-drop-down', "Cluster Type [*required]Select Cluster TypeOpen menui.e. Kubernetes, VMs..."); //clusterTypeSelection
  //         // evalByTestAttr(page, 'cluster-domain-name-input-field', "Cluster Domain Name/ URLi.e. example.org"); //clusterDomainInput
  //         // evalByTestAttr(page, 'cluster-managed-by-input-field', "Cluster Managed Byi.e. person-A"); //clusterManagedByInput
  //         // evalByTestAttr(page, 'agents-multiselect', "Assign Agents To Clusteri.e. spiffe://example.org/agent/myagent1..."); //clusterAgentsSelection
  //         // evalByTestAttr(page, 'selectors-textArea', "Assigned Agentsi.e. spiffe://example.org/agent/myagent1..."); //clusterAgentsTextArea
  //         const createClusterTitle = await page.$eval(`[data-test='create-title']`, el => el.textContent);
  //         const clusterNameInput = await page.$eval(`[data-test='clustername-input-field']`, el => el.textContent);
  //         const clusterTypeSelection = await page.$eval(`[data-test='clustertype-drop-down']`, el => el.textContent);
  //         const clusterDomainInput = await page.$eval(`[data-test='cluster-domain-name-input-field']`, el => el.textContent);
  //         const clusterManagedByInput = await page.$eval(`[data-test='cluster-managed-by-input-field']`, el => el.textContent);
  //         const clusterAgentsSelection = await page.$eval(`[data-test='agents-multiselect']`, el => el.textContent);
  //         const clusterAgentsTextArea = await page.$eval(`[data-test='selectors-textArea']`, el => el.textContent);
  //         //const clusterCreateSubmitButton = await page.$eval('.btn btn-primary', el => el.textContent);
  //         expect(createClusterTitle).toBe("Create Cluster");
  //         expect(clusterNameInput).toBe("Cluster Name [*required]i.e. exampleabc");
  //         expect(clusterTypeSelection).toBe("Cluster Type [*required]Select Cluster TypeOpen menui.e. Kubernetes, VMs...");
  //         expect(clusterDomainInput).toBe("Cluster Domain Name/ URLi.e. example.org");
  //         expect(clusterManagedByInput).toBe("Cluster Managed Byi.e. person-A");
  //         expect(clusterAgentsSelection).toBe("Assign Agents To Clusteri.e. spiffe://example.org/agent/myagent1...");
  //         expect(clusterAgentsTextArea).toBe("Assigned Agentsi.e. spiffe://example.org/agent/myagent1...");
  //         //expect(clusterCreateSubmitButton).toBe("Create Cluster");
  //         await context.close();
  //     })

  //     // should enter Cluster name data on field
  //     // test('should enter Cluster name data on field', async () => {
  //     //     const context = await browser.createIncognitoBrowserContext();
  //     //     const page = await context.newPage();
  //     //     await page.goto(
  //     //         'http://localhost:3000/cluster/clustermanagement'
  //     //     );
  //     //     await page.waitForSelector(".clustername-input-field");
  //     //     await page.click(".clustername-input-field");
  //     //     await page.type(".clustername-input-field", "cluster1");
  //     //     // await page.waitForSelector(".clustertype-drop-down");
  //     //     // await page.click(".clustertype-drop-down");
  //     //     // await page.waitForSelector(".cluster-domain-name-input-field");
  //     //     // await page.click(".cluster-domain-name-input-field");
  //     //     // await page.type(".cluster-domain-name-input-field", "abc.com");
  //     //     // await page.waitForSelector(".cluster-managed-by-input-field");
  //     //     // await page.click(".cluster-managed-by-input-field");
  //     //     // await page.type(".cluster-managed-by-input-field", "personA");
  //     //     // await page.waitForSelector(".agents-multiselect");
  //     //     // await page.click(".agents-multiselect");
  //     //     // await page.keyboard.press('Enter');
  //     //     await context.close();
  //     // })
  //     afterAll(() => browser.close());
  // })
});
