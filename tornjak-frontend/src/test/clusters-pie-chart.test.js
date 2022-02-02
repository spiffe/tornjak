import React from "react";
import { ClustersPieChart } from "../components/dashboard/clusters-pie-chart";
import { findByTestId, checkProps } from "../../Utils";
import { shallow, mount } from "enzyme";
import { Provider } from "react-redux";
import configureMockStore from "redux-mock-store";
import thunk from "redux-thunk";

const middlewares = [thunk];
const mockStore = configureMockStore(middlewares);

describe("Agents Pie Chart Component", () => {
  const props = {
    classes: {},
    globalClustersList: [{}],
  };
  describe("Checking PropTypes", () => {
    test("Should NOT throw Warning/ Error", () => {
      const expectedInitialProps = props;
      const propsErr = checkProps(ClustersPieChart, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders Clusters Pie Chart Dashboard Components", () => {
    let wrapper, store;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<ClustersPieChart {...props} />);
    });

    test("Should Render Clusters Pie Chart Dashboard Title Component without Errors", () => {
      const clustersPieChartTitleComp = findByTestId(wrapper, "pie-chart-title");
      expect(clustersPieChartTitleComp.length).toBe(1);
    });

    // test("Should Render Clusters Pie Chart No data display Dashboard Component Initially", () => {
    //   const clustersPieChartNoDataComp = findByTestId(wrapper, "no-data-display");
    //   expect(clustersPieChartNoDataComp.length).toBe(1);
    // });

    // test("Should Not Render Clusters Pie Chart Dashboard Component Initially", () => {
    //   const clustersPieChartComp = findByTestId(wrapper, "pie-chart");
    //   expect(clustersPieChartComp.length).toBe(0);
    // });
  });
});
