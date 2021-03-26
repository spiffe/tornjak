import React from "react";
import { DataTable } from "carbon-components-react";
const {
    TableContainer,
    Table,
    TableHead,
    TableRow,
    TableBody,
    TableCell,
    TableHeader,
    TableSelectRow,
    TableSelectAll,
    TableToolbar,
    TableToolbarSearch,
    TableToolbarContent,
} = DataTable;

class DataTableRender extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            listData: props.data,
            listTableData: [{}]
        };
        this.prepareTableData = this.prepareTableData.bind(this);
    }

    componentDidMount() {
        //this.prepareTableData();
    }
    componentDidUpdate(prevProps, prevState) {
        if (prevProps !== this.props)
            this.prepareTableData();
    }

    prepareTableData() {
        const { data } = this.props;
        console.log("data", data)
        let listData = [...data];
        let listtabledata = [];
        let firstDeal = "", firstGroup = "", i = 0, j = 0, index = 0;
        for (i = 0; i < listData.length; i++) {
            listtabledata[i] = {}
            listtabledata[i]["trustdomain"] = listData[i].props.agent.id.trust_domain
            listtabledata[i]["id"] = "spiffe://" + listData[i].props.agent.id.trust_domain + listData[i].props.agent.id.path
            listtabledata[i]["info"] = JSON.stringify(listData[i].props.agent)
            //listtabledata[i]["actions"] = {}
            //listtabledata[i]["actions"]["banAgent"] = listData[i].props.banAgent
            //listtabledata[i]["actions"]["deleteAgent"] = listData[i].props.deleteAgent
        }
        this.setState({
            listTableData: listtabledata
          })
        //console.log("listtabledata", listtabledata)
    }
    render() {
        const { listTableData } = this.state;
        const { data } = this.props;
        console.log("listTableData", listTableData)
        /* var headerData = [], i = 0, keys = Object.keys(listTableData[0]);
        for(i=0; i < keys.length; i++)
          headerData.push({"key": keys[i], "header": keys[i].toUpperCase()}) */
        const headerData = [
            {
                header: 'Trust Domain',
                key: 'trustdomain',
            },
            {
                header: 'SPIFFE ID',
                key: 'id',
            },
            {
                header: 'Info',
                key: 'info',
            },
            // {
            //     header: 'Actions',
            //     key: 'id',
            // },
        ];
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
                }) => (
                    <TableContainer
                        {...getTableContainerProps()}
                    >
                        <TableToolbar>
                            <TableToolbarContent>
                                <TableToolbarSearch onChange={(e) => onInputChange(e)} />
                            </TableToolbarContent>
                        </TableToolbar>
                        <Table size="short" useZebraStyles>
                            <TableHead>
                                <TableRow>
                                    <TableSelectAll {...getSelectionProps()} />
                                    {headers.map((header) => (
                                        <TableHeader {...getHeaderProps({ header })}>
                                            {header.header}
                                        </TableHeader>
                                    ))}
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {rows.map((row) => (
                                    <TableRow key={row.id}>
                                        <TableSelectRow {...getSelectionProps({ row })} />
                                        {row.cells.map((cell) => (
                                            <TableCell key={cell.id}>{cell.value}</TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            />
        );
    }
}

export default DataTableRender;
