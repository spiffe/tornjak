import React from "react";
import { DataTable } from "carbon-components-react";
const {
    TableHead,
    TableRow,
    TableSelectAll,
    TableHeader,
} = DataTable;

// Head takes in getSelectionProps function for selecting all rows from DataTable, 
// headerData of table and getHeaderProps functiin from DataTable
// Head returns header of the table for the specified entity
class Head extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { getSelectionProps, headers, getHeaderProps } = this.props;
        return (
            <TableHead>
                <TableRow>
                    <TableSelectAll {...getSelectionProps()} />
                    {headers.map((header) => (
                        <TableHeader key={header.header} {...getHeaderProps({ header })}>
                            {header.header}
                        </TableHeader>
                    ))}
                </TableRow>
            </TableHead>
        )
    }
};

export default (Head)
