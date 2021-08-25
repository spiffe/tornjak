import React from "react";
import { DataTable } from "carbon-components-react";
import {
    Delete16 as Delete,
} from '@carbon/icons-react';
import ResetIcon from "@carbon/icons-react/es/reset--alt/20";
const {
    TableToolbar,
    TableToolbarSearch,
    TableToolbarContent,
    TableBatchActions,
    TableBatchAction,
} = DataTable;

class TableToolBar extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { onInputChange, getBatchActionProps, deleteEntity, banEntity, selectedRows } = this.props;
        return (
            <TableToolbar>
                <TableToolbarContent>
                    <TableToolbarSearch onChange={(e) => onInputChange(e)} />
                </TableToolbarContent>
                <TableBatchActions {...getBatchActionProps()}>
                    {deleteEntity !== undefined &&
                        <TableBatchAction
                            renderIcon={Delete}
                            iconDescription="Delete"
                            onClick={() => {
                                deleteEntity(selectedRows);
                                getBatchActionProps().onCancel();
                            }}
                        >
                            Delete
                        </TableBatchAction>
                    }
                    {banEntity !== undefined &&
                        <TableBatchAction
                            renderIcon={ResetIcon}
                            iconDescription="Ban"
                            onClick={() => {
                                banEntity(selectedRows);
                                getBatchActionProps().onCancel();
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
