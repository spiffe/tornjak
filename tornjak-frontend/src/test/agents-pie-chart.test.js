import React from "react";
import { AgentsPieChart } from "../components/dashboard/agents-pie-chart";
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
    globalAgents: {},
    globalEntries: {},
  };
  describe("Checking PropTypes", () => {
    test("Should NOT throw Warning/ Error", () => {
      const expectedInitialProps = props;
      const propsErr = checkProps(AgentsPieChart, expectedInitialProps);
      expect(propsErr).toBeUndefined();
    });
  });

  describe("Renders Agent Pie Chart Dashboard Components", () => {
    let wrapper, store;
    beforeEach(() => {
      store = mockStore(props);
      wrapper = shallow(<AgentsPieChart {...props} />);
    });

    test("Should Render Agent Pie Chart Dashboard Title Component without Errors", () => {
      const agentsPieChartTitleComp = findByTestId(wrapper, "pie-chart-title");
      expect(agentsPieChartTitleComp.length).toBe(1);
    });

    test("Should Render Agent Pie Chart No data display Dashboard Component Initially", () => {
      const agentsPieChartNoDataComp = findByTestId(wrapper, "no-data-display");
      expect(agentsPieChartNoDataComp.length).toBe(1);
    });

    test("Should Not Render Agent Pie Chart Dashboard Component Initially", () => {
      const agentsPieChartComp = findByTestId(wrapper, "pie-chart");
      expect(agentsPieChartComp.length).toBe(0);
    });
  });
});
