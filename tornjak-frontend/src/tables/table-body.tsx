import React from "react";
import { DataTable, DataTableCell, DataTableCustomSelectionData, DataTableCustomSelectionProps, DataTableRow, DenormalizedRow } from "carbon-components-react";
import WorkLoadAttestor from 'components/work-load-attestor-modal';
import { ShapeOf } from "carbon-components-react/typings/shared";
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
    rows: readonly DenormalizedRow[],
    entityType: string,
    getSelectionProps: <E extends object = {}>(data?: 
                        ShapeOf<DataTableCustomSelectionData<DataTableRow<string>>, E> | undefined) => 
                        ShapeOf<DataTableCustomSelectionProps<DataTableRow<string>>, E> | 
                        ShapeOf<DataTableCustomSelectionProps<never>, E>,
}

type BodyState = {}

class Body extends React.Component<BodyProp, BodyState> {
    constructor(props: BodyProp) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <TableBody>
                {this.props.rows.map((row: { cells: DataTableCell[]; } & DataTableRow<string>, key: React.Key | null | undefined) => (
                    <TableRow key={key}>
                        <TableSelectRow {...this.props.getSelectionProps({ row })} />
                        {row.cells.map((cell) => (
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