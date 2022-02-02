import { CreateEntry } from "../components/entry-create";
import { findByTestId, checkProps } from "../../Utils";
import { shallow, mount } from "enzyme";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";
import '@testing-library/jest-dom/extend-expect';

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("Entry Create Component", () => {
  let mockFunc = jest.fn();
  const props = {
    globalServerSelected: "Test String",
    globalSelectorInfo: [{}],
    globalAgentsList: [{}],
    globalEntriesList: [{}],
    globalServerInfo: {},
    globalTornjakServerInfo: {},
    globalErrorMessage: "Test String",
    globalWorkloadSelectorInfo: {},
    globalAgentsWorkLoadAttestorInfo: [{}],
    serverSelectedFunc: mockFunc,
    agentsListUpdateFunc: mockFunc,
    tornjakServerInfoUpdateFunc: mockFunc,
    serverInfoUpdateFunc: mockFunc,
    entriesListUpdateFunc: mockFunc,
    selectorInfoFunc: mockFunc,
    tornjakMessageFunc: mockFunc,
    agentworkloadSelectorInfoFunc: mockFunc,
  };
  describe("Checking PropTypes", () => {
    const expectedInitialProps = props;
    test("Should NOT throw Warning/ Error", () => {
      const propsErr = checkProps(CreateEntry, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders Entry Create Components", () => {
    let wrapper, store;
    let onSubmitSpy;
    beforeEach(() => {
      onSubmitSpy = jest.fn();
      store = mockStore(props);
      wrapper = shallow(<CreateEntry {...props} onSubmit={onSubmitSpy} />);
    });

    test("Should Render entry Create Component without Errors", () => {
      const createEntryComp = findByTestId(wrapper, "create-entry");
      expect(createEntryComp.length).toBe(1);
    });

    test("Should Render Create Cluster Title without Errors", () => {
      const createEntryTitle = findByTestId(wrapper, "create-entry-title");
      expect(createEntryTitle.length).toBe(1);
    });

    test("Should Render Parent Id Dropdown without Errors", () => {
      const parentIdSelectionInput = findByTestId(wrapper, "parentId-drop-down");
      expect(parentIdSelectionInput.length).toBe(1);
    });

    test("Should Not Render parent id manual entry Initially", () => {
      const parentIdManual = findByTestId(
        wrapper,
        "parentId-manual-input-field"
      );
      expect(parentIdManual.length).toBe(0);
    });

    test("Should Render Spiffe Id Input without Errors", () => {
      const spiffeIdInput = findByTestId(
        wrapper,
        "spiffeId-input-field"
      );
      expect(spiffeIdInput.length).toBe(1);
    });

    test("Should Render selectors multiselect without Errors", () => {
      const selectorsMultiSelect = findByTestId(
        wrapper,
        "selectors-multiselect"
      );
      expect(selectorsMultiSelect.length).toBe(1);
    });

    test("Should Render Selectors Text Area without Errors", () => {
      const selectorsTextArea = findByTestId(
        wrapper,
        "selectors-textArea"
      );
      expect(selectorsTextArea.length).toBe(1);
    });

    test("Should Render TTL Input without Errors", () => {
      const ttlInput = findByTestId(wrapper, "ttl-input");
      expect(ttlInput.length).toBe(1);
    });

    test("Should Render ExpireAt Input without Errors", () => {
      const expiresAtInput = findByTestId(
        wrapper,
        "expiresAt-input"
      );
      expect(expiresAtInput.length).toBe(1);
    });

    test("Should Render federatesWith Input without Errors", () => {
      const federatesWithInput = findByTestId(
        wrapper,
        "federates-with-input-field"
      );
      expect(federatesWithInput.length).toBe(1);
    });

    test("Should Render dnsNames Input without Errors", () => {
      const dnsNamesInput = findByTestId(
        wrapper,
        "dnsnames-input-field"
      );
      expect(dnsNamesInput.length).toBe(1);
    });

    test("Should Render adminFlag CheckBox without Errors", () => {
      const adminFlagCheckBox = findByTestId(
        wrapper,
        "admin-flag-checkbox"
      );
      expect(adminFlagCheckBox.length).toBe(1);
    });

    test("Should Render down stream flag CheckBox without Errors", () => {
      const downStreamFlagCheckBox = findByTestId(
        wrapper,
        "down-stream-checkbox"
      );
      expect(downStreamFlagCheckBox.length).toBe(1);
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
});
