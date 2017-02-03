import React               from 'react';
import ReactDOM            from 'react-dom';
import Theme               from '../../theme';
import {App, Lang, Config} from '../../app';
import Chat                from '../../models/chat/chat';
import Message             from '../../models/chat/chat-message';
import Member              from '../../models/member';
import StarBorderIcon      from 'material-ui/svg-icons/toggle/star-border';
import StarIcon            from 'material-ui/svg-icons/toggle/star';
import PersonAddIcon       from 'material-ui/svg-icons/social/person-add';
import PersonOutlineIcon   from 'material-ui/svg-icons/social/people-outline';
import SidebarIcon         from 'material-ui/svg-icons/action/chrome-reader-mode';
import HistoryIcon         from 'material-ui/svg-icons/action/history';
import IconButton          from 'material-ui/IconButton';
import SplitJS             from 'split.js';
import ChatsIcon           from '../icons/comments-outline';
import MessageList         from './message-list';
import MessageSendbox      from './message-sendbox';
import Sidebar             from './sidebar';
import Resizable           from '../mixins/resizable';
import InviteMembers       from './invite-member';
import UserAvatar          from '../user-avatar';
import UserStatus          from './user-status';
import ChatsManager        from './chats-manager';
import Colors              from 'Utils/material-colors';
import R                   from 'Resource';
import Popover             from 'Components/popover';
import Spinner             from 'Components/spinner';
import Messager            from 'Components/messager';
import Emojione            from 'Components/emojione';
import Modal               from 'Components/modal';

// display app component
const ChatPage = React.createClass({
    mixins: [Resizable],

    getInitialState() {
        return {
            chat: null,
            sidebar: false,
            smallWindow: false,
        };
    },

    componentDidMount() {
        setTimeout(() => {
            let chat = App.chat.dao.getChat(this.props.chatId);
            this.setState({chat});
        }, 300);

        this._handleDataChangeEvent = App.on(R.event.data_change, data => {
            let chat = null;
            if(data.chats) {
                chat = data.chats.find(x => x.gid === this.props.chatId);
            }
            if(chat && chat.gid === this.props.chatId) this.setState({chat});
        });

        this._handleCaptureScreenEvent = App.on(R.event.capture_screen, (image, chat) => {
            if(image && chat && chat.gid === this.props.chatId) {
                this.refs.messageSendbox.appendImages(image);
            }
        });

        this._handleUILinkEvent = App.on(R.event.ui_link, actionLink => {
            if(actionLink.action === '@Member') {
                let editbox = this.refs.messageSendbox.editbox;
                editbox.appendContent('@' + actionLink.target + '&nbsp;');
                editbox.focus(false);
            }
        });

        setTimeout(() => {
            let chatMessageBox = ReactDOM.findDOMNode(this.refs.chatMessageBox);
            let messageSendboxHeight = Math.ceil(100 * App.user.config.ui.chat.sendbox.height / chatMessageBox.clientHeight);
            SplitJS([ReactDOM.findDOMNode(this.refs.messageList), ReactDOM.findDOMNode(this.refs.messageSendbox)], {
                direction: 'vertical',
                gutterSize: 4,
                sizes: [100 - messageSendboxHeight, messageSendboxHeight],
                minSize: 90,
                onDragEnd: () => {
                    this.refs.messageList.scrollToBottom();
                }
            });
            this.refs.messageList.scrollToBottom();
        }, 500);
    },

    componentWillUnmount() {
        App.off(this._handleDataChangeEvent, this._handleCaptureScreenEvent, this._handleUILinkEvent);
    },

    _sendMessage(messages) {
        let chat = this.state.chat;
        App.chat.sendMessage(messages, chat);
    },

    _handSendMessage(sendbox, emoticon) {
        let chat = this.state.chat;

        let message;
        if(emoticon) {
            message = new Message({
                contentType: 'image',
                content: JSON.stringify({type: 'emoji', content: emoticon}),
                sender: App.user,
                cgid: chat.gid,
                date: new Date()
            });
            this._sendMessage(message);
        } else {
            sendbox.editbox.getContentList().forEach(content => {
                if(content.type === 'text') {
                    message = new Message({
                        content: content.content,
                        sender: App.user,
                        cgid: chat.gid,
                        date: new Date()
                    });

                    this._sendMessage(message);
                } else if(content.type === 'image') {
                    this._handleSelectImageFile(content.image);
                }
            });

            sendbox.clearContent();
            sendbox.focusInputArea();
        }
        
        this.setState({chat});
        this.refs.messageList.scrollToBottom();
    },

    _handleStarButtonClick() {
        App.chat.toggleStar(this.state.chat);
    },

    onWindowResize(windowWidth) {
        this.setState({smallWindow: windowWidth < 900});
    },

    _handleSelectImageFile(file) {
        if(file && file.path) App.chat.sendImageMessage(this.state.chat, file);
    },

    _handleSelectFile(file) {
        App.chat.sendFileMessage(this.state.chat, file, err => {
            if(err.code) {
                Messager.show({clickAway: true, autoHide: false, content: Lang.errors[err.code], color: Theme.color.negative});
            }
        });
    },

    _handleOnInviteBtnClick(e) {
        const chat = this.state.chat;
        let members = [];
        Object.keys(App.dao.members).forEach(memberId => {
            if(!chat.members.has(Number.parseInt(memberId))) {
                members.push(App.dao.members[memberId]);
            }
        });

        e.persist();
        Popover.toggle({
            getLazyContent: () => <InviteMembers onInviteButtonClick={this._handleInviteMembers} members={members} chatId={this.props.chatId} />,
            contentId: 'chat-' + this.props.chatId,
            id: 'ChatInviteMemberPopover',
            trigger: this.inviteBtnWrapper,
            placement: 'bottom',
            style: {
                width: 500,
                height: 400
            },
        });
    },

    _handleInviteMembers(members) {
        App.chat.inviteMembers(this.state.chat, members);
        Popover.hide('ChatInviteMemberPopover', true);
    },

    _handleHistoryBtnClick() {
        Modal.show({
            id: 'chat-history',
            removeAfterHide: true,
            header: Lang.chat.chatsManager,
            content:  (win) => {
                return <ChatsManager currentWindow={window} chat={this.state.chat}/>;
            },
            style: {width: '100%', height: '100%'},
            actions: false,
            onShow: () => {
                document.title = Lang.chat.history + ' - ' + Lang.title;
            },
            onHide: () => {
                document.title = Lang.title;
            }
        });
    },

    _handleDndEnter(e) {
        e.target.classList.add('hover');
    },

    _handleDndLeave(e) {
        e.target.classList.remove('hover');
    },

    _handleDndDrop(e) {
        e.target.classList.remove('hover');
        let file = e.dataTransfer.files[0];
        if(file) {
            if(file.type.startsWith('image/')) {
                this.refs.messageSendbox.appendImages(file);
            } else {
                this._handleSelectFile(file);
            }
        }
    },

    render() {
        const STYLE = {
            main: {},
            header: {
              borderBottom: '1px solid ' + Theme.color.border, 
              padding: '10px 15px 10px 50px',
              lineHeight: '28px',
              backgroundColor: Theme.color.pale2,
              zIndex: 9
            },
            icon: {
                pointerEvents: 'none'
            },
            headerIcon: {
              color: Theme.color.icon,
              fill: Theme.color.icon,
              position: 'absolute',
              left: 15,
              top: 12
            },
            headAvatar: {
                position: 'absolute',
                left: 18,
                top: 14
            },
            headerTitle: {
              fontWeight: 500,
              fontSize: '14px'
            },
            headerActions: {
              right: 10
            },
            messageList: {
              top: 49,
            },
            sidebar: {
                width: App.user.config.ui.chat.sidebar.width,
                maxWidth: 500,
                transition: Theme.transition.normal('width', 'opacity', 'visibility'),
            },
            sidebarHide: {
                width: 0,
                overflow: 'hidden',
                opacity: 0,
                visibility: 'hidden'
            },
            publicGroup: {
                color: Theme.color.alternateText,
                backgroundColor: Colors.lightGreen500,
                display: 'inline-block',
                marginLeft: 10,
                lineHeight: '16px',
                padding: '1px 3px',
                borderRadius: 2,
            },
        };
        
        let {
            style,
            chatId,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);
        const chat = this.state.chat;

        if(!chat) {
            return <div {...other} style={style}><Spinner/></div>
        }// else {
        //    console.log('RENDER CHAT', chat);
        // }

        let messageListStyle = Object.assign({}, STYLE.messageList);

        let sidebarIconButton = null, sidebarStyle = STYLE.sidebar;
        if(!this.state.sidebar || this.state.smallWindow) {
            if(!this.state.smallWindow) sidebarIconButton = <IconButton className="hint--bottom-left" data-hint={Lang.chat.openSidebar} onClick={() => this.setState({sidebar: true})}><SidebarIcon color={Theme.color.icon} hoverColor={Theme.color.primary1}/></IconButton>;
            sidebarStyle = Object.assign({}, sidebarStyle, STYLE.sidebarHide);
        }

        let ChatStarIcon = chat.star ? StarIcon : StarBorderIcon;
        let chatIcon = chat.isOne2One ? <UserAvatar size={20} user={chat.getTheOtherOne(App.user)} style={STYLE.headAvatar}/> : chat.public ? <ChatsIcon style={STYLE.headerIcon}/> : <PersonOutlineIcon style={STYLE.headerIcon}/>;
        
        // let offlineTip = null;
        // if(chat.isOne2One) {
        //     let theOtherOne = chat.getTheOtherOne(App.user);
        //     if(theOtherOne && theOtherOne.isOffline) {
        //         offlineTip = Lang.chat.userOfflineTipForChat
        //             .replace('{0}', theOtherOne.displayName)
        //             .replace('{1}', Lang.user.gendersPronouns[theOtherOne.gender] || Lang.user.gendersPronouns.default);
        //     }
        // }
        
        let theOtherOne = chat.getTheOtherOne(App.user);
        let chatTitle = theOtherOne ? <div><UserStatus status={theOtherOne ? theOtherOne.status : null} />{chat.getDisplayName(App)}</div> : chat.getDisplayName(App);

        return <div {...other} style={style}>
          <div className='dock-full table-row'>
            <div className='table-col relative'>
              <header className='dock-top' style={STYLE.header}>
                <div>{chatIcon}<span style={STYLE.headerTitle}>{chatTitle}</span>{chat.public ? <small style={STYLE.publicGroup}>{Lang.chat.publicGroup}</small> : null}</div>
                <div className='dock-right' style={STYLE.headerActions}>
                  <IconButton className="hint--bottom" data-hint={chat.star ? Lang.chat.removeStar : Lang.chat.star} onClick={this._handleStarButtonClick}><ChatStarIcon color={chat.star ? Theme.color.accent1 : Theme.color.icon} hoverColor={chat.star ? Theme.color.accent1 : Theme.color.primary1}/></IconButton>
                  {chat.canInvite ? <div ref={(e) => this.inviteBtnWrapper = e} style={{display: 'inline-block'}}><IconButton className="hint--bottom" onClick={this._handleOnInviteBtnClick} data-hint={Lang.chat.inviteMember}><PersonAddIcon color={Theme.color.icon} hoverColor={Theme.color.primary1} style={STYLE.icon}/></IconButton></div> : null}
                  {<IconButton className="hint--bottom" onClick={this._handleHistoryBtnClick} data-hint={Lang.chat.history}><HistoryIcon color={Theme.color.icon} hoverColor={Theme.color.primary1} style={STYLE.icon}/></IconButton>}
                  {sidebarIconButton}
                </div>
              </header>
              <div className='dock-full' style={messageListStyle} ref='chatMessageBox'>
                <MessageList ref='messageList' messages={chat.messages} chatId={chat.gid} className='user-selectable messages-list split split-vertical scroll-y'/>
                <MessageSendbox ref='messageSendbox' className='split split-vertical' onSelectFile={this._handleSelectFile} onSendButtonClick={this._handSendMessage} forNewChat={chat.isNewChat && chat.canRename} chatId={chat.gid}/>
                <div className="drag-n-drop-message center-block" onDragEnter={this._handleDndEnter} onDrop={this._handleDndDrop} onDragLeave={this._handleDndLeave}>
                  <div className="text-center">
                    <div className="dnd-over" dangerouslySetInnerHTML={{__html: Emojione.toImage(':hatching_chick:')}}></div>
                    <div className="dnd-hover" dangerouslySetInnerHTML={{__html: Emojione.toImage(':hatched_chick:')}}></div>
                    <h1>{Lang.chat.drapNDropFileMessage}</h1>
                  </div>
                </div>
              </div>
            </div>
            <div className='table-col relative' style={sidebarStyle}>
              {this.state.sidebar ? <Sidebar chat={chat} className='dock-full' onCloseButtonClick={() => this.setState({sidebar: false})}/> : null}
            </div>
          </div>
        </div>
    }
});

export default ChatPage;
