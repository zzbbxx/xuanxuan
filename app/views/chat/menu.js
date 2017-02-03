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

const ChatMenu = React.createClass({
    
    propTypes: {
        onItemClick: PropTypes.func
    },

    getInitialState() {
        return {
            data: {
                favs: [],
                recents: []
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

    _updateData(chats) {
        chats = chats || App.chat.all;

        if(!chats) return;

        let favs = [], recents = [], hiddens = [];
        chats.forEach(chat => {
            if(chat.hide && !chat.noticeCount) hiddens.push(chat);
            else if(chat.star) favs.push(chat);
            else recents.push(chat);
        });

        Chat.sort(favs, App);
        Chat.sort(recents, App);

        this.setState({data: {favs, recents, hiddens, showHiddenItems: hiddens.length ? this.state.showHiddenItems : false}});

        if(!this.state.activedItem) {
            let list = favs || recents;
            let first = list && list.length ? list[0] : null;
            if(first) this._handleItemClick('chat', first.gid, first);
        }
    },

    _handleListShowButtonClick() {
        this.setState({showHiddenItems: !this.state.showHiddenItems});
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
            }
        };
        
        let {
            style,
            ...other
        } = this.props;

        let listElements = [];
        Object.keys(this.state.data).forEach(key => {
            if(key === 'hiddens' && !this.state.showHiddenItems) return;
            const data = this.state.data[key];
            if(data && data.length) {
                let list = <List className={'menu-list-' + key} key={'menu-list-' + key} style={STYLE.list}>
                {
                    data.map(item => {
                        let rightIcon = (item.noticeCount && (!App.isWindowOpen || !App.isWindowsFocus || item.gid !== App.chat.activeChatWindow)) ? (<strong className="badge-circle-red" style={STYLE.rightIcon}>{item.noticeCount > 99 ? '99+' : item.noticeCount}</strong>) : (item.hide ? <VisibilityOffIcon color={Theme.color.icon} /> : null);
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
                </List>;
                let listHeader = <Subheader key={'subheader' + key} style={STYLE.subheader}>{Lang.chat[key + 'List']}</Subheader>;
                listElements.push(listHeader);
                listElements.push(list);
            }
        });

        if(this.state.data.hiddens && this.state.data.hiddens.length) listElements.push(<a key='showHiddenItemsBtn' onClick={this._handleListShowButtonClick} style={STYLE.listShowButton}>{this.state.showHiddenItems ? Lang.chat.hideHiddenChats : Lang.chat.showHiddenChats}</a>);

        style = Object.assign({}, STYLE.menu, style);
        return <div className='dock-left' style={style} {...other}>
          <List style={STYLE.list}>
            <ListItem key="newchat" size={48} actived={this.state.activedItem === 'newchat'} primaryText={Lang.chat.newChat} leftIcon={<ChatPlusIcon color={Theme.color.primary1}/>} style={STYLE.buttonItem} onClick={this._handleItemClick.bind(null, 'newchat', null)}/>
          </List>
          <div className='scroll-y dock-full' style={STYLE.listContainer}>{listElements}</div>
        </div>
    }
});

export default ChatMenu;
