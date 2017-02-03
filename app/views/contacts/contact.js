import React               from 'react';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import Theme               from '../../theme';
import {App, Lang, Config} from '../../app';
import PeopleIcon          from 'material-ui/svg-icons/social/people';
import RaisedButton        from 'material-ui/RaisedButton';
import Spinner             from '../components/spinner';
import UserAvatar          from '../user-avatar';
import ChatsIcon           from '../icons/comments-outline';
import UserStatus          from '../chat/user-status';

const STYLE = {
    main: {
        backgroundColor: Theme.color.canvas
    },
    header: {
        position: 'relative',
        padding: '20px 20px 20px 120px',
        minHeight: 80
    },
    heading: {
        margin: '10px 0'
    },
    userAccount: {
        fontSize: '14px',
        fontWeight: 'normal',
        color: Theme.color.accent3
    },
    userInfo: {
        color: Theme.color.accent3,
        marginBottom: 10
    },
    avatar: {
        position: 'absolute',
        left: 20,
        top: 20
    },
    btnIcon: {
        color: Theme.color.canvas,
        fill: Theme.color.canvas,
        verticalAlign: 'middle',
    },
    section: {
        position: 'relative',
        borderTop: '1px solid ' + Theme.color.border,
        padding: '10px 0 10px 100px',
        minHeight: 60,
        margin: '0 20px'
    },
    sectionHeading: {
        position: 'absolute',
        left: 0,
        top: 10,
        width: 120,
        textAlign: 'center',
        color: Theme.color.accent3
    }
};

// display app component
const Contact = React.createClass({
    mixins: [PureRenderMixin],

    _handleSendMessageBtnClick() {
        if(this.member) {
            App.chat.create(this.member);
        }
        this.props.onSendBtnClick && this.props.onSendBtnClick(this.member);
    },

    render() {
        let {
            style,
            member,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);
        this.member = member;

        if(!member) {
          return <div {...other} style={style}><Spinner/></div>
        }

        let raisedButton = App.user.id === this.member.id ? null : <RaisedButton onClick={this._handleSendMessageBtnClick} label={<span><ChatsIcon style={STYLE.btnIcon}/> &nbsp; {Lang.chat.sendMessage}</span>} primary={true}/>;

        return <div {...other} style={style}>
          <header style={STYLE.header}>
            <UserAvatar size={80} user={member} style={STYLE.avatar}/>
            <h2 style={STYLE.heading}>{member.displayName} &nbsp; <small style={STYLE.userAccount}>@{member.account}</small></h2>
            <div style={STYLE.userInfo}><UserStatus status={member.status} type='dot-text' /> {Lang.user.genders[member.gender]} &nbsp; {Lang.user.roles[member.role]}</div>
            <div>{raisedButton}</div>
          </header>
          <section style={STYLE.section}>
            <div style={STYLE.sectionHeading}>{Lang.user.contact.info}</div>
          </section>
          <section style={STYLE.section}>
            <div style={STYLE.sectionHeading}>{Lang.user.contact.projects}</div>
          </section>
        </div>
    }
});

export default Contact;
