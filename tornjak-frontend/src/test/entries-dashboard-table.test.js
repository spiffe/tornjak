import React from "react";
import { EntriesDashBoardTable } from "../components/dashboard/entries-dashboard-table";
import { findByTestId, checkProps } from "../../Utils";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("Entries Dashboard Table Component", () => {
  const props = {
    classes: {},
    numRows: 1,
    filterByCluster: "Test String",
    filterByAgentId: "Test String",
    globalAgents: {},
    globalEntries: {},
    globalClickedDashboardTable: "Test String",
  };
  describe("Checking PropTypes", () => {
    test("Should NOT throw Warning/ Error", () => {
      const expectedInitialProps = props;
      const propsErr = checkProps(EntriesDashBoardTable, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders Entries Dashboard Table Components", () => {
    let wrapper, store;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<EntriesDashBoardTable {...props} />);
    });

    test("Should Render Entries Dashboard Table Component without Errors", () => {
      const entriesDashBoardTableComp = findByTestId(wrapper, "entries-dashboard-table");
      expect(entriesDashBoardTableComp.length).toBe(1);
    });
  });
});
