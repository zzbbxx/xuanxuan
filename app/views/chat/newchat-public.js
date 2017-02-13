import React               from 'react';
import Theme               from '../../theme';
import {App, Lang, Config} from '../../app';
import PeopleIcon          from 'material-ui/svg-icons/social/people';
import ArrowForwardIcon    from 'material-ui/svg-icons/navigation/arrow-forward';
import CheckIcon           from 'material-ui/svg-icons/navigation/check';
import List                from 'material-ui/List/List';
import Colors              from 'Utils/material-colors';
import ListDivider         from 'material-ui/Divider';
import RaisedButton        from 'material-ui/RaisedButton';
import SearchIcon          from 'material-ui/svg-icons/action/search';
import Avatar              from 'material-ui/Avatar';
import Spinner             from '../components/spinner';
import ListItem            from '../components/small-list-item';
import UserAvatar          from '../user-avatar';
import Messager            from '../components/messager';
import UserStatus          from './user-status';
import Searchbox           from '../components/searchbox';
import ContentNotReady     from '../misc/content-not-ready';
import ChatsIcon           from '../icons/comments-outline';
import R                   from '../../resource';
import Modal               from 'Components/modal';

const Helper = global.Helper;

const STYLE = {
    main: {
        borderLeft: '1px solid ' + Theme.color.border
    },
    header: {
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
    headerTitle: {
        fontWeight: 500
    },
    headActions: {
        right: 10,
        top: 6
    },
    toolbar: {
        top: 49,
        height: 30,
        padding: 5,
        backgroundColor: Theme.color.pale3,
        overflow: 'hidden'
    },
    toolbarLabel: {
        display: 'inline-block',
        padding: 5,
        height: 20,
        lineHeight: '20px'
    },
    searchbox: {
        width: 200,
        top: -5
    },
    content: {
        top: 89,
        padding: 8,
        backgroundColor: Theme.color.canvas
    },
    activeColor: Theme.color.pale1,
    checkIcon: {
        color: Colors.green500,
        fill: Colors.green500
    },
    list: {
        paddingTop: 0,
        paddingBottom: 0
    },
};

const NewChatPublic = React.createClass({

    getInitialState() {
        return {
            choosed: null,
            chats: null,
            searchText: null,
            joined: {}
        };
    },

    _loadData() {
        if(this.state.chats !== null) {
            this.setState({chats: null, choosed: null, joined: {}});
        }

        App.once(R.event.data_get_public_list, chats => {
            chats = chats.filter(c => {
                return !c.members.has(App.user.id);
            });
            this.setState({chats});
        });

        setTimeout(() => {
            App.chat.getPublicList();
        }, 1000);
    },

    componentDidMount() {
        this._loadData();
    },

    _handleChatItemClick(chat) {
        this.setState({choosed: chat.gid});
    },

    _handleOnJoinBtnClick() {
        if(this.state.choosed) {
            let chat = this.state.chats.find(x => x.gid === this.state.choosed);
            if(chat) {
                App.chat.inviteMembers(chat, [App.user]);
                let joined = this.state.joined;
                joined[chat.gid] = true;
                this.setState({joined, choosed: null});
                Modal.hide('new-chat');
            }
        }
    },

    _handleSearchboxChange(searchText) {
        if(searchText !== this.state.searchText) {
            this.setState({searchText});
        }
    },

    render() {
        let {
            style,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);

        let list, chats = this.state.chats;
        if(chats) {
            if(chats.length) {
                if(Helper.isNotEmptyString(this.state.searchText)) {
                    chats = chats.filter(member => {
                        return (chat.name && chat.name.toLowerCase().includes(this.state.searchText))
                           || (chat.id && chat.id == this.searchText);
                    });
                }
                list = <List style={STYLE.list}>
                {
                    chats.map(chat => {
                        let actived = !this.state.joined[chat.gid] && this.state.choosed === chat.gid;
                        let secondaryText = Lang.chat.numberOfMembers.format(chat.members.size);
                        return <ListItem disabled={this.state.joined[chat.gid]} style={STYLE.normalItem} actived={actived} activeColor={STYLE.activeColor} onClick={this._handleChatItemClick.bind(this, chat)} key={'newchat-public-' + chat._id} primaryText={chat.getDisplayName(App)} secondaryText={secondaryText} leftAvatar={<Avatar icon={<ChatsIcon/>} />} rightIcon={this.state.joined[chat.gid] ? <CheckIcon style={STYLE.checkIcon}/> : null} />
                    })
                }
                </List>;
            } else {
                list = <ContentNotReady title={Lang.chat.noAvaliablePublicGroup} />
            }
        } else {
            list = <Spinner />;
        }

        return <div {...other} style={style}>
          <header className='dock-top' style={STYLE.header}>
            <div><ArrowForwardIcon style={STYLE.headerIcon}/><span style={STYLE.headerTitle}>{Lang.chat.choosePublicGroup}</span></div>
            <div className='dock-right' style={STYLE.headActions}>
              <RaisedButton onClick={this._handleOnJoinBtnClick} disabled={!this.state.choosed} label={Lang.chat.join} primary={true} />
            </div>
          </header>
          <div className='dock-top' style={STYLE.toolbar}>
            <small className='text-muted' style={STYLE.toolbarLabel}>{Lang.chat.avaliablePublicGroup.format(this.state.chats ? this.state.chats.length : 0)}</small>
            <a onClick={this._loadData} style={STYLE.toolbarLabel}>{Lang.common.refresh}</a>
            <Searchbox onValueChange={this._handleSearchboxChange} className='dock-right' hintText={Lang.chat.searchPublicGroup} style={STYLE.searchbox}/>
          </div>
          <div className='dock-full scroll-y' style={STYLE.content}>
            {list}
          </div>
        </div>
    }
});

export default NewChatPublic;
