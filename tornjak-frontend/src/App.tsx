import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import store from 'redux/store';
import IsManager from './components/is_manager';
import { BrowserRouter as Router, Route } from "react-router-dom";
import { Provider } from 'react-redux'; //enables all components to have access to everything inside our react app
import NavigationBar from "./components/navbar";
import SelectServer from "./components/select-server";
import ClusterList from "./components/cluster-list";
import ClusterManagement from "./components/cluster-management";
import AgentList from "./components/agent-list";
import CreateJoinToken from "./components/agent-create-join-token";
import EntryList from "./components/entry-list";
import EntryCreate from "./components/entry-create";
import ServerManagement from "./components/server-management";
import TornjakServerInfo from "./components/tornjak-server-info";
import TornjakDashBoard from "./components/dashboard/tornjak-dashboard";
import DashboardDetailsRender from 'components/dashboard/dashboard-details-render';
import { ToastContainer } from 'react-toastify';
import './App.css';
import 'react-toastify/dist/ReactToastify.css';

function App() {
    return (
        <Provider store={store}>
            <Router>
                <div>
                    <div className="nav-comp">
                        <NavigationBar />
                    </div>
                    <ToastContainer
                        className="carbon-toast"
                        containerId="notifications"
                        draggable={false}
                    />
                    <div className="rest-body">
                        <SelectServer />
                        <br />
                        {IsManager && <br />}
                        <Route path="/" exact component={AgentList} />
                        <Route path="/clusters" exact component={ClusterList} />
                        <Route path="/agents" exact component={AgentList} />
                        <Route path="/entries" exact component={EntryList} />
                        <Route path="/entry/create" exact component={EntryCreate} />
                        <Route path="/agent/createjointoken" exact component={CreateJoinToken} />
                        <Route path="/cluster/clustermanagement" exact component={ClusterManagement} />
                        <Route path="/tornjak/serverinfo" exact component={TornjakServerInfo} />
                        <Route path="/tornjak/dashboard" exact component={TornjakDashBoard} />
                        <Route
                            path="/tornjak/dashboard/details/:entity"
                            render={(props) => (<DashboardDetailsRender {...props} params={props.match.params} />)}
                        />
                        <Route path="/server/manage" exact component={ServerManagement} />
                        <br /><br /><br />
                        <svg className="endbanneroutput">
                            <rect className="endbanneroutput"></rect>
                        </svg>
                    </div>
                </div>
            </Router>
        </Provider>
    );
}

export default App;
