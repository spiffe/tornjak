import React from "react";
import { PieChart } from "@carbon/charts-react";
import "@carbon/charts/styles.css";
import { connect } from 'react-redux';
class PieChart1 extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      options: {
        resizable: true,
        height: "300px",
        legend: {
          alignment: "center"
        },
        pie: {
          alignment: "center"
        }
      }
    };
  }

  render() {
    const { data } = this.props;
    return (
      <div>
        <div>
        </div>
          <PieChart
            data={data}
            options={this.state.options}
          />
      </div>
    );
  }
}

const mapStateToProps = state => ({
})

export default connect(
  mapStateToProps,
  {}
  )(PieChart1);
