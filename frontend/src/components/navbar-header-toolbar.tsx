import { Component } from 'react';
import { HeaderGlobalAction } from "carbon-components-react";
import { UserAvatar, Notification, Search } from "@carbon/icons-react";
import KeycloakService from "auth/KeycloakAuth";
import {env} from '../env';

const Auth_Server_Uri = env.REACT_APP_AUTH_SERVER_URI;

type HeaderToolBarProp = {}

type HeaderToolBarState = {}

class HeaderToolBar extends Component<HeaderToolBarProp, HeaderToolBarState> {
    constructor(props: HeaderToolBarProp) {
        super(props);
        this.state = {};
    }

    render() {
        return (
            <div className='header-toolbar'>
                {Auth_Server_Uri &&
                    <div className="user-dropdown">
                        <HeaderGlobalAction
                            aria-label="User">
                            <UserAvatar />
                        </HeaderGlobalAction>
                        <div className="user-dropdown-content">
                            {KeycloakService.isLoggedIn() && (
                                // eslint-disable-next-line
                                <a
                                    href="#"
                                    className="nav-link"
                                    onClick={() => KeycloakService.doLogout()}>
                                    Logout {KeycloakService.getFirstName()}
                                </a>
                            )}
                        </div>
                    </div>
                }
                
                <HeaderGlobalAction
                    aria-label="Notifications"
                    onClick={() => { alert("This is a place holder, functionality to be implemented on future work!") }}>
                    <Notification />
                </HeaderGlobalAction>
                <HeaderGlobalAction
                    aria-label="Search"
                    onClick={() => { alert("This is a place holder, functionality to be implemented on future work!") }}>
                    <Search />
                </HeaderGlobalAction>

            </div>
        );
    }
}
export default HeaderToolBar;