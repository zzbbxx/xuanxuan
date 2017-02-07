import React               from 'react';
import Theme               from '../../theme';
import {App, Lang, Config} from '../../app';
import PeopleIcon          from 'material-ui/svg-icons/social/people';
import SearchIcon          from 'material-ui/svg-icons/action/search';
import IconButton          from 'material-ui/IconButton';
import MembersList         from './members-list';
import ContactView         from './contact';
import Popover             from '../components/popover';
import Searchbox           from '../components/searchbox';
import R                   from '../../resource';

const Helper = global.Helper;

const STYLE = {
    header: {
        borderBottom: '1px solid ' + Theme.color.border, 
        padding: '10px 15px 10px 50px',
        lineHeight: '28px',
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
    searchbox: {
        backgroundColor: Theme.color.pale2,
    },
    headerTitle: {
        fontWeight: 500
    },
    listCol: {
        width: 300
    },
    listWrapper: {
        top: 49,
        backgroundColor: Theme.color.pale2
    },
    list: {
        paddingTop: 0,
        paddingBottom: 0
    }
};

/**
 * React component: ContactsPage
 */
const ContactsPage = React.createClass({

    getInitialState() {
        return {
            members: null,
            member: null,
        };
    },

    _updateMembers(members) {
        members = members || App.members;
        if(members) {
            let member = this.state.member;
            if(Helper.isNotEmptyString(this.searchText)) {
                members = members.filter(member => {
                    return (member.account && member.account.toLowerCase().includes(this.searchText))
                       || (member.realname && member.realname.toLowerCase().includes(this.searchText))
                       || (member.id && member.id == this.searchText);
                });
                member = null;
            }
            this.setState({members, member: member || (members.length ? members[0] : 0)});
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
        this.setState({member});
    },

    _handleMemberDoubleClick(member) {
        App.chat.create(member);
    },

    _handleSearchboxChange(searchText) {
        if(searchText !== this.searchText) {
            this.searchText = searchText.toLowerCase();
            this._updateMembers();
        }
    },

    _handleSearchButtonClick() {
        Popover.show({
            trigger  : this.headerElement,
            placement: 'cover',
            clickAway: () => {return Helper.isEmptyString(this.searchText);},
            content  : <Searchbox hintText={Lang.chat.searchContacts} style={STYLE.searchbox} onValueChange={this._handleSearchboxChange} />,
            onHide: () => {
                this._handleSearchboxChange('');
            }
        });
    },

    _titleCreator(member, title) {
        let roleText = member.role && Lang.user.roles[member.role] ? ('[' + Lang.user.roles[member.role] + ']') : null;
        if(roleText) {
            title = <div>{title}<small style={{float: 'right', opacity: 0.5}}>{roleText}</small></div>;
        }
        return title;
    },

    render() {
        let {
            style,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);

        return <div {...other} style={style}>
          <div className='dock-full table-row'>
            <div className='table-col relative' style={STYLE.listCol}>
              <header className='dock-top' style={STYLE.header} ref={(e) => this.headerElement = e}>
                <div><PeopleIcon style={STYLE.headerIcon}/><span style={STYLE.headerTitle}>{Lang.chat.contacts + (this.state.members && this.state.members.length ? (' (' + this.state.members.length + ')') : '')}</span></div>
                <div className='dock-right'>
                  <IconButton onClick={this._handleSearchButtonClick}><SearchIcon color={Theme.color.icon} hoverColor={Theme.color.primary1}/></IconButton>
                </div>
              </header>
              <div className='dock-full scroll-y' style={STYLE.listWrapper}>
                <MembersList titleCreator={this._titleCreator} showStatus={true} activeColor={Theme.color.canvas} activedMember={this.state.member} onItemDoubleClick={this._handleMemberDoubleClick} onItemClick={this._handleMemberClick} members={this.state.members} listStyle={STYLE.list} size="small"/>
              </div>
            </div>
            <div className='table-col relative'>
              <ContactView className='dock-full scroll-y' member={this.state.member}/>
            </div>
          </div>
        </div>
    }
});

export default ContactsPage;
