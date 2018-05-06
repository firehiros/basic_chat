import React from 'react';

const UserCell = ({chat, selectedSectionId, onSelectUser}) => {
    return (
        <div className={`chat-user-item ${selectedSectionId === chat.id ? 'active' : ''}`} onClick={() => {
            onSelectUser(chat);
        }}>
            <div className="chat-user-row row">
                <div className="chat-avatar col-xl-2 col-3">
                    <div className="chat-avatar-mode">
                        <img src={chat.avatar ? chat.avatar : 'http://via.placeholder.com/256x256'} className="rounded-circle size-50" alt={chat.username}/>
                    </div>
                </div>


                <div className="chat-info col-xl-8 col-6">
                    <span className="name h4">{chat.firstName} {chat.lastName} ({chat.username})</span>
                </div>

                <div className="chat-date col-xl-2 col-3">
                    <div className="last-message-time">{chat.lastMessageTime}</div>

                    <div className="bg-primary rounded-circle badge text-white">{chat.unreadMessage}</div>

                </div>
            </div>
        </div>
    )
};

export default UserCell;
