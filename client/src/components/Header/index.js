import React from 'react';
import AppBar from 'material-ui/AppBar';
import Toolbar from 'material-ui/Toolbar';
import IconButton from 'material-ui/IconButton';
import {Dropdown, DropdownMenu, DropdownToggle} from 'reactstrap';

import {COLLAPSED_DRAWER, FIXED_DRAWER} from 'constants/ActionTypes';
import MailNotification from './MailNotification/index';
import AppNotification from './AppNotification/index';
import CardHeader from 'components/CardHeader/index';

class Header extends React.Component {

    onAppNotificationSelect = () => {
        this.setState({
            appNotification: !this.state.appNotification
        })
    };
    onMailNotificationSelect = () => {
        this.setState({
            mailNotification: !this.state.mailNotification
        })
    };

    handleRequestClose = () => {
        this.setState({mailNotification: false, appNotification: false});
    };

    constructor() {
        super();
        this.state = {
            mailNotification: false,
            appNotification: false,
        }
    }
    render() {
        const {onToggleCollapsedNav, drawerType} = this.props;
        const drawerStyle = drawerType.includes(FIXED_DRAWER) ? "d-block d-xl-none" : drawerType.includes(COLLAPSED_DRAWER) ? "d-block" : "d-none";

        return (
            <AppBar className="app-main-header">
                <Toolbar className="app-toolbar" disableGutters={false}>
                    <IconButton className={`jr-menu-icon ${drawerStyle}`} aria-label="Menu"
                                onClick={onToggleCollapsedNav}>
                        <span className="menu-icon"/>
                    </IconButton>

                    <a className="app-logo" href="#/">
                        <img src="http://via.placeholder.com/180x65" alt="Jambo" title="Jambo"/>
                    </a>

                    <ul className="header-notifications list-inline ml-auto">
                        <li className="list-inline-item">
                            <Dropdown
                                className="quick-menu"
                                isOpen={this.state.appNotification}
                                toggle={this.onAppNotificationSelect.bind(this)}>

                                <DropdownToggle
                                    className="d-inline-block"
                                    tag="span"
                                    data-toggle="dropdown">
                                    <IconButton className="icon-btn size-30">
                                        <i className="zmdi zmdi-notifications-active icon-alert animated infinite wobble"/>
                                    </IconButton>
                                </DropdownToggle>

                                <DropdownMenu right>
                                    <CardHeader styleName="align-items-center" heading="Notifications"/>
                                    <AppNotification/>
                                </DropdownMenu>
                            </Dropdown>
                        </li>
                        <li className="list-inline-item">
                            <Dropdown
                                className="quick-menu"
                                isOpen={this.state.mailNotification}
                                toggle={this.onMailNotificationSelect.bind(this)}
                            >
                                <DropdownToggle
                                    className="d-inline-block"
                                    tag="span"
                                    data-toggle="dropdown">

                                    <IconButton className="icon-btn size-30">
                                        <i className="zmdi zmdi-comment-alt-text icon-alert zmdi-hc-fw"/>
                                    </IconButton>
                                </DropdownToggle>


                                <DropdownMenu right>
                                    <CardHeader styleName="align-items-center" heading="Messages"/>
                                    <MailNotification/>
                                </DropdownMenu>
                            </Dropdown>
                        </li>
                    </ul>
                </Toolbar>
            </AppBar>
        );
    }

}


export default Header;
