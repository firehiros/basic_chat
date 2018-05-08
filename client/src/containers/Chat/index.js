import React, {Component} from 'react';
import {connect} from 'react-redux'
import Button from "material-ui/Button";
import Drawer from 'material-ui/Drawer';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import {CircularProgress} from 'material-ui/Progress';
import 'jquery-slimscroll/jquery.slimscroll.min';
import IconButton from 'material-ui/IconButton'
import Input from 'material-ui/Input'
import ChatUserList from "components/ChatPanel/ChatUserList/ChatUserList";
import Conversation from "components/ChatPanel/ChatUserList/Conversation/index";
import ContactList from "components/ChatPanel/ChatUserList/ContactList/index";
import Menu, {MenuItem} from 'material-ui/Menu';

import ChatAction from 'reducers/chat/actions';
import AuthAction from 'reducers/auth/actions';
let {
    filterContacts,
    filterUsers,
    hideLoader,
    onChatToggleDrawer,
    submitComment,
    updateMessageValue,
    changePanelState,
    onSelectUser,
    requestUsers,
    requestConversation,
    submitCommentSuccess,
    quitChat
} = ChatAction;

let { logout, connectSocket, disconnectSocket } = AuthAction;

class ChatPanelWithRedux extends Component {
    constructor() {
        super();
        this.state = {
            width: 1200,
            anchorEl: null,
            openMenu: false,
            listenSocket: false
        }
        this.elChatBottom = React.createRef();
    }
    scrollToBottom() {
        if(this.elChatBottom.current){
            this.elChatBottom.current.scrollIntoView({ block: 'start' });

        }
    }
    componentDidUpdate() {
        this.manageHeight()
        this.scrollToBottom();
    }

    componentDidMount() {
        this.manageHeight()
        this.scrollToBottom();
        if(this.props.userToken){
            this.props.requestUsers(this.props.userToken)
        }
    }

    filterContacts = (userName) => {
        this.props.filterContacts(userName);
    };
    filterUsers = (userName) => {
        this.props.filterUsers(userName);
    };
    listen = () => {
        if(!this.props.socket || this.state.listenSocket){
            return;
        }
        let socket = this.props.socket;
        socket.on('connect', () => {
            NotificationManager.info('Socket connected', 'Socket connect');
        });
        socket.on('reconnect', () => {
            NotificationManager.info('Socket reconnected', 'Socket connect');
        });
        socket.on('error', (error) => {
            NotificationManager.error(error.message, 'Error');
        });
        socket.on('chat-messages:new', (res) => {
            console.log(res.message);
            this.props.submitCommentSuccess(res);
            if(res.message.owner !== this.props.userInfo.id){
                NotificationManager.info('You have received new messages', 'Message');
            }
            // that.addMessage(message);
        });
        socket.on('messages:new', (message) => {
            console.log(message);
            NotificationManager.info('You have received new messages', 'Message');
            // that.addMessage(message);
        });
        socket.on('rooms:new', (data) => {
            // that.addRoom(data);
        });
        socket.on('rooms:update', (room) => {
            // that.roomUpdate(room);
        });
        socket.on('rooms:archive', (room) => {
            // that.roomArchive(room);
        });
        socket.on('users:join', (user) => {
            // that.addUser(user);
        });
        socket.on('users:leave', (user) => {
            // that.removeUser(user);
        });
        socket.on('users:update', (user) => {
            // that.updateUser(user);
        });
        socket.on('files:new', (file) => {
            // that.addFile(file);
        });
        socket.on('disconnect', () => {
            this.props.disconnectSocket();
            NotificationManager.info('Socket disconnected', 'Socket disconnect');
        });
        this.state.listenSocket = true;
        //
        // GUI
        //
        // this.events.on('messages:send', this.sendMessage, this);
        // this.events.on('rooms:update', this.updateRoom, this);
        // this.events.on('rooms:leave', this.leaveRoom, this);
        // this.events.on('rooms:create', this.createRoom, this);
        // this.events.on('rooms:switch', this.switchRoom, this);
        // this.events.on('rooms:archive', this.archiveRoom, this);
        // this.events.on('profile:update', this.updateProfile, this);
        // this.events.on('rooms:join', this.joinRoom, this);
    };

    handleMenuClick = event => {
        this.setState({openMenu: true, anchorEl: event.currentTarget});
    };

    handleRequestLogout = () => {
        this.props.logout();
        this.props.quitChat();
        this.setState({openMenu: false});
    };

    handleRequestProfile = () => {
        this.setState({openMenu: false});
    };

    handleRequestSetting = () => {
        this.setState({openMenu: false});
    };

    handleRequestClose = () => {
        this.setState({openMenu: false});
    };

    _handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            this.submitComment();
        }
    };

    onSelectUser = (user) => {
        this.props.requestConversation({
            chatuser: user.id,
            expand: 'owner',
            reverse: 'false'
        }, this.props.userToken);
        this.props.onSelectUser(user);
        setTimeout(() => {
            this.props.hideLoader();
        }, 1500);
    };


    submitComment = () => {
        if (this.props.message !== "") {
            let data = {
                chatuser: this.props.selectedUser.id,
                text: this.props.message
            }
            if(this.props.socket){
                this.props.socket.emit('chat-messages:create', data);
            } else {
                this.props.submitComment(data, this.props.userToken);
            }
        }
    };

    updateMessageValue = (evt) => {
        this.props.updateMessageValue(evt.target.value);

    };

    Communication = () => {
        const {message, selectedUser, conversation} = this.props;
        // const {conversationData} = conversation;
        return (
            <div className="chat-main">
                <div className="chat-main-header">
                    <IconButton className="d-block d-xl-none chat-btn" aria-label="Menu"
                                onClick={this.onChatToggleDrawer.bind(this)}>
                        <i className="zmdi zmdi-comment-text"/>
                    </IconButton>
                    <div className="chat-main-header-info">

                        <div className="chat-avatar mr-2">
                            <div className="chat-avatar-mode">
                                <img src={selectedUser.avatar || "http://via.placeholder.com/256x256"}
                                     className="rounded-circle size-60"
                                     alt=""/>
                            </div>
                        </div>

                        <div className="chat-contact-name">
                            {selectedUser.firstName} {selectedUser.lastName}
                        </div>
                    </div>

                </div>

                <div className="chat-list-scroll">
                    <Conversation conversationData={conversation}
                                  selectedUser={selectedUser}/>
                    <div ref={this.elChatBottom}></div>
                </div>

                <div className="chat-main-footer">
                    <div className="d-flex flex-row align-items-center" style={{maxHeight: 51}}>
                        <div className="col">
                            <div className="form-group">
                                <textarea
                                    id="required" className="border-0 form-control chat-textarea"
                                    onKeyUp={this._handleKeyPress.bind(this)}
                                    onChange={this.updateMessageValue.bind(this)}
                                    value={message}
                                    placeholder="Type and hit enter to send message"
                                />
                            </div>
                        </div>
                        <div className="chat-sent">
                            <IconButton
                                onClick={this.submitComment.bind(this)}
                                aria-label="Send message">
                                <i className="zmdi  zmdi-mail-send"/>
                            </IconButton>
                        </div>
                    </div>
                </div>
            </div>
        )
    };

    AppUsersInfo = () => {
        return <div className="chat-sidenav-main">
            <div className=" bg-primary chat-sidenav-header">

                <div className="chat-user-hd">
                    <IconButton className="back-to-chats-button" aria-label="back button"
                                onClick={() => {
                                    this.props.changePanelState(1);
                                }}>
                        <i className="zmdi zmdi-arrow-back text-white"/>
                    </IconButton>
                </div>
                <div className="chat-user chat-user-center">
                    <div className="chat-avatar">
                        <img src="http://via.placeholder.com/256x256"
                             className="avatar rounded-circle size-60 huge" alt="John Doe"/>
                    </div>

                    <div className="user-name h4 my-2 text-white">Robert Johnson</div>

                </div>
            </div>
            <div className="chat-sidenav-content">
                <div className="chat-sidenav-scroll card p-4">
                    <form>
                        <div className="form-group mt-4">
                            <label>Mood</label>
                            <Input
                                fullWidth
                                id="exampleTextarea"
                                multiline
                                rows={3}
                                onKeyUp={this._handleKeyPress.bind(this)}
                                onChange={this.updateMessageValue.bind(this)}
                                defaultValue="it's a status....not your diary..."
                                placeholder="Status"
                                margin="dense"/>

                        </div>
                    </form>
                </div>
            </div>
        </div>
    };

    ChatUsersView = () => {

        let chatUsers = this.props.userList.filter(user => user.id != this.props.userInfo.id);

        return <div className="chat-sidenav-main">
            <div className="chat-sidenav-header">

                <div className="chat-user-hd">

                    <div className="chat-avatar mr-1" onClick={() => {
                        this.props.changePanelState(2);
                    }}>
                        <div className="chat-avatar-mode">
                            <img id="user-avatar-button"
                                src={ this.props.userInfo.avatar || "http://via.placeholder.com/256x256"}
                                className="rounded-circle size-50" alt=""/>
                        </div>
                    </div>
                    <div className="module-user-info mr-auto d-flex flex-column justify-content-center">
                        <div className="module-title"><h5 className="mb-0">{this.props.userInfo.firstName} {this.props.userInfo.lastName}</h5></div>
                        <div className="module-user-detail"><a href="javascript:void(0)" className="text-grey">{this.props.userInfo.email}</a></div>
                    </div>

                    <IconButton onClick={this.handleMenuClick}>
                        <i className="zmdi zmdi-more-vert float-right"/>
                    </IconButton>

                    <Menu className="user-info"
                          id="simple-menu"
                          anchorEl={this.state.anchorEl}
                          open={this.state.openMenu}
                          onClose={this.handleRequestClose}
                          PaperProps={{
                              style: {
                                  width: 120,
                                  paddingTop: 0,
                                  paddingBottom: 0
                              }
                          }}
                    >
                        <MenuItem onClick={this.handleRequestProfile}><i
                            className="zmdi zmdi-account zmdi-hc-fw mr-2"/>
                            Profile </MenuItem>
                        <MenuItem onClick={this.handleRequestSetting}><i
                            className="zmdi zmdi-settings zmdi-hc-fw mr-2"/>Setting
                        </MenuItem>
                        <MenuItem onClick={this.handleRequestLogout}><i
                            className="zmdi zmdi-sign-in zmdi-hc-fw mr-2"/>Logout
                        </MenuItem>
                    </Menu>
                </div>
            </div>

            <div className="chat-sidenav-content">
                <div className="chat-sidenav-scroll">
                    <div className="chat-sidenav-title">Chat User</div>
                    {chatUsers.length === 0 ?
                        <div className="pl-3">{this.props.userNotFound}</div>
                        :
                        <ChatUserList chatUsers={chatUsers}
                                      selectedSectionId={this.props.selectedSectionId}
                                      onSelectUser={this.onSelectUser.bind(this)}/>
                    }
                </div>
            </div>
        </div>
    };

    showCommunication = () => {
        return (
            <div className="chat-box">
                <div className="chat-box-main">{
                    this.props.selectedUser === null ?
                        <div className="loader-view">
                            <i className="zmdi zmdi-comment s-128 text-muted"/>
                            <h1 className="text-muted"> Select User to start Chat</h1>
                            <Button className="d-block d-xl-none" color="primary"
                                    onClick={this.onChatToggleDrawer.bind(this)}>Select contact to start
                                Chat</Button>
                        </div>
                        : this.Communication()}
                </div>
            </div>
        )
    };

    manageHeight() {
        const $body = $('#body');
        window.addEventListener("resize", () => {
            if ($body.width() >= 1200) {
                if (this.state.width !== 1200) {
                    this.setState({width: 1200})
                }
            }
            else if ($body.width() >= 992) {
                if (this.state.width !== 992) {
                    this.setState({width: 992})
                }
            }
            else if ($body.width() >= 768) {
                if (this.state.width !== 768) {
                    this.setState({width: 768})
                }
            }
            else if ($body.width() >= 576) {
                if (this.state.width !== 576) {
                    this.setState({width: 576})
                }
            }
            else if ($body.width() >= 0) {
                if (this.state.width !== 0) {
                    this.setState({width: 0})
                }
            }

        });

        if ($("body").width() >= 1200) {
            $('.loader-view').slimscroll({
                height: 'calc(100vh - 290px)'
            });
            $('.chat-list-scroll').slimscroll({
                height: 'calc(100vh - 346px)'
            });

            if (this.props.panelState === 1) {
                $('.chat-sidenav-scroll').slimscroll({
                    height: 'calc(100vh - 297px)'
                });
            } else {
                $('.chat-sidenav-scroll').slimscroll({
                    height: 'calc(100vh - 361px)'
                });
            }
        } else {
            $('.loader-view').slimscroll({
                height: 'calc(100vh - 120px)'
            });
            $('.chat-list-scroll').slimscroll({
                height: 'calc(100vh - 255px)'
            });

            if (this.props.panelState === 1) {
                $('.chat-sidenav-scroll').slimscroll({
                    height: 'calc(100vh - 127px)'
                });
            } else {
                $('.chat-sidenav-scroll').slimscroll({
                    height: 'calc(100vh - 187px)'
                });
            }
        }
    }

    onChatToggleDrawer() {
        this.props.onChatToggleDrawer();
    }

    render() {
        const {loader, panelState, drawerState, selectedUser} = this.props;
        this.listen();
        return (
            <div className="app-wrapper app-wrapper-module">
                <div className="app-module chat-module animated slideInUpTiny animation-duration-3">
                    <div className="chat-module-box">
                        <div className="d-block d-xl-none">
                            <Drawer className="app-module-sidenav"
                                    type="temporary"
                                    open={drawerState}
                                    onClose={this.onChatToggleDrawer.bind(this)}>
                                {panelState === 1 ? this.ChatUsersView() : this.AppUsersInfo()}
                            </Drawer>
                        </div>
                        <div className="chat-sidenav d-none d-xl-flex">
                            {panelState === 1 ? this.ChatUsersView() : this.AppUsersInfo()}
                        </div>
                        {loader ?
                            <div className="w-100 d-flex justify-content-center align-items-center chat-loader-view">
                                <CircularProgress/>
                            </div> : this.showCommunication()
                        }
                    </div>
                </div>
                <NotificationContainer/>
            </div>
        )
    }
}

const mapStateToProps = state => {
    const {
        loader,
        userNotFound,
        drawerState,
        selectedSectionId,
        panelState,
        searchChatUser,
        contactList,
        selectedUser,
        message,
        userList,
        conversation
    } = state.chat;
    const { userToken, userInfo, socket } = state.auth;
    return {
        loader,
        userNotFound,
        drawerState,
        selectedSectionId,
        panelState,
        searchChatUser,
        contactList,
        selectedUser,
        message,
        userList,
        conversation,
        userToken,
        userInfo,
        socket
    }
};

export default connect(mapStateToProps, {
    filterContacts,
    filterUsers,
    hideLoader,
    changePanelState,
    submitComment,
    onSelectUser,
    updateMessageValue,
    onChatToggleDrawer,
    requestUsers,
    requestConversation,
    logout,
    quitChat,
    connectSocket,
    submitCommentSuccess,
    disconnectSocket
})(ChatPanelWithRedux);
