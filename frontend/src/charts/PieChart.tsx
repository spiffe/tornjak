import React from "react";
import { PieChart } from "@carbon/charts-react";
import "@carbon/charts/styles.css";
import "@carbon/styles/css/styles.css";
import { connect } from 'react-redux';
import { RootState } from "redux/reducers";
import { Alignments, LegendPositions, PieChartOptions } from "@carbon/charts";
import { PieChartEntry } from "components/types";


type PieChartProps = {
  data: PieChartEntry[],
  title: string
}

type PieChartState = {
  options: PieChartOptions
}

class PieChart1 extends React.Component<PieChartProps, PieChartState> {
  constructor(props:PieChartProps) {
    super(props);
    this.state = {
      options: {
        title: props.title,
        resizable: true,
        height: "300px",
        legend: {
          position: LegendPositions.RIGHT,
          truncation: {
            "type": "mid_line",
            "threshold": 15,
            "numCharacter": 12
          },
        },
        pie: {
          alignment: Alignments.CENTER,
        }
      }
    };
  }

  render() {
    const { data, title } = this.props;
    return (
      <div>
          <h3 style={{ fontSize: '18px' }}>{title}</h3>
          <PieChart
            data={data}
            options={this.state.options}
          />
      </div>
    );
  }
}

const mapStateToProps = (state: RootState) => ({
})

export default connect(
  mapStateToProps,
  {}
  )(PieChart1);