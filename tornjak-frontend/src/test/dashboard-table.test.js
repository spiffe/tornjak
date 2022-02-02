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

    test("Should Render Entity Title Button Component without Errors", () => {
      const entityTitleComp = findByTestId(wrapper, "entity-title-button");
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

    test("Dispatch the right action for clickedDashboardTableFunc entity-title-button without Errors", () => {
      const entityTableComp = findByTestId(wrapper, "entity-title-button");
      entityTableComp.simulate('click');
      expect(props.clickedDashboardTableFunc).toHaveBeenCalledWith(props.title.toLowerCase());
    });

    // test("Dispatch the right action for clickedDashboardTableFunc entity-details-button without Errors", () => {
    //   const jsdomAlert = window.alert;  // remember the jsdom alert
    //   window.alert = () => {}; 
    //   const entityTableComp = findByTestId(wrapper, "entity-details-button");
    //   entityTableComp.simulate('click');
    //   expect(props.clickedDashboardTableFunc).toHaveBeenCalledWith(props.title.toLowerCase());
    //   window.alert = jsdomAlert;  // restore the jsdom alert
    // });
  });
});
