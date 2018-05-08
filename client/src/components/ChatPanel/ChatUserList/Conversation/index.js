import React from 'react';
import ReceivedMessageCell from "./ReceivedMessageCell/index";
import SentMessageCell from "./SentMessageCell/index";


const Conversation = ({conversationData, selectedUser}) => {
    return (
        <div className="chat-main-content">
            {conversationData.map((message, index) => message.type === 'received' ?
                <ReceivedMessageCell key={index} message={message}/> :
                <SentMessageCell key={index} message={message}/>
            )}
        </div>
    )
};

export default Conversation;
