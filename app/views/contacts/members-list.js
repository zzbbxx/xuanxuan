import React, {PropTypes}  from 'react';
import Theme               from '../../theme';
import {App, Lang, Config} from '../../app';
import List                from 'material-ui/List/List';
import ListDivider         from 'material-ui/Divider';
import ChevronRightIcon    from 'material-ui/svg-icons/navigation/chevron-right';
import Colors              from 'Utils/material-colors';
import ListItem            from '../components/small-list-item';
import UserAvatar          from '../user-avatar';
import UserStatus          from '../chat/user-status';
import R                   from '../../resource';

const STYLE = {
    list: {
        backgroundColor: 'transparent'
    },
    normalItem: {
        borderBottom: '1px solid ' + Theme.color.border
    },
    status: {
        online: {color: Colors.greenA400},
        offline:{color: Colors.grey400},
        busy:   {color: Colors.yellowA400},
        away:   {color: Colors.redA400},
    }
};

// display app component
const MembersList = React.createClass({

    propTypes: {
        onItemDoubleClick: PropTypes.func
    },

    getDefaultProps() {
        return {
            showStatus: true
        };
    },

    _handleItemClick(member) {
        return this.props.onItemClick && this.props.onItemClick(member);
    },

    _handleItemDoubleClick(member) {
        return this.props.onItemDoubleClick && this.props.onItemDoubleClick(member);
    },

    componentDidMount() {
        this._handleDataChangeEvent = App.on(R.event.data_change, data => {
            if(data.members) {
                this.forceUpdate();
            }
        });
    },

    componentWillUnmount() {
        App.off(this._handleDataChangeEvent);
    },

    render() {
        let {
            style,
            size,
            listStyle,
            members,
            showStatus,
            activedMember,
            onItemClick,
            activeColor,
            ...other
        } = this.props;

        members = members || [];

        return <div {...other} style={style}>
          <List style={Object.assign({}, STYLE.list, listStyle)}>
          {
             members.map(member => {
                member = App.dao.members[typeof(member) === 'number' ? member : member.id] || member;
                let actived = activedMember && activedMember.id === member.id;
                if(size === 'small') {
                    let primaryText = showStatus && member.status ? <span><UserStatus status={member.status} />{member.displayName}</span> : member.displayName;
                    return <ListItem onDoubleClick={this._handleItemDoubleClick.bind(this, member)} onClick={this._handleItemClick.bind(this, member)} key={member._id} actived={actived} activeColor={activeColor} primaryText={primaryText} leftAvatar={<UserAvatar size={20} user={member} style={STYLE.avatar}/>} />
                } else {
                    let roleText = member.role && Lang.user.roles[member.role] ? ('[' + Lang.user.roles[member.role] + ']') : null;
                    let secondaryText = showStatus && member.status ? <span><UserStatus type='dot-text' status={member.status} /> &nbsp; &nbsp; {roleText}</span> : roleText;
                    return <ListItem style={STYLE.normalItem} actived={actived} activeColor={activeColor} onDoubleClick={this._handleItemDoubleClick.bind(this, member)} onClick={this._handleItemClick.bind(this, member)} key={member._id} primaryText={member.displayName} secondaryText={secondaryText} leftAvatar={<UserAvatar user={member} style={STYLE.avatar}/>} rightIcon={actived ? <ChevronRightIcon /> : null} />
                }
             })
          }
          </List>
        </div>
    }
});

export default MembersList;
