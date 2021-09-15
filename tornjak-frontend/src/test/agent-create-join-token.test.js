import React from "react";
import { CreateJoinToken } from "../components/agent-create-join-token";
import { findByTestId, checkProps } from "../../Utils";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("Create Join Token Component", () => {
  const mockFunc = jest.fn();
  const props = {
    globalServerSelected: "Test String",
    serverSelectedFunc: mockFunc,
  };
  describe("Checking PropTypes", () => {
    test("Should NOT throw Warning/ Error", () => {
      const expectedInitialProps = props;
      const propsErr = checkProps(CreateJoinToken, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders Create Join Token Components", () => {
    let wrapper, store;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<CreateJoinToken {...props} />);
    });

    test("Should Render Create Join Token Component without Errors", () => {
      const agentCreateTokenComp = findByTestId(wrapper, "agent-create-token");
      expect(agentCreateTokenComp.length).toBe(1);
    });
  });
});
