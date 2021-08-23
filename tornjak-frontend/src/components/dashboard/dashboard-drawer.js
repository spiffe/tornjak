import React from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import { withStyles } from '@material-ui/core/styles';
// Components
import {
    CssBaseline,
    Drawer,
    AppBar,
    Toolbar,
    List,
    Typography,
    Divider,
    IconButton,
    ListItem,
    ListItemIcon,
    ListItemText,
    ListSubheader,
} from '@material-ui/core';
// Icons
import MenuIcon from '@material-ui/icons/Menu';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import DashboardIcon from '@material-ui/icons/Dashboard';
import PeopleIcon from '@material-ui/icons/People';
import BarChartIcon from '@material-ui/icons/BarChart';
import LayersIcon from '@material-ui/icons/Layers';
import {
    clickedDashboardTabelFunc,
} from 'redux/actions';
const drawerWidth = 240;
const drawerHeight = '100%';

const styles = theme => ({
    root: {
        marginTop: -25,
        marginLeft: -20,
        display: 'flex',
    },
    toolbar: {
        paddingRight: 24, // keep right padding when drawer closed
    },
    toolbarIcon: { //drawer icon close
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'flex-end',
        padding: '0 8px',
        ...theme.mixins.toolbar,
    },
    appBar: { //appbar
        backgroundColor: 'grey',
        marginTop: 52,
        zIndex: 2,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
    },
    appBarShift: { //appbar on shift/ open
        marginLeft: drawerWidth,
        width: `calc(100% - ${drawerWidth}px)`,
        transition: theme.transitions.create(['width', 'margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    menuButton: { //menu button next to Tornjak Dashboard title on view
        marginRight: 35,
    },
    menuButtonHidden: { //menu button next to Tornjak Dashboard title on hidden
        display: 'none',
    },
    title: {
        flexGrow: 1,
    },
    drawerPaper: { //dashboard side drawer on open
        position: 'relative',
        whiteSpace: 'nowrap',
        zIndex: 1,
        width: drawerWidth,
        height: drawerHeight,
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
        }),
    },
    drawerPaperClose: { //dashboard side drawer on close
        overflowX: 'hidden',
        transition: theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
        }),
        width: theme.spacing(7),
        [theme.breakpoints.up('sm')]: {
            width: theme.spacing(9),
        },
    },
    appBarSpacer: theme.mixins.toolbar,
    content: {
        flexGrow: 1,
    },
    container: { //container for root
        paddingTop: theme.spacing(4),
        paddingBottom: theme.spacing(4),
        marginLeft: 0
    },
    paper: { //container for all grids
        padding: theme.spacing(2),
        display: 'flex',
        overflow: 'auto',
        flexDirection: 'column',
        marginBottom: 20
    },
    fixedHeight: {
        height: 370, //height of piechart container
    },
});

class DashboardDrawer extends React.Component {
    constructor(props) {
        super(props);
        const { classes } = this.props;
        this.state = {
            open: true,
        };
        this.handleDrawerOpen = () => this.setState({ open: true })
        this.handleDrawerClose = () => this.setState({ open: false })
        this.fixedHeightPaper = clsx(classes.paper, classes.fixedHeight)
        this.assignDashboardPath = this.assignDashboardPath.bind(this);
    }

    assignDashboardPath(entity) {
        this.props.clickedDashboardTabelFunc(entity);
        const path = "/tornjak/dashboard";
        if (window.location.href !== window.location.origin + path)
            window.location.href = path;
    }

    render() {
        const { classes } = this.props;
        return (
            <div>
                <CssBaseline />
                <AppBar position="absolute" className={clsx(classes.appBar, this.state.open && classes.appBarShift)}>
                    <Toolbar className={classes.toolbar}>
                        <IconButton
                            edge="start"
                            color="inherit"
                            aria-label="open drawer"
                            onClick={this.handleDrawerOpen}
                            className={clsx(classes.menuButton, this.state.open && classes.menuButtonHidden)}
                        >
                            <MenuIcon />
                        </IconButton>
                        <Typography component="h1" variant="h6" color="inherit" noWrap className={classes.title}>
                            Tornjak Dashboard
                        </Typography>
                    </Toolbar>
                </AppBar>
                <Drawer
                    variant="permanent"
                    classes={{
                        paper: clsx(classes.drawerPaper, !this.state.open && classes.drawerPaperClose),
                    }}
                    open={this.state.open}
                >
                    <div className={classes.toolbarIcon}>
                        <IconButton onClick={this.handleDrawerClose}>
                            <ChevronLeftIcon />
                        </IconButton>
                    </div>
                    <Divider />
                    <List>
                        <div>
                            <ListItem
                                button
                                onClick={() => {
                                    this.assignDashboardPath("dashboard");
                                }}>
                                <ListItemIcon>
                                    <DashboardIcon />
                                </ListItemIcon>
                                <ListItemText primary="Dashboard" />
                            </ListItem>
                            <ListSubheader inset>Details</ListSubheader>
                            <ListItem
                                button
                                onClick={() => {
                                    this.assignDashboardPath("clusters");
                                }}>
                                <ListItemIcon>
                                    <LayersIcon />
                                </ListItemIcon>
                                <ListItemText primary="Clusters" />
                            </ListItem>
                            <ListItem
                                button
                                onClick={() => {
                                    this.assignDashboardPath("agents");
                                }}>
                                <ListItemIcon>
                                    <PeopleIcon />
                                </ListItemIcon>
                                <ListItemText primary="Agents" />
                            </ListItem>
                            <ListItem
                                button
                                onClick={() => {
                                    this.assignDashboardPath("entries");
                                }}>
                                <ListItemIcon>
                                    <BarChartIcon />
                                </ListItemIcon>
                                <ListItemText primary="Entries" />
                            </ListItem>
                        </div>
                    </List>
                    <Divider />
                </Drawer>
            </div>
        );
    }

}

const mapStateToProps = (state) => ({
    globalClickedDashboardTable: state.tornjak.globalClickedDashboardTable,
})

export default withStyles(styles)(
    connect(mapStateToProps, { clickedDashboardTabelFunc })(DashboardDrawer)
)
