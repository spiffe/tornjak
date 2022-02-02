import React from "react";
import { ClusterList } from "../components/cluster-list";
import { findByTestId, checkProps } from "../../Utils";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("Cluster List Component", () => {
  const mockFunc = jest.fn();
  const props = {
    globalServerSelected: "Test String",
    globalClustersList: [{}],
    globalTornjakServerInfo: {},
    globalErrorMessage: "Test String",
    serverSelectedFunc: mockFunc,
    agentsListUpdateFunc: mockFunc,
    tornjakServerInfoUpdateFunc: mockFunc,
    serverInfoUpdateFunc: mockFunc,
    clusterTypeList: [{}],
    agentsList: [{}],
    selectorInfoFunc: mockFunc,
    tornjakMessageFunc: mockFunc,
    workloadSelectorInfoFunc: mockFunc,
    agentworkloadSelectorInfoFunc: mockFunc,
    clusterTypeInfoFunc: mockFunc,
  };
  describe("Checking PropTypes", () => {
    test("Should NOT throw Warning/ Error", () => {
      const expectedInitialProps = props;
      const propsErr = checkProps(ClusterList, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders Cluster List Components", () => {
    let wrapper, store;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<ClusterList {...props} />);
    });

    test("Should Render Cluster List Component without Errors", () => {
      const clusterListComp = findByTestId(wrapper, "cluster-list");
      expect(clusterListComp.length).toBe(1);
    });
  });
});
