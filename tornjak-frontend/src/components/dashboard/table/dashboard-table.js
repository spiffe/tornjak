import React from "react";
import { connect } from 'react-redux';
import { DataGrid, GridToolbar } from "@material-ui/data-grid";
import Title from '../title';
import {
  Button,
} from '@material-ui/core';
import {
  clickedDashboardTabelFunc,
} from 'redux/actions';
class TableDashboard extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
    };
  }

  render() {
    const { numRows, tableType, data, columns, title } = this.props, viewConst = 70, limitedViewRows = 5;
    var tableHeight = 0;
    if (tableType === "expandedView") {
      if (data.length < 2) {
        tableHeight = 200; //const table height if numRows is less than 2
      } else { tableHeight = data.length * viewConst; } //multiply by a constant to keep table height consistent}
    } else if (tableType === "limitedView") { tableHeight = limitedViewRows * viewConst; }
    return (
      <React.Fragment>
        <Title>
          <Button
            color="inherit"
            size="large"
            onClick={() => { this.props.clickedDashboardTabelFunc(title.toLowerCase()); }}
          >
            {title}
          </Button>
        </Title>
        <div style={{ height: tableHeight, width: "100%" }}>
          <DataGrid
            rows={data}
            columns={columns}
            pageSize={numRows}
            checkboxSelection
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = state => ({
  globalClickedDashboardTable: state.tornjak.globalClickedDashboardTable
})

export default connect(
  mapStateToProps,
  { clickedDashboardTabelFunc }
)(TableDashboard);
