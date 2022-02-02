import React from "react";
import { PieChart1 } from "../charts/PieChart";
import { findByTestId, checkProps } from "../../Utils";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("Pie Chart Component", () => {
  const props = {
    data: [{}],
  };
  describe("Checking PropTypes", () => {
    test("Should NOT throw Warning/ Error", () => {
      const expectedInitialProps = props;
      const propsErr = checkProps(PieChart1, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders Pie Chart Components", () => {
    let wrapper, store;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<PieChart1 {...props} />);
    });

    test("Should Render Pie Chart Component without Errors", () => {
      const pieChartComp = findByTestId(wrapper, "pie-chart");
      expect(pieChartComp.length).toBe(1);
    });
  });
});
