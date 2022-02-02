import React from "react";
import { EntryList } from "../components/entry-list";
import { findByTestId, checkProps } from "../../Utils";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("Entry List Component", () => {
  const mockFunc = jest.fn();
  const props = {
    globalServerSelected: "Test String",
    globalEntriesList: [{}],
    globalErrorMessage: "Test String",
    serverSelectedFunc: mockFunc,
    entriesListUpdateFunc: mockFunc,
    tornjakMessageFunc: mockFunc,
  };
  describe("Checking PropTypes", () => {
    test("Should NOT throw Warning/ Error", () => {
      const expectedInitialProps = props;
      const propsErr = checkProps(EntryList, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders Entry List Components", () => {
    let wrapper, store;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<EntryList {...props} />);
    });

    test("Should Render Entry List Component without Errors", () => {
      const entryListComp = findByTestId(wrapper, "entry-list");
      expect(entryListComp.length).toBe(1);
    });
  });
});
