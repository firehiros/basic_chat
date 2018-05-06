import React from 'react';
import { Router,hashHistory } from 'react-router';
import {Redirect, Switch, Route, withRouter} from 'react-router-dom';
import {connect} from 'react-redux';
import {toggleCollapsedNav} from 'reducers/settings/actions';

import Header from 'components/Header/index';
import Sidebar from 'containers/SideNav/index';
import Footer from 'components/Footer';
import Chat from 'containers/Chat';
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
        const drawerStyle = drawerType.includes(FIXED_DRAWER) ? "fixed-drawer" : drawerType.includes(COLLAPSED_DRAWER) ? "collapsible-drawer" : "mini-drawer";

        //set default height and overflow for iOS mobile Safari 10+ support.
        if (isIOS && isMobile) {
            $('#body').addClass('ios-mobile-view-height')
        }
        else if ($('#body').hasClass('ios-mobile-view-height')) {
            $('#body').removeClass('ios-mobile-view-height')
        }

        return (
            <div className="app-main">
            </div>
        );
    }
}

    // <div className={`app-container ${drawerStyle}`}>
    //     <div className="app-main-container">
    //         <div className="app-header">
    //             <Header drawerType={drawerType} onToggleCollapsedNav={this.onToggleCollapsedNav}/>
    //         </div>
    //         <main className="app-main-content-wrapper">
    //             <div className="app-main-content" width="100%">
    //                 <Route path={`${match.url}chat`} component={Chat}/>
    //                 // <Route path={`${match.url}volume`} component={Volume}/>
    //                 // <Route path={`${match.url}ratelist`} component={RateList}/>
    //             </div>
    //         </main>
    //         <Footer/>
    //     </div>
    // </div>
const mapStateToProps = ({settings}) => {
    const {navCollapsed, drawerType} = settings;
    return {navCollapsed, drawerType}
};
export default withRouter(connect(mapStateToProps, {toggleCollapsedNav})(App));
