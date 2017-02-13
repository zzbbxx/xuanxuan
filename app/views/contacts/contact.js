import React               from 'react';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import Theme               from 'Theme';
import {App, Lang, Config} from 'App';
import {List, ListItem}    from 'material-ui/List';
import Subheader           from 'material-ui/Subheader';
import PeopleIcon          from 'material-ui/svg-icons/social/people';
import MailIcon            from 'material-ui/svg-icons/communication/email';
import MobileIcon          from 'material-ui/svg-icons/hardware/smartphone';
import PhoneIcon           from 'material-ui/svg-icons/communication/phone';
import WebIcon             from 'material-ui/svg-icons/av/web';
import RaisedButton        from 'material-ui/RaisedButton';
import Avatar              from 'material-ui/Avatar';
import Spinner             from '../components/spinner';
import UserAvatar          from '../user-avatar';
import ChatsIcon           from '../icons/comment-text';
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

        let contactsItems = [];
        if(member.email) {
            contactsItems.push(<ListItem
                key="contact-email"
                leftAvatar={<Avatar icon={<MailIcon />} backgroundColor={Theme.colors.blue500} />}
                primaryText={Lang.user.contact.email}
                secondaryText={member.email}
            />);
        }
        if(member.mobile) {
            contactsItems.push(<ListItem
                key="contact-mobile"
                leftAvatar={<Avatar icon={<MobileIcon />} backgroundColor={Theme.colors.green500} />}
                primaryText={Lang.user.contact.mobile}
                secondaryText={member.mobile}
            />);
        }
        if(member.phone) {
            contactsItems.push(<ListItem
                key="contact-phone"
                leftAvatar={<Avatar icon={<PhoneIcon />} backgroundColor={Theme.colors.teal500} />}
                primaryText={Lang.user.contact.phone}
                secondaryText={member.phone}
            />);
        }
        if(member.site) {
            contactsItems.push(<ListItem
                key="contact-site"
                leftAvatar={<Avatar icon={<WebIcon />} backgroundColor={Theme.colors.lightBlue500} />}
                primaryText={Lang.user.contact.site}
                secondaryText={member.site}
            />);
        }

        return <div {...other} style={style}>
          <header style={STYLE.header}>
            <UserAvatar size={80} user={member} style={STYLE.avatar}/>
            <h2 style={STYLE.heading}>{member.displayName} &nbsp; <small style={STYLE.userAccount}>@{member.account}</small></h2>
            <div style={STYLE.userInfo}><UserStatus status={member.status} type='dot-text' /> &nbsp; &nbsp; {Lang.user.genders[member.gender]} &nbsp; {Lang.user.roles[member.role]}</div>
            <div>{raisedButton}</div>
          </header>
          <section style={STYLE.section}>
            {contactsItems.length ? <List><Subheader>{Lang.user.contact.info}</Subheader>{}{contactsItems}</List> : null}
          </section>
        </div>
    }
});

export default Contact;
