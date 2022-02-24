import React from "react";
import { DataTable } from "carbon-components-react";
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
    headers: any,
    getSelectionProps: any,
    getHeaderProps: any,
}

type HeadState = {
    
}
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
                    {this.props.headers.map((header: { header: {} | null | undefined; }) => (
                        <TableHeader key={header.header} {...this.props.getHeaderProps({ header })}>
                            {header.header}
                        </TableHeader>
                    ))}
                </TableRow>
            </TableHead>
        )
    }
};

export default (Head)
