import React from 'react';
import { connect } from 'react-redux';
import PieChart1 from "charts/PieChart";
import { RootState } from 'redux/reducers';

type ClustersPieChartProps = {
  globalClustersList: Array<{ [key: string]: any }>;
}

class ClustersPieChart extends React.Component<ClustersPieChartProps, {}> {
  cluster(entry: { [key: string]: any }) {
    return {
      "group": entry.name,
      "value": entry.agentsList.length
    }
  }

  clusterList() {
    if (typeof this.props.globalClustersList !== 'undefined') {
      return this.props.globalClustersList.map(currentCluster => {
        return this.cluster(currentCluster);
      })
    } else {
      return []
    }
  }

  render() {
    var sections = this.clusterList()
    return (
      <React.Fragment>
        {sections.length === 0 &&
          <p className="no-data">No Data To Display</p>
        }
        {sections.length !== 0 &&
          <PieChart1
            data={sections}
            title='Number of Agents per Cluster'
          />
        }
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
  globalClustersList: state.clusters.globalClustersList,
})

export default connect(mapStateToProps, {})(ClustersPieChart)
