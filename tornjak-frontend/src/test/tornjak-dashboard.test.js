import React from "react";
import { TornjakDashboard } from "../components/dashboard/tornjak-dashboard";
import { findByTestId, checkProps } from "../../Utils";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("Tornjak Dashboard Component", () => {
  const mockFunc = jest.fn();
  const props = {
    classes: {},
    globalServerSelected: "Test String",
    globalClustersList: [{}],
    globalTornjakServerInfo: {},
    globalErrorMessage: "Test String",
    globalAgents: {},
    globalEntries: {},
    globalClickedDashboardTable: "Test String",
    agentsListUpdateFunc: mockFunc,
    clustersListUpdateFunc: mockFunc,
    selectorInfoFunc: mockFunc,
    serverInfoUpdateFunc: mockFunc,
    serverSelectedFunc: mockFunc,
    tornjakMessageFunc: mockFunc,
    tornjakServerInfoUpdateFunc: mockFunc,
  };
  describe("Checking PropTypes", () => {
    test("Should NOT throw Warning/ Error", () => {
      const expectedInitialProps = props;
      const propsErr = checkProps(TornjakDashboard, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders Dashboard Details Components", () => {
    let wrapper, store;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<TornjakDashboard {...props} />);
    });

    test("Should Render Tornjak Dashboard Component without Errors", () => {
      const tornjakDashboardComp = findByTestId(wrapper, "tornjak-dashboard");
      expect(tornjakDashboardComp.length).toBe(1);
    });
  });
});
