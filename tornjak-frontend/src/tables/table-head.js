import React from "react";
import { DataTable } from "carbon-components-react";
const {
    TableHead,
    TableRow,
    TableSelectAll,
    TableHeader,
} = DataTable;

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
