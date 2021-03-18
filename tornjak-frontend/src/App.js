import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route} from "react-router-dom";
import Navbar from "./components/navbar.component"
import SelectServer from "./components/select-server.component"
import AgentList from "./components/agent-list.component";
import CreateJoinToken from "./components/agent-create-join-token.component";
import EntryList from "./components/entry-list.component";
import EntryCreate from "./components/entry-create.component";
import ServerManagement from "./components/server-management.component";
import TornjakServerInfo from "./components/tornjak-server-info.component";
import { Provider} from 'react-redux'; //enables all components to have acces to everything inside our react app
import store from './store';

function App() {
    return (
        <Provider store={store}>
            <Router>
                <div className="container">
                    <Navbar />
                    <br />
                    <SelectServer />
                    <br />
                    <Route path="/" exact component={AgentList} />
                    <Route path="/agents" exact component={AgentList} />
                    <Route path="/entries" exact component={EntryList} />
                    <Route path="/entry/create" exact component={EntryCreate} />
                    <Route path="/agent/createjointoken" exact component={CreateJoinToken} />
                    <Route path="/tornjak/serverinfo" exact component={TornjakServerInfo} />
                    <Route path="/server/manage" exact component={ServerManagement} />
                </div>
            </Router>
        </Provider>
    );
}

export default App;
