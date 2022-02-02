import React from "react";
import { TornjakServerInfo } from "../components/tornjak-server-info";
import { findByTestId, checkProps } from "../../Utils";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("tornjak-server Component", () => {
  const mockFunc = jest.fn();
  const props = {
    globalServersList: [{}],
    serversListUpdateFunc: mockFunc,
  };
  describe("Checking PropTypes", () => {
    test("Should NOT throw Warning/ Error", () => {
      const expectedInitialProps = props;
      const propsErr = checkProps(TornjakServerInfo, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders tornjak-server Components", () => {
    let wrapper, store;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<TornjakServerInfo {...props} />);
    });

    test("Should Render tornjak-server Component without Errors", () => {
      const tornjakServerInfoComp = findByTestId(wrapper, "tornjak-server");
      expect(tornjakServerInfoComp.length).toBe(1);
    });
  });
});
