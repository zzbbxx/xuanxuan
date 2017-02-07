import React               from 'react';
import Theme               from '../../theme';
import {App, Lang, Config} from '../../app';
import PeopleIcon          from 'material-ui/svg-icons/social/people';
import ArrowForwardIcon    from 'material-ui/svg-icons/navigation/arrow-forward';
import CheckIcon           from 'material-ui/svg-icons/navigation/check';
import FlatButton          from 'material-ui/FlatButton';
import List                from 'material-ui/List/List';
import ListDivider         from 'material-ui/Divider';
import Colors              from 'Utils/material-colors';
import RaisedButton        from 'material-ui/RaisedButton';
import SearchIcon          from 'material-ui/svg-icons/action/search';
import CreateChatIcon      from '../icons/comment-plus-outline';
import Spinner             from '../components/spinner';
import ListItem            from '../components/small-list-item';
import UserAvatar          from '../user-avatar';
import Messager            from '../components/messager';
import UserStatus          from './user-status';
import Searchbox           from '../components/searchbox';
import R                   from '../../resource';

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
    toolbarLink: {
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
    listItem: {
        float: 'left',
        width: '33.333333333%',
        minWidth: 140,
        padding: 4,
        boxSizing: 'border-box'
    }
};

const NewChatGroup = React.createClass({

    getDefaultProps() {
        return {
            showStatus: true
        };
    },

    getInitialState() {
        return {
            choosed: {},
            members: null
        };
    },

    _updateMembers(members) {
        members = members || App.members;
        if(members) {
            if(Helper.isNotEmptyString(this.searchText)) {
                members = members.filter(member => {
                    return (member.account && member.account.toLowerCase().includes(this.searchText))
                       || (member.realname && member.realname.toLowerCase().includes(this.searchText))
                       || (member.id && member.id == this.searchText);
                });
            }
            this.setState({members});
        }
    },

    componentDidMount() {
        this._updateMembers();
        this._handleDataChangeEvent = App.on(R.event.data_change, data => {
            if(data && data.members) {
                this._updateMembers(App.members);
            }
        });
    },

    componentWillUnmount() {
        App.off(this._handleDataChangeEvent);
    },

    _handleMemberClick(member) {
        let choosed = this.state.choosed;
        if(member.id === App.user.id) {
            choosed[member.id] = member;
            Messager.show({content: Lang.chat.chatMustInclueYourself, clickAway: true});
        } else if(choosed[member.id]) {
            delete choosed[member.id];
        } else {
            choosed[member.id] = member;
        }
        this.setState({choosed});
    },

    _handleOnCreateBtnClick() {
        let members = Object.keys(this.state.choosed).map(x => this.state.choosed[x]);
        App.chat.create(...members);
        this.setState({choosed: {[App.user.id]: App.user}});
    },

    _handleSearchboxChange(searchText) {
        if(searchText !== this.searchText) {
            this.searchText = searchText.toLowerCase();
            this._updateMembers();
        }
    },

    _handleSelectAllClick() {
        let choosed = this.state.choosed;
        this.state.members.forEach(member => {
            choosed[member.id] = member;
        });
        this.setState({choosed});
    },

    _handleSelectInverseClick() {
        let choosed = this.state.choosed;
        this.state.members.forEach(member => {
            if(member.id !== App.user.id) {
                if(choosed[member.id]) {
                    delete choosed[member.id];
                } else {
                    choosed[member.id] = member;
                }
            }
        });
        this.setState({choosed});
    },

    render() {
        let {
            style,
            showStatus,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);

        if(!this.state.members) {
            return <div {...other} style={style}><Spinner/></div>
        }

        let user = App.user;
        if(!this.state.choosed[user.id]) this.state.choosed[user.id] = user;

        let choosedMembersCount = Object.keys(this.state.choosed).length;
        let buttonLabel = choosedMembersCount > 2 ? Lang.chat.startGroupChat.format(choosedMembersCount) : choosedMembersCount === 2 ? Lang.chat.startOne2OneChat : Lang.chat.startChat;
        let listItemStyle = Object.assign({}, STYLE.listItem);
        if(this.listContainer) {
            let containerWidth = this.listContainer.clientWidth - 8*2;
            listItemStyle.width = Math.floor(containerWidth/Math.floor(containerWidth/180));
        }

        return <div {...other} style={style}>
          <header className='dock-top' style={STYLE.header}>
            <div><ArrowForwardIcon style={STYLE.headerIcon}/><span style={STYLE.headerTitle}>{Lang.chat.chooseContacts}</span></div>
            <div className='dock-right' style={STYLE.headActions}>
              <RaisedButton onClick={this._handleOnCreateBtnClick} disabled={choosedMembersCount < 2} label={buttonLabel} primary={true} />
            </div>
          </header>
          <div className='dock-top' style={STYLE.toolbar}>
            <a onClick={this._handleSelectAllClick} style={STYLE.toolbarLink}>{Lang.common.selectAll}</a>
            <a onClick={this._handleSelectInverseClick} style={STYLE.toolbarLink}>{Lang.common.selectInverse}</a>
            <Searchbox onValueChange={this._handleSearchboxChange} className='dock-right' hintText={Lang.chat.searchContacts} style={STYLE.searchbox}/>
          </div>
          <div className='dock-full scroll-y' ref={e => {this.listContainer = e;}} style={STYLE.content}>
            <List className='clearfix' style={STYLE.list}>
            {
                this.state.members.map(member => {
                    let actived = !!this.state.choosed[member.id];
                    let roleText = member.role && Lang.user.roles[member.role] ? ('[' + Lang.user.roles[member.role] + ']') : null;
                    let secondaryText = roleText;
                    let primaryText = showStatus && member.status ? <div><UserStatus status={member.status}/>{member.displayName}</div> : member.displayName;

                    return <ListItem className={'checkable-grid-item' + (actived ? ' active' : '')} rootStyle={listItemStyle} actived={actived} activeColor={STYLE.activeColor} onClick={this._handleMemberClick.bind(this, member)} key={'newchat-group-' + member._id} primaryText={primaryText} leftAvatar={<UserAvatar  size={30} user={member} style={STYLE.avatar}/>} rightIcon={actived ? <CheckIcon style={STYLE.checkIcon}/> : null} />
                })
            }
            </List>
          </div>
        </div>
    }
});

export default NewChatGroup;
