import React from "react";
import { PieChart } from "@carbon/charts-react";
import "@carbon/charts/styles.css";
import { connect } from "react-redux";
// import PropTypes from "prop-types";

type PieChart1Prop = {
  data: { group: string; value: number; }[]
}

type PieChart1State = {
  options: {}
}

class PieChart1 extends React.Component<PieChart1Prop, PieChart1State>{
  constructor(props:PieChart1Prop) {
    super(props);
    this.state = {
      options: {
        resizable: true,
        height: "300px",
        legend: {
          position: "right",
          truncation: {
            type: "mid_line",
            threshold: 15,
            numCharacter: 12,
          },
        },
        pie: {
          alignment: "center",
        },
      },
    };
  }

  render() {
    const { data } = this.props;
    return (
      <div data-test="pie-chart">
        <PieChart data={data} options={this.state.options} />
      </div>
    );
  }
}

const mapStateToProps = (state:PieChart1State) => ({});

// PieChart1.propTypes = {
//   data: PropTypes.array
// }
export default connect(mapStateToProps, {})(PieChart1);

export { PieChart1 };
