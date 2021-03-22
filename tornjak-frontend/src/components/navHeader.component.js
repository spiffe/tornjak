import React from "react";
import Search20 from "@carbon/icons-react/lib/search/20";
import Notification20 from "@carbon/icons-react/lib/notification/20";
import AppSwitcher20 from "@carbon/icons-react/lib/app-switcher/20";
import {
    Header,
    HeaderName,
    HeaderGlobalAction,
    HeaderGlobalBar,
    HeaderNavigation,
    HeaderMenu,
    HeaderMenuItem,
} from "carbon-components-react/lib/components/UIShell";

class NavHeader extends React.Component {
    render() {
        return (
            <Header aria-label="Tornjak">
                <HeaderName href="/" prefix="">
                    Tornjak
                </HeaderName>
                <HeaderNavigation aria-label="Tornjak">
                    <HeaderMenu aria-label="Agents" menuLinkName="Agents">
                        <HeaderMenuItem href="/agents">Agents List</HeaderMenuItem>
                        <HeaderMenuItem href="/agent/createjointoken">Create Token</HeaderMenuItem>
                    </HeaderMenu>
                    <HeaderMenu aria-label="Entries" menuLinkName="Entries">
                        <HeaderMenuItem href="/entries">Entries List</HeaderMenuItem>
                        <HeaderMenuItem href="/entry/create">Create Entry</HeaderMenuItem>
                    </HeaderMenu>
                    <HeaderMenuItem href="/tornjak/serverinfo">Tornjak ServerInfo</HeaderMenuItem>
                    <HeaderMenuItem href="/server/manage">Manage Servers</HeaderMenuItem>
                </HeaderNavigation>
                <HeaderGlobalBar>
                    <HeaderGlobalAction aria-label="Search" onClick={() => { }}>
                        <Search20 />
                    </HeaderGlobalAction>
                    <HeaderGlobalAction aria-label="Notifications" onClick={() => { }}>
                        <Notification20 />
                    </HeaderGlobalAction>
                    <HeaderGlobalAction aria-label="App Switcher" onClick={() => { }}>
                        <AppSwitcher20 />
                    </HeaderGlobalAction>
                </HeaderGlobalBar>
            </Header>
        );
    }
}

export default NavHeader;