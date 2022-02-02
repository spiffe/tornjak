import React from "react";
import { WorkLoadAttestor } from "../components/work-load-attestor-modal";
import { findByTestId, checkProps } from "../../Utils";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("WorkLoad Attestor Component", () => {
  const mockFunc = jest.fn();
  const props = {
    globalServerSelected: [{}],
    globalAgentsList: [{}],
    globalWorkloadSelectorInfo: {},
    agentsListUpdateFunc: mockFunc,
    agentworkloadSelectorInfoFunc: mockFunc,
  };
  describe("Checking PropTypes", () => {
    test("Should NOT throw Warning/ Error", () => {
      const expectedInitialProps = props;
      const propsErr = checkProps(WorkLoadAttestor, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders WorkLoad Attestor Components", () => {
    let wrapper, store;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<WorkLoadAttestor {...props} />);
    });

    test("Should Render WorkLoad Attestor Component without Errors", () => {
      const tornjakServerInfoComp = findByTestId(wrapper, "work-load-attestor");
      expect(tornjakServerInfoComp.length).toBe(1);
    });
  });
});
