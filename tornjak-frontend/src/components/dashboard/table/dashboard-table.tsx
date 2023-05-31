import React from "react";
import { connect } from 'react-redux';
import { DataGrid, GridColDef, GridToolbar } from "@material-ui/data-grid";
import Title from '../title';
import {
  Button,
} from '@material-ui/core';
import {
  clickedDashboardTableFunc,
} from 'redux/actions';
import TornjakHelper from 'components/tornjak-helper';
import { RootState } from "redux/reducers";

type TableDashboardProp = {
  // dispatches a payload for the clicked table in a dashboard as a string and has a return type of void
  clickedDashboardTableFunc: (globalClickedDashboardTable: string) => void,
  // the clicked dashboard table
  globalClickedDashboardTable: string,
  numRows: number,
  title: string,
  columns: GridColDef[],
  data: {[key:string]:any}[]
}

type TableDashboardState = {
  selectedRows: string
}

class TableDashboard extends React.Component<TableDashboardProp, TableDashboardState> {
  TornjakHelper: TornjakHelper;
  constructor(props: TableDashboardProp) {
    super(props);
    this.state = {
      selectedRows: "",
    };
    this.TornjakHelper = new TornjakHelper({});
  }

  render() {
    const { numRows, data, columns, title } = this.props;
    return (
      <React.Fragment>
        <Title>
          <Button
            color="inherit"
            size="large"
            onClick={() => { this.props.clickedDashboardTableFunc(title.toLowerCase()); }}
          >
            {title}
          </Button>
        </Title>
        <Button //Selected Details Button
          href={this.TornjakHelper.detailsLink(this.state.selectedRows, title)}
          style={{ width: 160, marginLeft: 1040, marginBottom: 20 }}
          color="primary"
          size="small"
          variant="outlined"
          onClick={() => {
            if (this.state.selectedRows.length === 0) {
              window.alert("Please Select a Row to See Details.");
            } else {
              this.props.clickedDashboardTableFunc(title.toLowerCase() + "details")
            }
          }}
        >
          Selected Details
        </Button>
        <div style={{ width: "100%" }}>
          <DataGrid
            rows={data}
            columns={columns}
            pageSize={numRows}
            rowsPerPageOptions={[numRows]}
            autoHeight={true}
            onSelectionModelChange={(newSelection) =>{
              this.setState({ selectedRows: newSelection[0].toString() })
            }}
            components={{
              Toolbar: GridToolbar,
            }}
          />
        </div>
      </React.Fragment>
    );
  }
}

const mapStateToProps = (state:RootState) => ({
  globalClickedDashboardTable: state.tornjak.globalClickedDashboardTable,
})

export default connect(
  mapStateToProps,
  { clickedDashboardTableFunc }
)(TableDashboard);
