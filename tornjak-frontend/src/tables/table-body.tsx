import React from "react";
import { DataTable } from "carbon-components-react";
import WorkLoadAttestor from 'components/work-load-attestor-modal';
const {
    TableBody,
    TableRow,
    TableSelectRow,
    TableCell,
} = DataTable;

// Body take in 
// entityType: type of entity 
// rows: rows of data to be rendered on table body
// getSelectionProps: getSelectionProps func for selecting rows from DataTable
// returns the body of the table for the specified entity

type BodyProp = {
    rows: any,
    entityType: any,
    getSelectionProps: any,
}

type BodyState = {
    
}
class Body extends React.Component<BodyProp, BodyState> {
    constructor(props: BodyProp) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <TableBody>
                {this.props.rows.map((row: { cells: any[]; }, key: React.Key | null | undefined) => (
                    <TableRow key={key}>
                        <TableSelectRow {...this.props.getSelectionProps({ row })} />
                        {row.cells.map((cell: { id: React.Key | null | undefined; info: { header: string; }; value: {} | null | undefined; }) => (
                            <TableCell key={cell.id}>
                                {cell.info.header === "info" ? (
                                    <div style={{ overflowX: 'auto', width: "400px" }}>
                                        <pre>{cell.value}</pre>
                                    </div>
                                ) : (
                                    cell.value)}
                            </TableCell>
                        ))}
                        {this.props.entityType === "Agent" &&
                            <TableCell>
                                <div>
                                    <WorkLoadAttestor
                                        spiffeid={row.cells[2].value}
                                        agentData={row}
                                    />
                                </div>
                            </TableCell>
                        }
                    </TableRow>
                ))}
            </TableBody>
        )
    }
};

export default (Body)
