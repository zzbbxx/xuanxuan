import React         from 'react';
import ClickAwayable from 'react-clickaway';
import List          from 'material-ui/List/List';
import ListDivider   from 'material-ui/Divider';
import Colors        from 'Utils/material-colors';
import Avatar        from 'material-ui/Avatar';
import FontIcon      from 'material-ui/FontIcon';
import Paper         from 'material-ui/Paper';
import Menu          from 'material-ui/Menu';
import MenuItem      from 'material-ui/MenuItem';
import MenuDivider   from 'material-ui/Divider';
import IconButton    from 'material-ui/IconButton';
import ChatIcon      from 'material-ui/svg-icons/communication/chat-bubble';
import PeopleIcon    from 'material-ui/svg-icons/social/people';
import AppsIcon      from 'material-ui/svg-icons/action/dashboard';
import MoreIcon      from 'material-ui/svg-icons/navigation/more-vert';
import MenuIcon      from 'material-ui/svg-icons/navigation/menu';
import CvLeftIcon    from 'material-ui/svg-icons/navigation/chevron-left';
import CheckIcon     from 'material-ui/svg-icons/navigation/check';
import UserAvatar    from './user-avatar';
import ListItem      from './components/small-list-item';
import UserStatus    from './chat/user-status';
import Theme         from '../theme';
import Lang          from '../lang';
import R             from '../resource';
import App           from '../app';
import {USER_STATUS} from 'Models/user';

const userStatus = [
    USER_STATUS.online,
    USER_STATUS.busy,
    USER_STATUS.away,
    USER_STATUS.offline,
];

const UserMenu = React.createClass({
    mixins: [ClickAwayable],

    getInitialState() {
        return {
            canUpdate: App.hasNewVersion
        }
    },

    componentClickAway() {
        if(this.props.onClickAway) this.props.onClickAway();
    },

    handleStatusItemClick(status) {
        if(status === 'offline' || status === 'unverified') {
            App.user.changeStatus(USER_STATUS.unverified);
        } else if(App.user.isOffline) {
            App.login();
        } else {
            App.changeUserStatus(status);
        }
        this.componentClickAway();
    },

    handleExitClick() {
        this.componentClickAway();
        App.quit();
    },

    handleProfileClick() {
        App.openProfile();
        this.componentClickAway();
    },

    handleAboutClick() {
        App.openAbout();
        this.componentClickAway();
    },

    handleDevToolClick() {
        App.openDevWindow();
        this.componentClickAway();
    },

    handleRestartBtnClick() {
        App.reloadApp();
        this.componentClickAway();
    },

    render() {
        const STYLE = {
            menu: {paddingTop: 8, paddingBottom: 8},
            menuItem: {fontSize: '13px'},
            focusMenuItem: {
                fontSize: '13px',
                color: Theme.color.positive,
                boxShadow: 'inset 3px 0 0 ' + Theme.color.positive,
                fontWeight: '500',
            },
            navbar:    {width: App.user.config.ui.navbar.width, transition: Theme.transition.normal('width'), backgroundColor: Theme.color.primary1, zIndex: 20},
            status:    {
                base:   {position: 'absolute', left: -29, top: 13, transition: Theme.transition.normal('left', 'top')},
                dot: {display: 'block', width: 10, height: 10, borderRadius: 6, marginRight: 5},
                inmenu: {
                  dot: {position: 'relative', top: 1, marginRight: 10},
                  text: {fontSize: '14px'}
                }
            }
        };

        let that = this;
        let thisStatus = this.props.user.statusValue;
        return <div className='menu-wrapper' style={{position: 'relative', left: 0, minWidth: 200}}>
          <Paper style={{position: 'absolute', top: -15, zIndex: 2}}>
            <Menu key='user-menu' desktop={true} autoWidth={false} width={STYLE.navbar.width} animated={false} className='navbar-user-menu' listStyle={STYLE.menu}>
                {
                    userStatus.map(function(statusValue) {
                        let statusName = USER_STATUS[statusValue];
                        let iconStyle = Object.assign({}, STYLE.status.base, STYLE.status[statusName], STYLE.status.inmenu);
                        let icon = <span className={'user-status user-status-' + statusName} style={iconStyle}></span>;
                        let rightIcon = null;
                        if(statusValue === thisStatus) {
                            rightIcon = <CheckIcon style={{margin: 0}} />
                        }
                        return <MenuItem key={statusName} primaryText={<UserStatus textStyle={STYLE.status.inmenu.text} text={statusValue === USER_STATUS.offline ? Lang.user.status.offline : Lang.user.status[statusName]} dotStyle={STYLE.status.inmenu.dot} type='dot-text' status={statusName} />} rightIcon={rightIcon} onClick={that.handleStatusItemClick.bind(null, statusName)}/>
                    })
                }
                <MenuDivider />
                <MenuItem style={STYLE.menuItem} key='profile' primaryText={Lang.user.profile} onClick={this.handleProfileClick} />
                <MenuDivider />
                <MenuItem style={STYLE.menuItem} key='about' primaryText={Lang.common.about} onClick={this.handleAboutClick} />
                <MenuItem style={STYLE.menuItem} key='exit' primaryText={Lang.common.exit} onClick={this.handleExitClick} />
            </Menu>
          </Paper>
        </div>
    }
});

const Navbar = React.createClass({
    // mixins: [ClickAwayable],

    getInitialState() {
        return {
            expand: App.user.config.ui.navbar.expand,
            active: App.user.config.ui.navbar.page,
            user: {name: 'Guest', status: 'online'},
            menu: false,
            dock: App.user.config.ui.navbar.dock || 'left',
            chatNoticeCount: 0
        };
    },

    setExpand(expand, ignoreUpdate) {
        this.setState({expand});
        App.emit(R.event.ui_navbar_expand, {expand, width: expand ? App.user.config.ui.navbar.width : App.user.config.ui.navbar.compactWidth, dock: this.state.dock});
    },

    componentClickAway() {
        if(this.state.expand) this.setExpand(false);
    },

    handleItemClick(name) {
        App.changeUI({navbar: name});
    },

    hideMenu() {
        if(this.state.menu) this.setState({menu: false});
    },

    handleUserAvatarClick() {
        this.setState({menu: !this.state.menu});
    },

    handleExpandToggerClick() {
        this.setExpand(!this.state.expand);
    },

    componentDidMount() {
        this._handleUserChangeEvent = App.on(R.event.user_change, e => {
            this.setState({user: App.user});
        });
        this._handleUserLoginFinishEvent = App.on(R.event.user_status_change, e => {
            this.setState({user: App.user});
        });
        this._handleUIChangeEvent = App.on(R.event.ui_change, e => {
            if(e.navbar) {
                this.setState({active: e.navbar});
            }
        });
        this._handleChatNoticeEvent = App.on(R.event.chats_notice_change, chatNoticeCount => {
            this.setState({chatNoticeCount});
        });
    },

    componentWillUnmount() {
        App.off(this._handleUIChangeEvent, this._handleUserLoginFinishEvent, this._handleUserChangeEvent, this._handleChatNoticeEvent);
    },

    render() {
        const STYLE = {
          compactWidth: App.user.config.ui.navbar.compactWidth,
          navbar:    {width: App.user.config.ui.navbar.width, transition: Theme.transition.normal('width'), backgroundColor: Theme.color.primary1, zIndex: 20},
          icon:      {left: 5},
          rightIcon: {right: 6, top: 14},
          list:      {backgroundColor: 'transparent'},
          navItem:   {paddingTop: 6, paddingBottom: 6, maxHeight: 60},
          avatar:    {left: 7},
          footer:    {backgroundColor: 'transparent', position: 'absolute', left: 0, right: 0, bottom: 0, padding: 0},
          footerItem:{maxHeight: 48},
          iconButton:{position: 'absolute', left: 1, top: -4},
          tooltip:   {pointerEvents: 'none', fontSize: '12px', zIndex: 100},
          status:    {
              base:   {position: 'absolute', left: -29, top: 13, transition: Theme.transition.normal('left', 'top')},
              dot: {display: 'block', width: 10, height: 10, borderRadius: 6, marginRight: 5},
          },
          noticeBadge: {
              position: 'absolute',
              top: 8,
              left: 5,
              width: 40,
              height: 20,
              color: Theme.color.primary1,
              textAlign: 'center',
              lineHeight: '20px',
              zIndex: 1,
              fontSize: '12px'
          }
        };

        let listItems = [
            {name: R.ui.navbar_chat,   text: "会话", icon: <ChatIcon className='icon' style={STYLE.icon}/>},
            {name: R.ui.navbar_contacts,   text: "通讯录", icon: <PeopleIcon className='icon' style={STYLE.icon}/>}
        ];

        let that = this;
        let tooltipPlacement = (this.state.dock === 'left' ? 'right' : 'left');
        let statusStyle = Object.assign({}, STYLE.status.base);

        let userDisplayName = this.state.expand ? (this.state.user.displayName || this.state.user.realName || this.state.user.account) : null;
        let userAvatar = <UserAvatar user={this.state.user} style={STYLE.avatar} size={36}/>;
        let userInfo =  <div style={{position: 'relative'}}><UserStatus style={statusStyle} dotStyle={STYLE.status.dot} status={this.state.user.status} /><strong>{userDisplayName}&nbsp;</strong></div>;
        let moreIcon = this.state.expand ? <MoreIcon className='icon' style={STYLE.rightIcon} /> : null;
        let menuIcon = this.state.expand ? <CvLeftIcon className='icon' style={STYLE.icon} /> : <MenuIcon className='icon' style={STYLE.icon} />;
        let menuText = this.state.expand ? Lang.navbar.collapse : Lang.navbar.expand;

        let navbarStyle = Object.assign({}, STYLE.navbar);
        if(!this.state.expand) navbarStyle.width = STYLE.compactWidth;

        let expandTogger;
        if(that.state.expand) {
            expandTogger = <ListItem className='item text-ellipsis' key='expand-togger' primaryText={menuText} leftIcon={menuIcon} onClick={that.handleExpandToggerClick} style={STYLE.footerItem}/>
        } else {
            expandTogger = <ListItem data-hint={menuText} className={'item hint--' + tooltipPlacement} key='expand-togger' leftIcon={menuIcon} primaryText='&nbsp;' onClick={that.handleExpandToggerClick} style={STYLE.footerItem}/>;
        }

        let menu = null;
        if(this.state.menu) {
           menu = <UserMenu user={this.state.user} onClickAway={this.hideMenu}/>
        }

        let navbarClassName = 'navbar dock-' + this.state.dock;
        if(this.state.expand) navbarClassName += ' expand';

        return (
          <div {...this.props} className={navbarClassName} style={navbarStyle}>
            <List className='list navbar-header' style={STYLE.list}>
              <ListItem className='item text-ellipsis' key='user-info' primaryText={userInfo} leftAvatar={userAvatar} onClick={that.handleUserAvatarClick} rightIconButton={moreIcon} style={{fontSize: '14px'}}/>
            </List>
            {menu}
            <ListDivider style={STYLE.list} />
            <List className='list navbar-nav' style={STYLE.list}>
            {
                listItems.map(item => {
                    let className = 'item';
                    if(item.name === that.state.active) className += ' active';
                    if(that.state.expand) {
                        let primaryText = item.text;
                        if(item.name === R.ui.navbar_chat && this.state.chatNoticeCount) {
                            primaryText += ' [ ' + this.state.chatNoticeCount + ' ]';
                        }
                        className += ' text-ellipsis';
                        return  <ListItem className={className} key={item.name} primaryText={primaryText} leftIcon={item.icon} onClick={that.handleItemClick.bind(null, item.name)} style={STYLE.navItem} />;
                    } else {
                        className += ' hint--' + tooltipPlacement;
                        let noticeCountText = null;
                        if(item.name === R.ui.navbar_chat && this.state.chatNoticeCount) {
                            noticeCountText = <div style={STYLE.noticeBadge}>{this.state.chatNoticeCount > 99 ? '99' : this.state.chatNoticeCount}</div>;
                        }
                        return  <ListItem leftIcon={item.icon} data-hint={item.text} className={className} key={item.name} primaryText='&nbsp;' onClick={that.handleItemClick.bind(null, item.name)} style={STYLE.navItem}>{noticeCountText}</ListItem>;
                    }
                })
            }
            </List>
            <List className='list navbar-footer' style={STYLE.footer}>{expandTogger}</List>
            {this.props.children}
          </div>
        );
    }
});

export default Navbar;
