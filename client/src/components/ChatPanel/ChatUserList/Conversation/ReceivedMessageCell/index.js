import React from 'react';

const ReceivedMessageCell = ({message}) => {
    return (
        <div className="d-flex flex-nowrap chat-item">

            <img className="rounded-circle avatar size-40" src={message.owner.avatar || "http://via.placeholder.com/256x256"}
                 alt=""/>

            <div className="bubble">
                <div className="message">{message.text}</div>
                <div className="time text-muted text-right mt-2">{message.posted}</div>
            </div>

        </div>
    )
};

export default ReceivedMessageCell;
