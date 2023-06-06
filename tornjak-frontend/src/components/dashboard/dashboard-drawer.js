import React from 'react';
import { connect } from 'react-redux';
import clsx from 'clsx';
import { withStyles } from 'tss-react/mui';
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
} from '@mui/material';
// Icons
import MenuIcon from '@mui/icons-material/Menu';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import BarChartIcon from '@mui/icons-material/BarChart';
import LayersIcon from '@mui/icons-material/Layers';
import {
    clickedDashboardTableFunc,
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
        backgroundColor: 'lightgrey',
        marginTop: 48,
        zIndex: 2,
        height: 80,
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
        marginTop: 20
    },
    menuButtonHidden: { //menu button next to Tornjak Dashboard title on hidden
        display: 'none',
    },
    title: {
        flexGrow: 1,
        color: 'black',
        marginTop: 20
    },
    drawerPaper: { //dashboard side drawer on open
        position: 'relative',
        whiteSpace: 'nowrap',
        marginLeft: -20,
        top: 10,
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
    menuIcon: {
        color: "black", //height of piechart container
    },
    drawerdivider: {
        marginTop: 16,
    }
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
        this.props.clickedDashboardTableFunc(entity);
        const path = "/tornjak/dashboard";
        if (window.location.href !== window.location.origin + path)
            window.location.href = path;
    }

    render() {
        const classes = withStyles.getClasses(this.props);
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
                            <MenuIcon
                                className={classes.menuIcon}
                                color="inherit" />
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
                    <Divider 
                        className={classes.drawerdivider}/>
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

const DashboardDrawerStyled = withStyles(DashboardDrawer, styles);
export default connect(mapStateToProps, { clickedDashboardTableFunc })(DashboardDrawerStyled);