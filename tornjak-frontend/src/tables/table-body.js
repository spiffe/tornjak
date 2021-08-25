import React from "react";
import { DataTable } from "carbon-components-react";
import WorkLoadAttestor from 'components/work-load-attestor-modal';
const {
    TableBody,
    TableRow,
    TableSelectRow,
    TableCell,
} = DataTable;

class Body extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
    }

    render() {
        const { entityType, rows, getSelectionProps } = this.props;
        return (
            <TableBody>
                {rows.map((row, key) => (
                    <TableRow key={key}>
                        <TableSelectRow {...getSelectionProps({ row })} />
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
                        {entityType === "Agent" &&
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
