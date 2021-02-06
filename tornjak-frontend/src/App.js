import React from 'react';
import "bootstrap/dist/css/bootstrap.min.css";
import { BrowserRouter as Router, Route} from "react-router-dom";
import Navbar from "./components/navbar.component"
import AgentList from "./components/agent-list.component";
import CreateJoinToken from "./components/agent-create-join-token.component";
import EntryList from "./components/entry-list.component";
import EntryCreate from "./components/entry-create.component";
import ServerManagement from "./components/server-management.component";



function App() {
    return (
        <Router>
            <div className="container">
                <Navbar />
                <br />
                <Route path="/" exact component={AgentList} />
                <Route path="/agents" exact component={AgentList} />
                <Route path="/entries" exact component={EntryList} />
                <Route path="/entry/create" exact component={EntryCreate} />
                <Route path="/agent/createjointoken" exact component={CreateJoinToken} />
                <Route path="/server/manage" exact component={ServerManagement} />
            </div>
        </Router>
    );
}

export default App;
