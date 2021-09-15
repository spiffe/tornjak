import React from "react";
import { connect } from "react-redux";
import { DataGrid, GridToolbar } from "@material-ui/data-grid";
import Title from "../title";
import { Button } from "@material-ui/core";
import { clickedDashboardTableFunc } from "redux/actions";
// import PropTypes from "prop-types";
import TornjakHelper from "components/tornjak-helper";

type TableDashboardProp = {
  numRows: number,
  data: [], 
  columns: any, 
  title: string,
  clickedDashboardTableFunc: Function
}

type TableDashboardState = {
  selectedRows: [],
}

class TableDashboard extends React.Component<TableDashboardProp, TableDashboardState> {
  TornjakHelper: TornjakHelper;
  constructor(props:TableDashboardProp) {
    super(props);
    this.state = {
      selectedRows: [],
    };
    this.TornjakHelper = new TornjakHelper();
  }

  render() {
    const { numRows, data, columns, title } = this.props;
    return (
      <React.Fragment>
        <Title data-test="entity-title">
          <Button
            color="inherit"
            size="large"
            onClick={() => {
              this.props.clickedDashboardTableFunc(title.toLowerCase());
            }}
          >
            {title}
          </Button>
        </Title>
        <Button //Selected Details Button
          data-test="entity-details-button"
          href={this.TornjakHelper.detailsLink(this.state.selectedRows, title)}
          style={{ width: 160, marginLeft: 1040, marginBottom: 20 }}
          color="primary"
          size="small"
          variant="outlined"
          onClick={() => {
            if (this.state.selectedRows.length === 0) {
              window.alert("Please Select a Row to See Details.");
            } else {
              this.props.clickedDashboardTableFunc(
                title.toLowerCase() + "details"
              );
            }
          }}
        >
          Selected Details
        </Button>
        <div style={{ width: "100%" }} data-test="entity-table">
          <DataGrid
            rows={data}
            columns={columns}
            pageSize={numRows}
            autoHeight={true}
            // onRowSelected={(selectedRows:any) => {
            //   this.setState({ selectedRows: selectedRows.data });
            // }}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state: { tornjak: { globalClickedDashboardTable: String; }; }) => ({
  globalClickedDashboardTable: state.tornjak.globalClickedDashboardTable,
});

// WorkInProgress - Leaving comments for now
// TableDashboard.propTypes = {
//   numRows: PropTypes.number,
//   data: PropTypes.array,
//   columns: PropTypes.array,
//   title: PropTypes.string,
//   clickedDashboardTableFunc: PropTypes.func,
// };

export default connect(mapStateToProps, { clickedDashboardTableFunc })(
  TableDashboard
);

export { TableDashboard };
