import React               from 'react';
import Theme               from '../../theme';
import {App, Lang, Config} from '../../app';
import PeopleIcon          from 'material-ui/svg-icons/social/people';
import ArrowForwardIcon    from 'material-ui/svg-icons/navigation/arrow-forward';
import CheckIcon           from 'material-ui/svg-icons/navigation/check';
import List                from 'material-ui/List/List';
import ListDivider         from 'material-ui/Divider';
import Colors              from 'Utils/material-colors';
import RaisedButton        from 'material-ui/RaisedButton';
import PersonAddIcon       from 'material-ui/svg-icons/social/person-add';
import CreateChatIcon      from '../icons/comment-plus-outline';
import Spinner             from '../components/spinner';
import ListItem            from '../components/small-list-item';
import UserAvatar          from '../user-avatar';
import UserStatus          from './user-status';

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
    content: {
        top: 49,
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
        minWidth: 100,
        padding: 4,
        boxSizing: 'border-box'
    },
    status: {
        online: {color: Colors.greenA400},
        offline:{color: Colors.grey400},
        busy:   {color: Colors.yellowA400},
        away:   {color: Colors.redA400},
    },
    subheader: {
        color: Theme.color.accent1,
        padding: 5,
        fontSize: '12px'
    },
    hr: {
      width: '100%',
      marginTop: 8,
      marginBottom: 8
    }
};

const InviteMembers = React.createClass({
    getDefaultProps() {
        return {
            showStatus: true
        };
    },

    getInitialState() {
        return {
            choosed: {}
        };
    },

    _handleMemberClick(member) {
        let choosed = this.state.choosed;
        if(choosed[member.id]) {
            delete choosed[member.id];
        } else {
            choosed[member.id] = member;
        }
        this.setState({choosed});
    },

    _handleOnInviteBtnClick() {
        let members = Object.keys(this.state.choosed).map(x => this.state.choosed[x]);
        this.setState({choosed: {}});
        this.props.onInviteButtonClick && this.props.onInviteButtonClick(members);
    },

    render() {
        let {
            style,
            chatId,
            members,
            showStatus,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);

        if(!members) {
            return <div {...other} style={style}><Spinner/></div>
        } else {
            members.sort((x, y) => y.orderCompareValue - x.orderCompareValue);
        }

        let choosedMembers = [], unChoosedMembers = [];
        members.forEach(m => {
            if(this.state.choosed[m.id]) choosedMembers.push(m);
            else unChoosedMembers.push(m);
        });
        let choosedMembersCount = choosedMembers.length;
        let listItemStyle = Object.assign({}, STYLE.listItem);
        if(this.listContainer) {
            let containerWidth = this.listContainer.clientWidth - 8 - 20;
            listItemStyle.width = Math.floor(containerWidth/Math.floor(containerWidth/145));
        }

        return <div {...other} style={style}>
          <header className='dock-top' style={STYLE.header}>
            <div><PersonAddIcon style={STYLE.headerIcon}/><span style={STYLE.headerTitle}>{Lang.chat.chooseContacts}</span></div>
            <div className='dock-right' style={STYLE.headActions}>
              <RaisedButton onClick={this._handleOnInviteBtnClick} disabled={choosedMembersCount < 1} label={Lang.chat.invite} primary={true} />
            </div>
          </header>
          <div className='dock-full scroll-y' style={STYLE.content} ref={e => {this.listContainer = e;}}>
            {choosedMembersCount ? <div className='small text-muted' style={STYLE.subheader}>{Lang.common.selected} ({choosedMembersCount})</div> : null}
            <List className='clearfix' style={STYLE.list}>
            {
                choosedMembers.map(member => {
                    return <ListItem rootStyle={listItemStyle} className={'checkable-grid-item active'} style={STYLE.normalItem} actived={true} activeColor={STYLE.activeColor} onClick={this._handleMemberClick.bind(this, member)} key={'invite-member-' + member._id} primaryText={<div><UserStatus status={member.status}/>{member.displayName}</div>} leftAvatar={<UserAvatar user={member} size={30} style={STYLE.avatar}/>} />
                })
            }
            </List>
            {(choosedMembersCount && unChoosedMembers.length) ? <ListDivider style={STYLE.hr} /> : null}
            <List className='clearfix' style={STYLE.list}>
            {
                unChoosedMembers.map(member => {
                    return <ListItem rootStyle={listItemStyle} className={'checkable-grid-item'} style={STYLE.normalItem} actived={false} activeColor={STYLE.activeColor} onClick={this._handleMemberClick.bind(this, member)} key={'invite-member-' + member._id} primaryText={<div><UserStatus status={member.status}/>{member.displayName}</div>} leftAvatar={<UserAvatar user={member} size={30} style={STYLE.avatar}/>} />
                })
            }
            </List>
          </div>
        </div>
    }
});

export default InviteMembers;
