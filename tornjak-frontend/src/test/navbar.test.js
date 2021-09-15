import React from "react";
import { NavigationBar } from "../components/navbar";
import { findByTestId, checkProps } from "../../Utils";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("Navigation Bar Component", () => {
  const mockFunc = jest.fn();
  const props = {
    globalClickedDashboardTable: "Test String",
    clickedDashboardTableFunc: mockFunc,
  };
  describe("Checking PropTypes", () => {
    test("Should NOT throw Warning/ Error", () => {
      const expectedInitialProps = props;
      const propsErr = checkProps(NavigationBar, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders NavigationBar Components", () => {
    let wrapper, store;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<NavigationBar {...props} />);
    });

    test("Should Render Navigation Bar Component without Errors", () => {
      const navBarComp = findByTestId(wrapper, "nav-bar");
      expect(navBarComp.length).toBe(1);
    });
  });
});
