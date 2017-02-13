import React               from 'react';
import Moment              from 'moment';
import Marked              from 'marked';
import Paper               from 'material-ui/Paper';
import CircularProgress    from 'material-ui/CircularProgress';
import ImageIcon           from 'material-ui/svg-icons/image/photo';
import UploadIcon          from 'material-ui/svg-icons/file/file-upload';
import Theme               from 'Theme';
import {App, Lang}         from 'App';
import UserAvatar          from '../user-avatar';
import Emojione            from '../components/emojione';
import ImageBrokenIcon     from '../icons/image-broken';
import ImageMessage        from './message-image';
import FileListItem        from './file-list-item';

/**
 * React component: MessageListItem
 */
const MessageListItem = React.createClass({

    getInitialState() {
        return {
            image: null
        };
    },

    _checkResendMessage() {
        let message = this.props.message;
        if(message.needCheckResend) {
            clearTimeout(this.checkResendTask);
            this.checkResendTask = setTimeout(() => {
                if(message.needResend) {
                    this.forceUpdate();
                }
            }, 10500)
        }
    },

    componentDidUpdate() {
        this._checkResendMessage();
    },

    componentDidMount() {
        this._checkResendMessage();
    },

    componentWillUnmount() {
        clearTimeout(this.checkResendTask);
    },

    _handleResendBtnClick() {
        let message = this.props.message;
        message.date = new Date().getTime();
        if(message.needCheckResend) {
            App.chat.sendMessage(message);
        }
        this.forceUpdate();
    },

    _handleDeleteBtnClick() {
        App.chat.deleteLocalMessage(this.props.message);
    },

    _handleMemberItemContextMenu(e) {
        App.popupContextMenu(App.chat.createChatMemberContextMenu(this.props.message), e);
    },

    render() {
        let {
            message,
            lastMessage,
            hideAvatar,
            fontSize,
            hideTime,
            style,
            contentStyle,
            ...other
        } = this.props;

        const STYLE = {
            main: {
                marginBottom: 20,
                fontSize: fontSize.size + 'px',
                lineHeight: fontSize.lineHeight
            },
            broadcast: {
                backgroundColor: Theme.color.pale3,
                padding: 8,
                color: Theme.color.accent3,
                textAlign: 'center'
            },
            normal: {
                paddingLeft: 40,
                minHeight: 40,
                position: 'relative'
            },
            noAvatar: {
                marginTop: -15,
                minHeight: 20
            },
            title: {
                fontSize: fontSize.title,
                lineHeight: fontSize.titleLineHeight
            },
            avatar: {
                position: 'absolute',
                left: 0,
                top: 4
            },
            time: {
                color: Theme.color.accent3,
                lineHeight: '16px',
                fontSize: '12px'
            },
            leftTime: {
                position: 'absolute',
                left: -3,
                top: Math.floor((Math.floor(Math.max(16, fontSize.size * fontSize.lineHeight)) - 17)/2),
                width: 36,
                textAlign: 'center'
            },
            dot: {
                position: 'absolute',
                left: 11,
                top: Math.floor((Math.floor(Math.max(16, fontSize.size * fontSize.lineHeight)) - 8)/2),
                width: 8,
                height: 8,
                borderRadius: 4,
                backgroundColor: Theme.color.pale1,
                fontSize: 0,
                textAlign: 'center',
                color: 'transparent',
                overflow: 'hidden'
            },
            content: {
            },
            unsavedContent: {
                transition: Theme.transition.normal('opacity'),
                opacity: '0.5'
            },
            resendContent: {
                transition: Theme.transition.normal('background-color', 'padding'),
                backgroundColor: Theme.color.negativePale,
                padding: 5
            },
            resendButton: {
                display: 'inline-block',
                padding: '2px 0'
            },
            fileContent: {
                padding: '5px 8px',
                float: 'left',
                maxWidth: '100%',
                boxSizing: 'border-box',
                marginBottom: 8,
                marginTop: 4,
            },
            progressText: {
                position: 'absolute',
                left: 0,
                top: 0,
                width: 80,
                height: 80,
                lineHeight: '80px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: Theme.color.icon,
                fontSize: '15px'
            },
        };

        // console.info('RENDER MESSAGE',message);

        style = Object.assign({}, STYLE.main, message.isBroadcast ? STYLE.broadcast: STYLE.normal, style);
        contentStyle = Object.assign({}, STYLE.content, contentStyle);
        if(message.needResend) Object.assign(contentStyle, STYLE.resendContent);
        else if(message.needCheckResend) Object.assign(contentStyle, STYLE.unsavedContent);

        let date = Moment(message.date);
        let dateStr = date.format('YYYY-M-D HH:mm:ss');
        let timeStr = date.format('HH:mm');

        if(message.isBroadcast) {
            if(lastMessage && lastMessage.isBroadcast) {
                style.marginTop = -18;
            }
            return <div {...other} style={style}><div style={{fontSize: fontSize.title}}><span title={dateStr}>{timeStr}</span> &nbsp; {message.content}</div></div>
        }

        let avatarElement = null, headerElement;
        if(hideAvatar) {
            Object.assign(style, STYLE.noAvatar);
            if(hideTime) {
                avatarElement = <div className='message-time-dot' style={STYLE.dot} title={dateStr}><small style={{fontSize: '12px'}}>{timeStr}</small></div>;
            } else {
                avatarElement = <div className='message-time-side' style={Object.assign({}, STYLE.time, STYLE.leftTime)} title={dateStr}><small>{timeStr}</small></div>;
            }
        } else {
            if(!message.sender) message.findSender(App.dao);
            let target = message.sender ? 'Member/' + message.sender.id : '#';
            avatarElement = <UserAvatar onContextMenu={this._handleMemberItemContextMenu} size={30} className='link-app message-avatar' data-target={target} user={message.sender} style={STYLE.avatar}/>;
            headerElement = <div style={STYLE.title}><strong onContextMenu={this._handleMemberItemContextMenu} title={message.sender ? ('@' + message.sender.account) : ''} style={{color: Theme.color.primary1}} className='link-app message-title' data-target={message.sender ? '@Member/' + message.sender.account : '#'}>{message.sender ? message.sender.displayName : ('用户<' + message.user + '>')}</strong> &nbsp; <small style={STYLE.time} title={dateStr}>{timeStr}</small></div>;
        }

        let messageContent = null;
        if(message.contentType === 'text') {
            messageContent = message.renderTextContent(content => {
                return App.linkMembersInText(content);
            });
        } else if(message.contentType === 'file') {
            messageContent = <div className='clearfix'><Paper zDepth={1} style={STYLE.fileContent}><FileListItem message={message}/></Paper></div>;
        } else if(message.contentType === 'image') {
            messageContent = <ImageMessage message={message} />
        }

        let resendButton = null;
        if(message.needResend) {
            resendButton = <div><a style={STYLE.resendButton} className='negative' onClick={this._handleResendBtnClick}>{Lang.chat.resend}</a> &nbsp; <a style={STYLE.resendButton} className='negative' onClick={this._handleDeleteBtnClick}>{Lang.common.delete}</a></div>
        }

        return <div {...other} style={style}>
            {headerElement}
            {avatarElement}
            {typeof(messageContent) !== 'string' ? <div style={contentStyle} className={'text-content' + (message.needCheckResend && !message.isOutdated ? ' animate-flash' : '') + (message.contentType === 'text' ? ' markdown-content' : '')}>{messageContent}</div> : <div style={contentStyle} className={'text-content' + (message.needCheckResend && !message.isOutdated ? ' animate-flash' : '') + (message.contentType === 'text' ? ' markdown-content' : '')} dangerouslySetInnerHTML={{__html: messageContent}}/>}
            {resendButton}
        </div>
    }
});

export default MessageListItem;
