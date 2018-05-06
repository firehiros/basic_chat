import React from 'react';
import { Router,hashHistory } from 'react-router';
// import {createMuiTheme, MuiThemeProvider} from 'material-ui/styles';
// import lightBaseTheme from 'material-ui/styles/baseThemes/lightBaseTheme';
import {Redirect, Switch, Route, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';

// Load Actions
import SettingActions from 'reducers/settings/actions';

// Load style
import indigoTheme from 'constants/themes/indigoTheme';

import Header from 'components/Header/index';
import Sidebar from 'containers/SideNav/index';
import Footer from 'components/Footer';
import Chat from 'containers/Chat';

import 'styles/bootstrap.scss'
import 'styles/app.scss';
// import Volume from 'containers/Volume';
// import RateList from 'containers/RateList';

import {COLLAPSED_DRAWER, FIXED_DRAWER} from 'constants/ActionTypes';
import {isIOS, isMobile} from 'react-device-detect';

class App extends React.Component {
    onToggleCollapsedNav = (e) => {
        const val = !this.props.navCollapsed;
        this.props.toggleCollapsedNav(val);
    };

    render() {
        const {match, drawerType} = this.props;
        // let theme = createMuiTheme(indigoTheme);
        const drawerStyle = drawerType.includes(FIXED_DRAWER) ? "fixed-drawer" : drawerType.includes(COLLAPSED_DRAWER) ? "collapsible-drawer" : "mini-drawer";

        //set default height and overflow for iOS mobile Safari 10+ support.
        if (isIOS && isMobile) {
            $('#body').addClass('ios-mobile-view-height')
        }
        else if ($('#body').hasClass('ios-mobile-view-height')) {
            $('#body').removeClass('ios-mobile-view-height')
        }

        return (
                <div className={`app-main`}>
                    <div className={`app-container ${drawerStyle}`}>
                        <div className="app-main-container">
                            <main className="app-main-content-wrapper">
                                <div className="app-main-content" width="100%">
                                    <Chat />
                                </div>
                                <Footer/>
                            </main>
                        </div>
                    </div>
                </div>
        );
    }
}

const mapStateToProps = ({settings}) => {
    const {navCollapsed, drawerType} = settings;
    return {navCollapsed, drawerType}
};
export default withRouter(connect(mapStateToProps, {toggleCollapsedNav: SettingActions.toggleCollapsedNav})(App));
