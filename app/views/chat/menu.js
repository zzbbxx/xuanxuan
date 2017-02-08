import React, {PropTypes}  from 'react';
import Theme               from 'Theme';
import {App, Lang, Config} from '../../app';
import ChatPlusIcon        from '../icons/comment-plus-outline';
import UserAvatar          from '../user-avatar';
import ChatsIcon           from '../icons/comments-outline';
import ComtentTextIcon     from '../icons/comment-text';
import PoundIcon           from '../icons/pound-box';
import PeopleIcon          from 'material-ui/svg-icons/social/people';
import PersonOutlineIcon   from 'material-ui/svg-icons/social/people-outline';
import VisibilityOffIcon   from 'material-ui/svg-icons/action/visibility-off';
import List                from 'material-ui/List/List';
import ListDivider         from 'material-ui/Divider';
import Subheader           from 'material-ui/Subheader';
import ListItem            from '../components/small-list-item';
import UserStatus          from './user-status';
import R                   from '../../resource';
import Helper              from 'Helper';
import Colors              from 'Utils/material-colors';
import Chat                from 'Models/chat/chat';
import ListPanel           from 'Components/list-panel';
import Tabs                from 'Components/tabs';
import Modal               from 'Components/modal';
import TimeIcon            from 'material-ui/svg-icons/device/access-time';
import ListIcon            from 'material-ui/svg-icons/action/view-list';
import NewChatWindow       from './newchat';

const ChatMenu = React.createClass({
    
    propTypes: {
        onItemClick: PropTypes.func
    },

    getInitialState() {
        return {
            data: {
                fav: [],
                recent: []
            },
            type: App.user.config.ui.chat.menu.type || 'recent',
            listExpandState: {
                fav: true,
                recent: true,
                one2one: true
            },
            activedItem: false,
            showHiddenItems: false
        };
    },

    _handleItemClick(type, id, chat) {
        if(chat && chat.noticeCount !== undefined) {
            chat.noticeCount = 0;
            App.emit(R.event.chats_notice, {muteChats: [chat]});
        }

        if(type === 'chat' && Helper.isEmptyString(id)) return;
        
        let tag = type + (id !== undefined && id !== null ? ('#' + id) : '');
        if(this.state.activedItem !== tag) this.setState({activedItem: tag});
        return this.props.onItemClick && this.props.onItemClick(type, id, tag);
    },

    _handleItemContextMenu(chat, e) {
        e.preventDefault();
        App.popupContextMenu(App.chat.createActionsContextMenu(chat, window), e);
    },

    _updateData(chats, type) {
        if(typeof chats === 'string') {
            type = chats;
            chats = null;
        }
        type = type || this.state.type;
        chats = chats || App.chat.all;
        if(!chats) return;

        let data;
        if(type === 'recent') {
            let favs = [], recent = [], hiddens = [];
            chats.forEach(chat => {
                if(chat.hide && !chat.noticeCount) hiddens.push(chat);
                else if(chat.star) favs.push(chat);
                else recent.push(chat);
            });

            Chat.sort(favs, App);
            Chat.sort(recent, App);
            Chat.sort(hiddens, App);

            data = [
                {name: 'fav', title: Lang.chat.favList, items: favs},
                {name: 'recent', title: Lang.chat.recentList, items: recent},
                {name: 'hiddens', title: Lang.chat.hiddensList, items: hiddens}
            ];
        } else {
            const groupedOrder = {
                fav: 0,
                one2one: 1,
                channel: 2,
                group: 3
            };
            data = Helper.sortedArrayGroup(chats, chat => {
                if(chat.star) return 'fav';
                if(chat.public || chat.isSystem) return 'channel';
                if(chat.isOne2One) return 'one2one';
                return 'group';
            }, (group1, group2) => {
                return groupedOrder[group1.name] - groupedOrder[group2.name];
            });
            data.forEach(x => {
                 Chat.sort(x.items, App);
            });
        }

        this.setState({data, type});
        if(!this.state.activedItem && data && data.length && data[0].items.length) {
            let first = data[0].items[0];
            if(first) this._handleItemClick('chat', first.gid, first);
        }
    },

    _handleGroupExpandChange(key, isExpand) {
        let listExpandState = this.state.listExpandState;
        listExpandState[key] = isExpand;
        this.setState({listExpandState});
    },

    componentDidMount() {
        this._updateData();

        this._handleUIChangeEvent = App.on(R.event.ui_change, ui => {
            if(ui.navbar === R.ui.navbar_chat && ui.menu !== undefined) {
                if(!Array.isArray(ui.menu) && typeof(ui.menu) === 'string') {
                    ui.menu = ui.menu.split('#');
                }
                this._handleItemClick(...ui.menu);
            }
        });
        this._handleDataChangeEvent = App.on(R.event.data_change, data => {
            if(data.chats || data.members) {
                this._updateData();
            }
        });
    },

    componentWillUnmount() {
        App.off(this._handleUIChangeEvent, this._handleDataChangeEvent);
    },

    _handOnTabClick(tab) {
        if(tab !== 'newChat') {
            this._updateData(tab);
        } else {
            Modal.show({
                id: 'new-chat',
                removeAfterHide: true,
                header: Lang.chat.newChat,
                headerStyle: {backgroundColor: Theme.color.pale2},
                content:  () => {
                    return <NewChatWindow chat={this.state.chat} className="dock-full" style={{top: 50}}/>;
                },
                style: {left: 20, top: 20, right: 20, bottom: 0, position: 'absolute', overflow: 'hidden'},
                actions: false
            });
        }
    },

    componentDidUpdate(prevProps, prevState) {
        if(prevState && prevState.expand !== this.state.expand) {
            this.props.onExpand && this.props.onExpand(this.state.expand);
        }
        if(App.user.config.ui.chat.menu.type != this.state.type) {
            App.user.config.ui.chat.menu.type = this.state.type;
            clearTimeout(this.saveUserTask);
            this.saveUserTask = setTimeout(() => {
                App.saveUser();
            }, 2000);
        }
    },

    render() {
        const STYLE = {
            menu: {width: App.user.config.ui.chat.menu.width, backgroundColor: Theme.color.pale1, paddingBottom: 48},
            list: {
                backgroundColor: 'transparent', 
                paddingTop: 0, 
                paddingBottom: 0
            },
            listContainer: {
                top: 48
            },
            buttonItem: {color: Theme.color.primary1},
            rightIcon: {color: Theme.color.accent1, textAlign: 'right', paddingLeft: 0, lineHeight: '24px'},
            subheader: {fontSize: '12px', lineHeight: '30px', marginTop: 10, width: 'auto'},
            listShowButton: {
                fontSize: '13px',
                display: 'block',
                padding: '10px 15px'
            },
            userStatus: {
                position: 'absolute',
                bottom: 0,
                right: 0
            },
            tabs: {
                backgroundColor: 'rgba(0,0,0,.075)',
                width: '100%'
            },
            tabStyle: {
                height: 49,
                minWidth: 49,
                paddingLeft: 8,
                paddingRight: 8,
                width: '33.3333333%',
                display: 'table-cell',
                boxShadow: 'inset 0 -1px 0 rgba(0,0,0,.025), inset 0 -3px 2px rgba(0,0,0,.025)'
            },
            activeTabStyle: {
                backgroundColor: 'rgba(255,255,255,.3)',
                boxShadow: 'none'
            }
        };
        
        let {
            style,
            ...other
        } = this.props;

        let listElements = [];
        if(Array.isArray(this.state.data)) {
            this.state.data.forEach(data => {
                if(!data.items || !data.items.length) return;
                let key = data.name;
                let list = <ListPanel
                className={'small menu-list-' + key}
                headingStyle={{color: Theme.color.icon, fontSize: '12px'}}
                headingIconStyle={{color: Theme.color.icon, fill: Theme.color.icon}}
                key={'menu-list-' + key} 
                style={STYLE.list}
                heading={(data.title || Lang.chat.chatTypes[key])}
                expand={!!this.state.listExpandState[key]}
                onExpand={isExpand => {this._handleGroupExpandChange(key, isExpand);}}
                >
                {
                    data.items.map(item => {
                        let rightIcon = (item.noticeCount && (!App.isWindowOpen || !App.isWindowsFocus || item.gid !== App.chat.activeChatWindow)) ? (<strong className="badge-circle-red" style={STYLE.rightIcon}>{item.noticeCount > 99 ? '99+' : item.noticeCount}</strong>) : null;
                        let itemKey = 'chat#' + item.gid;
                        if(item.isOne2One) {
                            let theOtherOne = item.getTheOtherOne(App.user);
                            let primaryText = item.getDisplayName(App);
                            return <ListItem key={itemKey} actived={this.state.activedItem === itemKey} onContextMenu={this._handleItemContextMenu.bind(this, item)} onClick={this._handleItemClick.bind(null, 'chat', item.gid, item)} primaryText={primaryText} leftAvatar={<UserAvatar size={20} user={theOtherOne} style={STYLE.avatar} className={theOtherOne && theOtherOne.isOffline ? 'grayscale' : ''}/>} rightIcon={rightIcon}/>;
                        } else {
                            return <ListItem key={itemKey} actived={this.state.activedItem === itemKey} onContextMenu={this._handleItemContextMenu.bind(this, item)} onClick={this._handleItemClick.bind(null, 'chat', item.gid, item)} primaryText={item.getDisplayName(App)} rightIcon={rightIcon} leftIcon={item.isSystem ? <ComtentTextIcon color={Colors.indigo500}/> : item.public ? <PoundIcon color={Colors.lightGreen700}/> : <PersonOutlineIcon color={Colors.lightBlue500}/>}/>;
                        }
                    })
                }
                </ListPanel>;
                listElements.push(list);
            });
            
        }

        let tabs = [{
            key: 'recent',
            label: <TimeIcon color={this.state.type === 'recent' ? Theme.color.primary1 : Theme.color.icon} hoverColor={Theme.color.primary1}/>,
            hint: Lang.chat.recentChats
        }, {
            key: 'contacts',
            label: <ListIcon color={this.state.type === 'contacts' ? Theme.color.primary1 : Theme.color.icon} hoverColor={Theme.color.primary1}/>,
            hint: Lang.chat.allChats
        }, {
            key: 'newChat',
            label: <ChatPlusIcon color={Theme.color.icon} hoverColor={Theme.color.primary1}/>,
            hint: Lang.chat.newChat
        }];

        style = Object.assign({}, STYLE.menu, style);
        return <div className='dock-left' style={style} {...other}>
          <Tabs
            onTabClick={this._handOnTabClick}
            tabs={tabs}
            selected={this.state.type}
            style={STYLE.tabs}
            tabStyle={STYLE.tabStyle}
            activeTabStyle={STYLE.activeTabStyle}
          />
          <div className='scroll-y dock-full' style={STYLE.listContainer}>{listElements}</div>
        </div>
    }
});

export default ChatMenu;
