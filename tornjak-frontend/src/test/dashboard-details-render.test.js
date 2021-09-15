import React from "react";
import { DashboardDetailsRender } from "../components/dashboard/dashboard-details-render";
import { findByTestId, checkProps } from "../../Utils";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("Dashboard Details Component", () => {
  const props = {
    params: {},
    globalServerInfo: {},
    globalTornjakServerInfo: {},
    globalClustersList: [{}],
    globalAgentsList: [{}],
    globalEntriesList: [{}],
    globalAgentsWorkLoadAttestorInfo: [{}],
  };
  describe("Checking PropTypes", () => {
    test("Should NOT throw Warning/ Error", () => {
      const expectedInitialProps = props;
      const propsErr = checkProps(DashboardDetailsRender, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders Dashboard Details Components", () => {
    let wrapper, store;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<DashboardDetailsRender {...props} />);
    });

    test("Should Render Dashboard Details Component without Errors", () => {
      const dashboardDetailsRenderComp = findByTestId(wrapper, "dashboard-details");
      expect(dashboardDetailsRenderComp.length).toBe(1);
    });
  });
});
