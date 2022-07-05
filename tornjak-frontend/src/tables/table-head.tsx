import React from "react";
import { DataTable, DataTableCustomHeaderData, DataTableCustomHeaderProps, DataTableCustomSelectionData, DataTableCustomSelectionProps, DataTableHeader, DataTableRow } from "carbon-components-react";
import { ReactAttr, ShapeOf } from "carbon-components-react/typings/shared";
const {
    TableHead,
    TableRow,
    TableSelectAll,
    TableHeader,
} = DataTable;

// Head takes in 
// getSelectionProps: getSelectionProps function for selecting all rows from DataTable
// headers: headerData of table
// getHeaderProps: getHeaderProps function from DataTable
// returns header of the table for the specified entity
type HeadProp = {
    headers: DataTableHeader<string>[],
    getSelectionProps: <E extends object = {}>(data?: 
                        ShapeOf<DataTableCustomSelectionData<DataTableRow<string>>, E> | undefined) => 
                        ShapeOf<DataTableCustomSelectionProps<DataTableRow<string>>, E> | 
                        ShapeOf<DataTableCustomSelectionProps<never>, E>,
    getHeaderProps: <E extends object = 
                    ReactAttr<HTMLElement>>(data: ShapeOf<DataTableCustomHeaderData<DataTableHeader<string>>, E>) => 
                    ShapeOf<DataTableCustomHeaderProps<DataTableHeader<string>>, E>,
}

type HeadState = {}
class Head extends React.Component<HeadProp, HeadState> {
    constructor(props: HeadProp) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <TableHead>
                <TableRow>
                    <TableSelectAll {...this.props.getSelectionProps()} />
                    {this.props.headers.map((header: DataTableHeader<string>) => (
                        <TableHeader {...this.props.getHeaderProps({ header })}>
                            {header.header}
                        </TableHeader>
                    ))}
                </TableRow>
            </TableHead>
        )
    }
};

export default (Head)