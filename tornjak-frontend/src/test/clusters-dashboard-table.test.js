import React from "react";
import { ClusterDashboardTable } from "../components/dashboard/clusters-dashboard-table";
import { findByTestId, checkProps } from "../../Utils";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("Clusters Dashboard Table Component", () => {
  const props = {
    classes: {},
    numRows: 1,
    filterByCluster: "Test String",
    globalAgents: {},
    globalEntries: {},
    globalClustersList: [{}],
    globalClickedDashboardTable: "Test String",
  };
  describe("Checking PropTypes", () => {
    test("Should NOT throw Warning/ Error", () => {
      const expectedInitialProps = props;
      const propsErr = checkProps(ClusterDashboardTable, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders Cluster Dashboard Table Components", () => {
    let wrapper, store;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<ClusterDashboardTable {...props} />);
    });

    test("Should Render Clusters Dashboard Table Component without Errors", () => {
      const clusterDashboardTableComp = findByTestId(wrapper, "cluster-dashboard-table");
      expect(clusterDashboardTableComp.length).toBe(1);
    });
  });
});
