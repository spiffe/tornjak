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
import TornjakHelper from 'components/tornjak-helper';

class TableDashboard extends React.Component {
  constructor(props) {
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
        <Title>
          <Button
            color="inherit"
            size="large"
            onClick={() => { this.props.clickedDashboardTabelFunc(title.toLowerCase()); }}
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
              this.props.clickedDashboardTabelFunc(title.toLowerCase() + "details")
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
            autoHeight={true}
            onRowSelected={(selectedRows) => {
              this.setState({ selectedRows: selectedRows.data })
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

const mapStateToProps = state => ({
  globalClickedDashboardTable: state.tornjak.globalClickedDashboardTable,
})

export default connect(
  mapStateToProps,
  { clickedDashboardTabelFunc }
)(TableDashboard);
