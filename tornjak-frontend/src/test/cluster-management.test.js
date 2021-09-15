import React from "react";
import { ClusterManagement } from "../components/cluster-management";
import { findByTestId, checkProps } from "../../Utils";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("Cluster Management Component", () => {
  const mockFunc = jest.fn();
  const props = {
    globalClusterTypeInfo: [{}],
    globalServerSelected: "Test String",
    globalAgentsList: [{}],
    globalServerInfo: {},
    globalTornjakServerInfo: {},
    globalErrorMessage: "Test String",
    clusterTypeInfoFunc: mockFunc,
    serverSelectedFunc: mockFunc,
    agentsListUpdateFunc: mockFunc,
    tornjakServerInfoUpdateFunc: mockFunc,
    serverInfoUpdateFunc: mockFunc,
    selectorInfoFunc: mockFunc,
    tornjakMessageFunc: mockFunc,
  };
  describe("Checking PropTypes", () => {
    test("Should NOT throw Warning/ Error", () => {
      const expectedInitialProps = props;
      const propsErr = checkProps(ClusterManagement, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders Cluster Management Components", () => {
    let wrapper, store;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<ClusterManagement {...props} />);
    });

    test("Should Render Cluster Management Component without Errors", () => {
      const clusterManagemnetComp = findByTestId(wrapper, "cluster-management");
      expect(clusterManagemnetComp.length).toBe(1);
    });
  });
});
