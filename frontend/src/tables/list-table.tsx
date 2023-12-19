import React from "react";
import { DataTable, DataTableHeader, DataTableRow, DenormalizedRow, Pagination } from "carbon-components-react";
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
    entityType: string, 
}

type DataTableRenderState = {
    page: number, 
    pageSize: number
}

class DataTableRender extends React.Component<DataTableRenderProp, DataTableRenderState> {

    constructor(props: DataTableRenderProp) {
        super(props);
        this.state = {
            page: 1, 
            pageSize: 10
        }
    }

    onChange(e: DataTableRenderState) {
        const {page, pageSize} = e;
        if (page && pageSize) {
            this.setState({page, pageSize})
        }
    }

    render() {
        const {page, pageSize} = this.state;
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
                                rows={rows.slice((page - 1) * pageSize, page * pageSize)}
                                getSelectionProps={getSelectionProps}
                            />
                        </Table>
                        <Pagination 
                            onChange={(e) => this.onChange(e)}
                            pageSizes={[2, 5, 10, 20, 50, 100]}
                            pageSize={10}
                            backwardText="Previous page"
                            forwardText="Next page"
                            totalItems={rows.length}
                        />
                    </TableContainer>
                )}
            />
        );
    }
}

export default (DataTableRender)