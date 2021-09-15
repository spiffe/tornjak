import React from "react";
import { DashboardDetails } from "../components/dashboard/dashboard-details";
import { findByTestId, checkProps } from "../../Utils";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("Dashboard Details Component", () => {
  const props = {
    classes: {},
    globalClickedDashboardTable: "Test",
    selectedData: [{}],
  };
  describe("Checking PropTypes", () => {
    test("Should NOT throw Warning/ Error", () => {
      const expectedInitialProps = props;
      const propsErr = checkProps(DashboardDetails, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders Dashboard Details Components", () => {
    let wrapper, store;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<DashboardDetails {...props} />);
    });

    test("Should Render Dashboard Details Component without Errors", () => {
      const dashboardDetailsComp = findByTestId(wrapper, "dashboard-details");
      expect(dashboardDetailsComp.length).toBe(1);
    });
  });
});
