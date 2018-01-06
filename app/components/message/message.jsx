import React from 'react';
import moment from 'moment';

import Divider from 'material-ui/Divider';

import './message.css';

export default class Message extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        let self = this;

        if (this.props.messages.length) {
            return (
                <div className="message-list">
                    {this.props.messages.map(function (message, index) {
                        return (
                            <div className="chat-content" key={index}>
                                <div
                                    className={(self.props.username === message.author) ? "chat-head inline-block right" : "chat-head inline-block"}>
                                     <span className="chat-img">
                                            <img src="https://www.themarysue.com/wp-content/uploads/2015/12/avatar.jpeg"
                                                 className="img-circle user-avatar"/>
                                     </span>
                                </div>
                                <div className="chat-body inline-block">
                                    <div className="header">
                                        <strong
                                            className={(self.props.username === message.author) ? "message-author right" : "message-author"}>{message.author}</strong>
                                        <small
                                            className={(self.props.username === message.author) ? "message-timestamp" : "message-timestamp"}>
                                            {moment(new Date(message.timestamp)).format('MMM Do YYYY, h:mm a')}
                                        </small>
                                    </div>
                                    <p className="message-content">{message.text}</p>
                                    <Divider/>
                                </div>
                            </div>
                        )
                    })}
                </div>
            );
        } else {
            return (<div>
            </div>)
        }
    }
}