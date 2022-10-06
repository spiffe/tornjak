import React from "react";
import { DataTable, DataTableHeader, DataTableRow, DenormalizedRow } from "carbon-components-react";
import ToolBar from './table-toolbar';
import Head from './table-head';
import Body from './table-body';
const {
    TableContainer,
    Table,
} = DataTable;

// DataTableRender takes in 
// entityType: type of entity, 
// listTableData: data to be rendered on table, 
// headerData: headerData of table, 
// deleteEntity: delete row function for specified entity
// banEntity: ban row function for specified entity if applicable
// downloadEntity: returns the list of selected rows in a yaml document
// returns data inside a carbon component table with specified functions for entity

type DataTableRenderProp = {
    listTableData: DataTableRow<string>[],
    headerData: DataTableHeader<string>[],
    deleteEntity: (selectedRows: readonly DenormalizedRow[]) => string | void,
    banEntity: ((selectedRows: readonly DenormalizedRow[]) => string | void) | undefined,
    downloadEntity: ((selectedRows: readonly DenormalizedRow[]) => string | undefined | void) | undefined,
    entityType: string
}

type DataTableRenderState = {}

class DataTableRender extends React.Component<DataTableRenderProp, DataTableRenderState> {
    constructor(props: DataTableRenderProp) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <DataTable
                isSortable
                rows={this.props.listTableData}
                headers={this.props.headerData}
                render={({
                    rows,
                    headers,
                    getHeaderProps,
                    getSelectionProps,
                    onInputChange,
                    //getPaginationProps,
                    getBatchActionProps,
                    getTableContainerProps,
                    selectedRows,
                }) => (
                    <TableContainer
                        {...getTableContainerProps()}
                    >
                        <ToolBar
                            onInputChange={onInputChange}
                            getBatchActionProps={getBatchActionProps}
                            deleteEntity={this.props.deleteEntity}
                            banEntity={this.props.banEntity}
                            downloadEntity={this.props.downloadEntity}
                            selectedRows={selectedRows}
                        />
                        <Table size="short" useZebraStyles>
                            <Head
                                getHeaderProps={getHeaderProps}
                                getSelectionProps={getSelectionProps}
                                headers={headers}
                            />
                            <Body
                                entityType={this.props.entityType}
                                rows={rows}
                                getSelectionProps={getSelectionProps}
                            />
                        </Table>
                    </TableContainer>
                )}
            />
        );
    }
}

export default (DataTableRender)