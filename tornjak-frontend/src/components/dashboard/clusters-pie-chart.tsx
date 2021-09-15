import React from "react";
import Title from "./title";
import { connect } from "react-redux";
import PieChart1 from "../../charts/PieChart";
// import PropTypes from "prop-types";

type ClustersPieChartProp = {
  globalClustersList: [],
  
}

type ClustersPieChartState = {}

class ClustersPieChart extends React.Component<ClustersPieChartProp, ClustersPieChartState> {
  cluster(entry: { agentsList: []; creationTime: string; domainName: string; editedName: string; managedBy: string; name: string; platformType: number; }):{ group: string; value: number; } {
    if(entry === undefined || entry.agentsList === undefined) {
      return {
        group: "",
        value: 0,
      };
    }
    return {
      group: entry.name,
      value: entry.agentsList.length,
    };
  }

  clusterList() {
    if (typeof this.props.globalClustersList !== "undefined" && this.props.globalClustersList.length !== 0) {
      return this.props.globalClustersList.map((currentCluster: any) => {
        return this.cluster(currentCluster);
      });
    } else {
      return [];
    }
  }

  render() {
    var sections = this.clusterList();
    return (
      <React.Fragment>
        <Title data-test="pie-chart-title">Number of Agents per Cluster</Title>
        {(sections.length === 0 || sections === undefined) && (
          <p className="no-data" data-test="no-data-display">
            No Data To Display
          </p>
        )}
        {sections.length !== 0 && (
          <PieChart1 data-test="pie-chart" data={sections} />
        )}
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: { clusters: { globalClustersList: []; }; }) => ({
  globalClustersList: state.clusters.globalClustersList,
});

// ClustersPieChart.propTypes = {
//   classes: PropTypes.object,
//   globalClustersList: PropTypes.array,
// };

export default connect(mapStateToProps, {})(ClustersPieChart);

export { ClustersPieChart };
