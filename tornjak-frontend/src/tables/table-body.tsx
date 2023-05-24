import React from "react";
import { connect } from 'react-redux';
import { RootState } from 'redux/reducers';
import { DataTable, DataTableCell, DataTableCustomSelectionData, DataTableCustomSelectionProps, DataTableRow, DenormalizedRow } from "carbon-components-react";
import WorkLoadAttestor from 'components/work-load-attestor-modal';
import { ShapeOf } from "carbon-components-react/typings/shared";
import TornjakHelper from 'components/tornjak-helper';
import {env} from '../env';

const {
    TableBody,
    TableRow,
    TableSelectRow,
    TableCell,
} = DataTable;

const Auth_Server_Uri = env.REACT_APP_AUTH_SERVER_URI;

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
    // updated user roles
    globalUserRoles: string[],
}

type BodyState = {}

class Body extends React.Component<BodyProp, BodyState> {
    TornjakHelper: TornjakHelper;
    constructor(props: BodyProp) {
        super(props);
        this.TornjakHelper = new TornjakHelper(props);
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
                        {((this.props.entityType === "Agent" && this.TornjakHelper.checkRolesAdminUser(this.props.globalUserRoles)) || (this.props.entityType === "Agent" && !Auth_Server_Uri)) &&
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

const mapStateToProps = (state: RootState) => ({
    globalUserRoles: state.auth.globalUserRoles,
  })
  
  export default connect(
    mapStateToProps,
    {}
  )(Body)
  
  export { Body }
  
//export default (Body)