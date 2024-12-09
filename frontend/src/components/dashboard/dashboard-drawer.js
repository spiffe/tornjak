import React from 'react';
import { connect } from 'react-redux';
import { withStyles } from 'tss-react/mui';
import { CssBaseline } from '@mui/material';
import { Tabs, TabList, Tab} from '@carbon/react';
import {
    clickedDashboardTableFunc,
} from 'redux/actions';

const styles = theme => ({
    root: {
        marginTop: 0,
        display: 'flex',
        flexDirection: 'column',
    },
    title: {
        flexGrow: 1,
        color: 'black',
        marginTop: 20,
    },
    content: {
        flexGrow: 1,
    },
    container: {
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
        marginLeft: 0,
    },
    paper: {
        padding: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
    },
    fixedHeight: {
        height: 370,
    },
    h3: {
        color: 'black',
        marginTop: 20,
        marginLeft: 20,
        marginBottom: 10,
    },

    tabList: {
        marginLeft: '20px', 
        marginBottom: '-80px', 
    },
});

class DashboardDrawer extends React.Component {
    constructor(props) {
        super(props);
        let selectedTab = 0;
        const path = window.location.pathname;
        if (path.includes("clusters")) {
            selectedTab = 1;
        } else if (path.includes("agents")) {
            selectedTab = 2;
        } else if (path.includes("entries")) {
            selectedTab = 3;
        }
        this.state = {
            selectedTab: selectedTab,
        };
    }

    assignDashboardPath(entity, tabIndex) {
        this.props.clickedDashboardTableFunc(entity);
        this.setState({ selectedTab: tabIndex });
        const path = "/tornjak/dashboard";
        if (window.location.href !== window.location.origin + path)
            window.location.href = path;
    }

    render() {
        const classes = withStyles.getClasses(this.props);
        return (
            <div className={classes.root}>
                <CssBaseline />
                <div style={{ display: 'flex', flexDirection: 'column'}}>
                    <h3 className={classes.h3}>Tornjak Dashboard</h3>
                </div>
                <Tabs selectedIndex={this.state.selectedTab}>
                    <TabList aria-label="List of tabs" className={classes.tabList}>
                        <Tab onClick={() => this.assignDashboardPath("dashboard", 0)}>Dashboard</Tab>
                        <Tab onClick={() => this.assignDashboardPath("clusters", 1)}>Clusters</Tab>
                        <Tab onClick={() => this.assignDashboardPath("agents", 2)}>Agents</Tab>
                        <Tab onClick={() => this.assignDashboardPath("entries", 3)}>Entries</Tab>
                    </TabList>

                </Tabs>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    globalClickedDashboardTable: state.tornjak.globalClickedDashboardTable,
});

const DashboardDrawerStyled = withStyles(DashboardDrawer, styles);
export default connect(mapStateToProps, { clickedDashboardTableFunc })(DashboardDrawerStyled);
