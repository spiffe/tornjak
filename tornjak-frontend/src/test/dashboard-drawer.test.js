import React from "react";
import { DashboardDrawer } from "../components/dashboard/dashboard-drawer";
import { findByTestId, checkProps } from "../../Utils";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("Dashboard Drawer Component", () => {
  const props = {
    classes: {},
    globalClickedDashboardTable: "Test",
  };
  describe("Checking PropTypes", () => {
    test("Should NOT throw Warning/ Error", () => {
      const expectedInitialProps = props;
      const propsErr = checkProps(DashboardDrawer, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders Dashboard Details Components", () => {
    let wrapper, store;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<DashboardDrawer {...props} />);
    });

    test("Should Render Dashboard Drawer Component without Errors", () => {
      const dashboardDrawerComp = findByTestId(wrapper, "dashboard-drawer");
      expect(dashboardDrawerComp.length).toBe(1);
    });
  });
});
