import React from "react";
import { connect } from 'react-redux';
import { RootState } from 'redux/reducers';
import { DataTable, DataTableCustomBatchActionsData, DataTableCustomBatchActionsProps, DenormalizedRow } from "carbon-components-react";
import { IoBan, IoDownloadOutline, IoTrashOutline } from "react-icons/io5";
import { ReactDivAttr, ShapeOf } from "carbon-components-react/typings/shared";
import TornjakHelper from 'components/tornjak-helper';
import {env} from '../env';

const {
    TableToolbar,
    TableToolbarSearch,
    TableToolbarContent,
    TableBatchActions,
    TableBatchAction,
} = DataTable;

const Auth_Server_Uri = env.REACT_APP_AUTH_SERVER_URI;

// TableToolBar takes in 
// onInputChange: onInputChange function for the search functionality from DataTable
// getBatchActionProps: getBatchActionProps function for functions on toolbar from DataTable
// deleteEntity: delete row function specified entity if applicable
// banEntity: ban row function for specified entity if applicable
// downloadEntity: returns the list of selected rows in a yaml document
// selectedRows: selectedRows from DataTable
// returns the toolbar of the table for the specified entity
type TableToolBarProp = {
    deleteEntity: (selectedRows: readonly DenormalizedRow[]) => string | void,
    banEntity: ((selectedRows: readonly DenormalizedRow[]) => string | void) | undefined,
    downloadEntity: ((selectedRows: readonly DenormalizedRow[]) => void) | undefined,
    onInputChange: (event: React.SyntheticEvent<HTMLInputElement, Event>) => void,
    getBatchActionProps: <E extends object = 
                        ReactDivAttr>(data?: ShapeOf<DataTableCustomBatchActionsData, E>) => 
                        ShapeOf<DataTableCustomBatchActionsProps, E>,
    selectedRows: readonly DenormalizedRow[],
    // updated user roles
    globalUserRoles: string[],
}

type TableToolBarState = {}

class TableToolBar extends React.Component<TableToolBarProp, TableToolBarState> {
    TornjakHelper: TornjakHelper;
    constructor(props: TableToolBarProp) {
        super(props);
        this.TornjakHelper = new TornjakHelper(props);
        this.state = {};
    }

    render() {
        return (
            <TableToolbar>
                <TableToolbarContent>
                    <TableToolbarSearch onChange={(e) => this.props.onInputChange(e)} />
                </TableToolbarContent>
                <TableBatchActions {...this.props.getBatchActionProps()}>
                    {((this.props.deleteEntity !== undefined && this.TornjakHelper.checkRolesAdminUser(this.props.globalUserRoles)) || (this.props.deleteEntity !== undefined && !Auth_Server_Uri) )&&
                        <TableBatchAction
                            renderIcon={IoTrashOutline}
                            iconDescription="Delete"
                            onClick={() => {
                                this.props.deleteEntity(this.props.selectedRows);
                                this.props.getBatchActionProps().onCancel();
                            }}
                        >
                            Delete
                        </TableBatchAction>
                    }
                    {this.props.downloadEntity !== undefined &&
                        <TableBatchAction
                            renderIcon={IoDownloadOutline}
                            iconDescription="Download"
                            onClick={() => {
                                if(this.props.downloadEntity !== undefined)
                                    this.props.downloadEntity(this.props.selectedRows);
                                this.props.getBatchActionProps().onCancel();
                            }}
                        >
                            Export to Json
                        </TableBatchAction>
                    }
                    {((this.props.banEntity !== undefined && this.TornjakHelper.checkRolesAdminUser(this.props.globalUserRoles)) || (this.props.banEntity !== undefined && !Auth_Server_Uri)) &&
                        <TableBatchAction
                            renderIcon={IoBan}
                            iconDescription="Ban"
                            onClick={() => {
                                if (this.props.banEntity !== undefined)
                                    this.props.banEntity(this.props.selectedRows);
                                this.props.getBatchActionProps().onCancel();
                            }}
                        >
                            Ban
                        </TableBatchAction>
                    }
                </TableBatchActions>
            </TableToolbar>
        )
    }
};

const mapStateToProps = (state: RootState) => ({
    globalUserRoles: state.auth.globalUserRoles,
  })
  
  export default connect(
    mapStateToProps,
    {}
  )(TableToolBar)
  
  export { TableToolBar }

//export default (TableToolBar)