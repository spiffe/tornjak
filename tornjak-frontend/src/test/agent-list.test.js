import React from "react";
import { AgentList } from "../components/agent-list";
import { findByTestId, checkProps } from "../../Utils";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("Agent List Component", () => {
  const mockFunc = jest.fn();
  const props = {
    globalServerSelected: "Test String",
    globalAgentsList: [{}],
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
      const propsErr = checkProps(AgentList, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders Agent List Components", () => {
    let wrapper, store;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<AgentList {...props} />);
    });

    test("Should Render Agent List Component without Errors", () => {
      const agentListComp = findByTestId(wrapper, "agent-list");
      expect(agentListComp.length).toBe(1);
    });
  });
});
