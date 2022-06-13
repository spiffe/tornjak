import React from "react";
import { DataTable, DataTableCustomBatchActionsData, DataTableCustomBatchActionsProps, DenormalizedRow } from "carbon-components-react";
import {
    Delete16 as Delete,
} from '@carbon/icons-react';
import { IoBan, IoDownloadOutline } from "react-icons/io5";
import { ReactDivAttr, ShapeOf } from "carbon-components-react/typings/shared";
const {
    TableToolbar,
    TableToolbarSearch,
    TableToolbarContent,
    TableBatchActions,
    TableBatchAction,
} = DataTable;

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
}

type TableToolBarState = {}

class TableToolBar extends React.Component<TableToolBarProp, TableToolBarState> {
    constructor(props: TableToolBarProp) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <TableToolbar>
                <TableToolbarContent>
                    <TableToolbarSearch onChange={(e) => this.props.onInputChange(e)} />
                </TableToolbarContent>
                <TableBatchActions {...this.props.getBatchActionProps()}>
                    {this.props.deleteEntity !== undefined &&
                        <TableBatchAction
                            renderIcon={Delete}
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
                            Export to Yaml
                        </TableBatchAction>
                    }
                    {this.props.banEntity !== undefined &&
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

export default (TableToolBar)