import { HeaderGlobalAction } from "carbon-components-react";
import { UserAvatar, Notification, Search } from "@carbon/icons-react";
import React, { useEffect } from "react";
import KeycloakService from "auth/KeycloakAuth";
import { env } from '../env';
import { useAuth } from "oidc-react";

const withAuth = env.REACT_APP_AUTH_SERVER_URI || env.REACT_APP_OIDC;
const keycloak = env.REACT_APP_AUTH_SERVER_URI;

type HeaderToolBarProp = {}

const HeaderToolBar: React.FC<HeaderToolBarProp> = () => {
    const auth = useAuth();
    let isAuthenticated = auth.userData?.id_token ? true : false;
    useEffect(() => {
        if (!auth.isLoading && !isAuthenticated) {
            auth.signIn(); // redirect user to login page after successful logout
        }
    });

    const handleKeycloakLogout = () => {
        KeycloakService.doLogout();
    };

    const handleOIDCLogOut = () => {
        auth.signOut();
    };

    return (
        <div className='header-toolbar'>
            {withAuth &&
                <div className="user-dropdown">
                    <HeaderGlobalAction
                        aria-label="User">
                        <UserAvatar />
                    </HeaderGlobalAction>
                    <div className="user-dropdown-content">
                        {(KeycloakService.isLoggedIn() || isAuthenticated) && (
                            // eslint-disable-next-line
                            <a
                                href="#"
                                className="nav-link"
                                onClick={keycloak ? handleKeycloakLogout : handleOIDCLogOut}>
                                Logout {keycloak ? KeycloakService.getFirstName() : auth.userData?.profile?.name}
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
};
export default HeaderToolBar;