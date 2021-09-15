import React from "react";
import { TableDashboard } from "../components/dashboard/table/dashboard-table";
import { findByTestId, checkProps } from "../../Utils";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("Dashboard Table Component", () => {
  const mockFunc = jest.fn();
  const props = {
    numRows: 1,
    data: [{}],
    columns: [{}],
    title: "Test Title",
    clickedDashboardTableFunc: mockFunc,
  };
  describe("Checking PropTypes", () => {
    test("Should NOT throw Warning/ Error", () => {
      const expectedInitialProps = props;
      const propsErr = checkProps(TableDashboard, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders Dashboard Table Components", () => {
    let wrapper, store;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<TableDashboard {...props} />);
    });

    test("Should Render Entity Title Component without Errors", () => {
      const entityTitleComp = findByTestId(wrapper, "entity-title");
      expect(entityTitleComp.length).toBe(1);
    });

    test("Should Render Entity Details Button without Errors", () => {
      const entityDetailsButtonComp = findByTestId(wrapper, "entity-details-button");
      expect(entityDetailsButtonComp.length).toBe(1);
    });

    test("Should Render Entity Table without Errors", () => {
      const entityTableComp = findByTestId(wrapper, "entity-table");
      expect(entityTableComp.length).toBe(1);
    });
  });
});
