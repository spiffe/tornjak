import React from "react";
import { DataTable } from "carbon-components-react";
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
// returns data inside a carbon component table with specified functions for entity
class DataTableRender extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { entityType, listTableData, headerData, deleteEntity, banEntity } = this.props;
        return (
            <DataTable
                isSortable
                rows={listTableData}
                headers={headerData}
                render={({
                    rows,
                    headers,
                    getHeaderProps,
                    getSelectionProps,
                    onInputChange,
                    getPaginationProps,
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
                            deleteEntity={deleteEntity}
                            banEntity={banEntity}
                            selectedRows={selectedRows}
                        />
                        <Table size="short" useZebraStyles>
                            <Head
                                getHeaderProps={getHeaderProps}
                                getSelectionProps={getSelectionProps}
                                headers={headers}
                            />
                            <Body
                                entityType={entityType}
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
