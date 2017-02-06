import React               from 'react';
import Theme               from 'Theme';
import List                from 'material-ui/List/List';
import ListDivider         from 'material-ui/Divider';
import PeopleIcon          from 'material-ui/svg-icons/social/people';
import PersonOutlineIcon   from 'material-ui/svg-icons/social/people-outline';
import VisibilityOffIcon   from 'material-ui/svg-icons/action/visibility-off';
import ArrowDownIcon       from 'material-ui/svg-icons/navigation/arrow-drop-down';
import ChevronRightIcon    from 'material-ui/svg-icons/navigation/chevron-right';
import CloudDownloadIcon   from 'material-ui/svg-icons/file/cloud-download';
import {App, Lang, Config} from '../../app';
import ChatsIcon           from '../icons/comments-outline';
import ComtentTextIcon     from '../icons/comment-text';
import PoundIcon           from '../icons/pound-box';
import ListItem            from '../components/small-list-item';
import UserAvatar          from '../user-avatar';
import Spinner             from '../components/spinner';
import ContentNotReady     from '../misc/content-not-ready';
import MessageList         from './message-list';
import IconButton          from 'material-ui/IconButton';
import R                   from 'Resource';
import Messager            from 'Components/messager';
import Pager               from 'Components/pager';
import TimeSpan            from 'Components/timespan';
import ListPanel           from 'Components/list-panel';
import Colors              from 'Utils/material-colors';

const Helper = global.Helper;

const ChatsManager = React.createClass({
    getInitialState() {
        return {
            groupState: {},
            chat: null,
            page: 1,
            messages: null,
            loadBtnDisabled: false
        }
    },

    componentWillMount() {
        this.chats = Helper.arrayGroup(App.chat.all, chat => chat.type);
    },

    componentDidMount() {
        this.tryLoadFromRemote = {};
        let chat = this.props.chat || App.chat.all[0];
        if(chat && this.chats[chat.type]) {
            this._loadMessages(chat);
        }

        this._handleDataChangeEvent = App.on(R.event.chats_history, (messages, pager) => {
            if(!this.state.chat || pager.gid !== this.state.chat.gid) return;

            Messager.update(Lang.chat.downloadingChatHistory + ' ' + (messages.length + (pager.pageID - 1) * pager.recPerPage) + '/' + pager.recTotal, 'loadingHistoryMessager');

            if(pager.continued && !pager.isFetchOver) return;

            setTimeout(() => {
                this._loadMessages();
                Messager.update(Lang.chat.downloadingChatHistory + ' ' + Lang.common.completing, 'loadingHistoryMessager');
            }, 2000);
        });
    },

    componentWillUnmount() {
        App.off(this._handleDataChangeEvent);
    },

    _loadMessages(chat) {
        chat = chat || this.state.chat;

        this.setState({
            loadBtnDisabled: false,
            messages: null,
            groupState: Object.assign(this.state.groupState, {[chat.type]: true}),
            chat
        });
        if(chat) {
            App.chat.getMessages(chat).then(messages => {
                if(!messages || !messages.length) {
                    if(!this.tryLoadFromRemote[chat.gid]) {
                        this._handleDownloadChatHistoryClick();
                        this.tryLoadFromRemote[chat.gid] = true;
                    }
                } else {
                    messages.sort((x, y) => {
                        if(x.date === y.date) {
                            return (x.remoteId || 0) - (y.remoteId || 0);
                        } else {
                            return x.date - y.date;
                        }
                    });
                }

                this.setState({page: 0, messages});
                setTimeout(() => {
                    Messager.hide('loadingHistoryMessager');
                }, 500);
            });
        }
    },

    _handleGroupExpandChange(groupName, isExpand) {
        let groupState = this.state.groupState;
        groupState[groupName] = isExpand;
        this.setState({groupState});
    },

    _handleChatItemClick(chat) {
        this._loadMessages(chat);
    },

    _handleDownloadChatHistoryClick() {
        if(this.state.chat) {
            Messager.show({
                id: 'loadingHistoryMessager',
                closeButton: false,
                content: Lang.chat.downloadingChatHistory,
                autoHide: false,
                removeAfterHide: true
            });
            setTimeout(() => {
                this.setState({loadBtnDisabled: true, messages: null});
                App.chat.getChatHistory(this.state.chat);
            }, 400);
        }
    },

    _handPageChange(page) {
        this.setState({page});
    },

    render() {
        const STYLE = {
            menu: {
                width: 240,
                backgroundColor: Theme.color.pale1
            },
            groupList: {
                transition: Theme.transition.normal('max-height'),
                overflow: 'hidden'
            },
            groupHeader: {
                lineHeight: '24px',
                padding: 10,
                color: Theme.color.primary1,
                transition: Theme.transition.normal('background-color'),
                cursor: 'pointer'
            },
            groupHeaderIcon: {
                transition: Theme.transition.normal('transform'),
                color: Theme.color.primary1,
                fill: Theme.color.primary1,
                opacity: 0.5,
                verticalAlign: 'middle'
            },
            list: {
                backgroundColor: 'transparent',
                paddingTop: 0,
                paddingBottom: 0
            },
            history: {
                left: 240
            },
            historyHeader: {
                borderBottom: '1px solid ' + Theme.color.border, 
                padding: '10px 15px 10px 50px',
                lineHeight: '28px',
                height: 28,
                backgroundColor: Theme.color.pale2,
                zIndex: 9
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
            publicGroup: {
                color: Theme.color.alternateText,
                backgroundColor: Colors.lightGreen500,
                display: 'inline-block',
                marginLeft: 10,
                lineHeight: '16px',
                padding: '1px 3px',
                borderRadius: 2,
            },
            headerActions: {
              right: 48
            },
            timespan: {
                display: 'inline-block',
                color: Theme.color.icon,
                marginLeft: 16
            }
        };

        let {
            style,
            chat,
            ...other
        } = this.props;

        let list = [];
        let styleGroupListClose = Object.assign({}, STYLE.groupList, STYLE.groupListClose);
        Object.keys(this.chats).forEach(groupName => {
            let chats = this.chats[groupName];
            let isGroupListOpen = this.state.groupState[groupName];
            let groupList = <ListPanel
              style={STYLE.list}
              key={groupName}
              heading={Lang.chat.chatTypes[groupName] + ' (' + chats.length + ')'}
              expand={!!isGroupListOpen}
              onExpand={isExpand => {this._handleGroupExpandChange(groupName, isExpand);}}
            >
            {
                chats.map(item => {
                    let actived = this.state.chat && this.state.chat.gid === item.gid;
                    if(item.isOne2One) {
                        let theOtherOne = item.getTheOtherOne(App.user);
                        return <ListItem key={item.gid} actived={actived} onClick={this._handleChatItemClick.bind(null, item)} primaryText={item.getDisplayName(App)} leftAvatar={<UserAvatar size={20} user={theOtherOne} style={STYLE.avatar}/>}/>;
                    } else {
                        return <ListItem key={item.gid} actived={actived} onClick={this._handleChatItemClick.bind(null, item)} primaryText={item.getDisplayName(App)} leftIcon={item.isSystem ? <ComtentTextIcon color={Colors.indigo500}/> : item.public ? <PoundIcon color={Colors.lightGreen700}/> : <PersonOutlineIcon color={Colors.lightBlue500}/>}/>;
                    }
                })
            }
            </ListPanel>;
            list.push(groupList);
        });

        let messagesList;
        let messages = this.state.messages;
        let pager = {
            page: this.state.page,
            recTotal: 0,
            recPerPage: 50,
            onPageChange: this._handPageChange
        };
        let pageMessages = null;
        if(!!messages) {
            pager.recTotal = messages.length;
            if(pager.recTotal) {
                if(pager.page === 0) {
                    pager.page = Math.ceil(pager.recTotal / pager.recPerPage);
                }
                let startIndex = (pager.page - 1) * pager.recPerPage;
                let endIndex = Math.min(startIndex + pager.recPerPage, pager.recTotal);
                pager.pageRecCount = endIndex - startIndex;
                pageMessages = messages.slice(startIndex, endIndex);
                messagesList = <MessageList messages={pageMessages} chatId={this.state.chat.gid} className='messages-list dock-full scroll-y user-selectable'/>;
            } else {
                messagesList = <ContentNotReady title={Lang.chat.noMessages}/>;
            }
        } else {
            messagesList = <Spinner/>;
        }

        let headerView = null;
        if(this.state.chat) {
            let chat = this.state.chat;
            let chatIcon = chat.isOne2One ? <UserAvatar size={20} user={chat.getTheOtherOne(App.user)} style={STYLE.headAvatar}/> : chat.public ? <ChatsIcon style={STYLE.headerIcon}/> : <PersonOutlineIcon style={STYLE.headerIcon}/>;
            let theOtherOne = chat.getTheOtherOne(App.user);
            let chatTitle = chat.getDisplayName(App);

            headerView = <div className='dock-top' style={STYLE.historyHeader}>
              <div>
                {chatIcon}
                <span style={STYLE.headerTitle}>{chatTitle}</span>
                {chat.public ? <small style={STYLE.publicGroup}>{Lang.chat.publicGroup}</small> : null}
                {pageMessages && pageMessages.length ? <TimeSpan style={STYLE.timespan} begin={pageMessages[0].date} end={pageMessages[pageMessages.length - 1].date} /> : null}
              </div>
              <div className='dock-right' style={STYLE.headerActions}>
                <Pager style={{float: 'left'}} {...pager} />
                <IconButton className="hint--bottom-left" disabled={this.state.loadBtnDisabled} data-hint={Lang.chat.downloadChatHistory} onClick={this._handleDownloadChatHistoryClick}><CloudDownloadIcon color={Theme.color.icon} hoverColor={Theme.color.primary1}/></IconButton>
              </div>
            </div>;
        }

        return <div {...other} style={style}>
          <div className='dock-left scroll-y' style={STYLE.menu}>{list}</div>
          <div className='dock-full' style={STYLE.history}>
            {headerView}
            <div className='dock-full' style={Object.assign({top: headerView ? 48 : 0}, STYLE.messageList)}>{messagesList}</div>
          </div>
        </div>
    }
});

export default ChatsManager;
