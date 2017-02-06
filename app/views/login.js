import '../assets/granim';
import React               from 'react';
import FlowerIcon          from 'material-ui/svg-icons/image/filter-vintage';
import TextField           from 'material-ui/TextField';
import Paper               from 'material-ui/Paper';
import RaisedButton        from 'material-ui/RaisedButton';
import FlatButton          from 'material-ui/FlatButton';
import Colors              from 'Utils/material-colors';
import IconButton          from 'material-ui/IconButton';
import List                from 'material-ui/List/List';
import CheckIcon           from 'material-ui/svg-icons/navigation/check';
import DeleteIcon          from 'material-ui/svg-icons/action/delete';
import Message             from './message';
import SwapIcon            from './icons/account-switch';
import Modal               from './components/modal';
import ListItem            from './components/small-list-item';
import UserAvatar          from './user-avatar';
import {User}              from '../models/entities';
import R                   from '../resource';
import BuildInfo           from './misc/build-info';
import Theme               from '../theme';
import App                 from '../app';
import Lang                from 'Lang';
import Helper              from 'Helper';

const STYLE = {
    login: {
        left: '-100%', 
        backgroundColor: Theme.palette.primary1Color,
        width: '100%',
    },
    canvas: {
        zIndex: 0,
        width: '100%',
        height: '100%'
    },
    header: {
        textAlign: 'center',
        padding: 20
    },
    logo: {
        maxWidth: 180,
        margin: '0 auto'
    },
    flower: {
        height: 50,
        width: 50,
        marginRight: 10,
        verticalAlign: 'middle'
    },
    heading: {
        fontSize: 40,
        lineHeight: '40px',
        color: Theme.color.alternateText,
        position: 'relative',
        top: 10
    },
    container: {
        minWidth: 400,
        maxWidth: '100%',
        position: 'relative',
        zIndex: 1
    },
    paper: {
        padding: 20,
    },
    textField: {
        width: '100%'
    },
    submit: {
        textAlign: 'center',
        marginTop: 10
    },
    message: {
        margin: '-20px -20px 0',
        padding: '10px 20px'
    },
    swapUserBtn: {
        position: 'absolute',
        top: 20,
        right: -10,
    },
    buildInfo: {
        position: 'absolute',
        right: 5,
        bottom: 5,
        color: Theme.color.canvas,
        opacity: 0.5,
        fontSize: '10px',
        zIndex: 1
    }
}

const LOGIN_TIME_OUT = 10000;

/**
 * React component SwapUser
 */
const SwapUser = React.createClass({
    getInitialState() {
        return {
            forHoverDelete: null
        };
    },

    _handUserSelect(user) {
        return this.props.onUserSelect && this.props.onUserSelect(user);
    },

    _handleItemMouseEnter(forHoverDelete) {
        this.setState({forHoverDelete})
    },

    _handleItemMouseLeave() {
        this.setState({forHoverDelete: null})
    },

    _handleDeleteBtnClick(key, e) {
        e.stopPropagation();
        e.preventDefault();

        App.config.removeUser(key);
        this.forceUpdate();
    },

    render() {
        let {
            selectedUser,
            onUserSelect,
            ...other
        } = this.props;

        selectedUser = selectedUser || App.user;
        let users = App.config.userList;

        return <List>
        {
            users.map(user => {
                let key = user.identify;
                let actived = key === selectedUser;
                let primaryText = <span>{(user.realname ? (user.realname + ' ') : '')}<small className='text-muted'>@{user.account}</small></span>;
                let forHoverDelete = key === this.state.forHoverDelete;
                let rightIcon = null;
                if(forHoverDelete) {
                    rightIcon = <DeleteIcon onClick={this._handleDeleteBtnClick.bind(this, key)} color={Theme.color.icon} hoverColor={Theme.color.negative}/>;
                } else if(actived) {
                    rightIcon = <CheckIcon color={Theme.color.positive}/>;
                }
                return <ListItem 
                    onMouseLeave={this._handleItemMouseLeave} 
                    onMouseEnter={this._handleItemMouseEnter.bind(this, key)} 
                    activeColor={Theme.color.pale1} 
                    onClick={this._handUserSelect.bind(this, user)} 
                    key={key} 
                    actived={actived} 
                    primaryText={primaryText} 
                    secondaryText={user.address} 
                    leftAvatar={<UserAvatar user={user} />} 
                    rightIcon={rightIcon}/>
            })
        }
        </List>
    }
});

/**
 * React component: Login
 */
const Login = React.createClass({
    getInitialState() {
        return {
            submitable: false,
            logining: false,
            message: '',
            messageColor: Colors.red500,
            account: '',
            address: '',
            password: ''
        };
    },

    handleSubmitClick() {
        this.setState({message: ''});
        App.login(this.user);
        clearTimeout(this.loginTimeoutCheck);
        this.loginTimeoutCheck = setTimeout(() => {
            if(this.state.logining) {
                this.setState({
                    logining: false, 
                    message: Lang.login.loginTimeout, messageColor: Colors.red500
                });
            }
        }, LOGIN_TIME_OUT);
    },

    _setUser(user) {
        if(!this.user) this.user = {
            address: this.state.address,
            password: this.state.password,
            account: this.state.account
        };
        if(user) {
            this.user.address = user.address;
            this.user.account = user.account;
            this.user.password = user.password;
        }
        let submitable = Helper.isNotEmptyString(this.user.address) 
            && Helper.isNotEmptyString(this.user.account) 
            && Helper.isNotEmptyString(this.user.password);
        this.setState({
            submitable,
            address: this.user.address,
            password: this.user.password,
            account: this.user.account
        });
    },

    handleFieldChange(feild, e) {
        this.setState({message: ''});
        this.user[feild] = e.target.value;
        this._setUser();
    },

    _handleSwapUserClick() {
        Modal.show({
            header: Lang.user.swapUser,
            actions: null,
            width: 400,
            content: () => {
                return <SwapUser selectedUser={'address::' + this.state.account + '@' + this.state.address} onUserSelect={this._handleUserSelect} />
            }
        });
    },

    _handleUserSelect(user) {
        Modal.hide();
        this.setState({message: ''});
        this._setUser(user);
    },

    componentWillMount() {
        let appUser = App.user;
        this.setState({
            message: '',
            displayed: false
        });
        this._setUser({
            address:   appUser.address, 
            account:  appUser.account, 
            password: appUser.password
        });
    },

    componentDidMount() {
        this._handleUserLoginBeginEvent = App.on(R.event.user_login_begin, () => {
            this.setState({logining: true});
        });

        this._handleUserLoginFinishEvent = App.on(R.event.user_login_finish, e => {
            clearTimeout(this.loginTimeoutCheck);

            if(!e.result) {
                this.state.message = e.error.reason || Lang.errors[e.error.code] || e.error.message;
                this.state.messageColor = Colors.red500;
            } else {
                this.state.message = '';
            }
            this.setState({logining: false});
        });

        this._handleUserStatusChangeEvent = App.on(R.event.user_status_change, (user, message) => {
            let isUnverified = App.user.isUnverified;
            this.setState({logining: isUnverified});
            if(message) {
                this.setState({message});
            }
            if(isUnverified) {
                this.granim.play();
            } else this.granim.pause();
        });

        this._handleSocketCloseEvent = App.on(R.event.socket_close, () => {
            if(this.state.logining) {
                this.setState({logining: false, message: Lang.errors.WRONG_CONNECT});
            }
        });

        this.granim = new Granim({
            element: '#loginBgCanvas',
            name: 'basic-gradient',
            direction: 'left-right',
            opacity: [1, 1],
            isPausedWhenNotInView: true,
            states : {
                "default-state": {
                    gradients: [
                        ['#2196F3', '#3F51B5'],
                        ['#673AB7', '#9C27B0'],
                        ['#E91E63', '#3F51B5']
                    ]
                }
            }
        });
        if(DEBUG) {
            this.handleSubmitClick();
        }
    },

    componentWillUnmount() {
        App.off(this._handleUserLoginBeginEvent, 
                this._handleUserLoginFinishEvent, 
                this._handleUserStatusChangeEvent, 
                this._handleSocketCloseEvent);
        this.granim.clear();
    },

    render() {
        let switchUserBtn = null;
        if(App.config.users && Object.keys(App.config.users).length) {
            switchUserBtn = <IconButton onClick={this._handleSwapUserClick} className='dock-right hint--top' style={STYLE.swapUserBtn} data-hint={Lang.user.swapUser}><SwapIcon color={Theme.color.icon} hoverColor={Theme.color.primary1}/></IconButton>
        }

        return <div {...this.props} className="dock-full center-block" style={STYLE.login} >
          <canvas id="loginBgCanvas" className="dock-full" style={STYLE.canvas} width={window.innerWidth} height={window.innerWidth}></canvas>
          <div style={STYLE.container}>
            <header style={STYLE.header}>
              <div style={STYLE.logo}><img src='img/logo-inverse.png' /></div>
            </header>
            <Paper zDepth={2} style={STYLE.paper}>
                <Message content={this.state.message} color={this.state.messageColor} style={STYLE.message} />
                <form id="loginForm">
                  <div className='relative'>
                    <TextField
                      name="address"
                      ref="address"
                      fullWidth={true}
                      hintText={Lang.login.addressHint}
                      floatingLabelText={Lang.login.address}
                      onChange={this.handleFieldChange.bind(this, 'address')}
                      value={this.user.address}
                    />
                    {switchUserBtn}
                  </div>
                  <div><TextField
                    name="account"
                    ref="account"
                    fullWidth={true}
                    hintText={Lang.login.accountHint}
                    floatingLabelText={Lang.login.account}
                    value={this.user.account}
                    onChange={this.handleFieldChange.bind(this, 'account')}
                  /></div>
                  <div><TextField
                    name="password"
                    ref="password"
                    fullWidth={true}
                    floatingLabelText={Lang.login.password}
                    value={this.user.password}
                    onChange={this.handleFieldChange.bind(this, 'password')}
                    type="password"
                  /></div>
                  <div style={STYLE.submit}><FlatButton fullWidth={true} label={this.state.logining ? Lang.login.logining : Lang.login.login} primary={true} disabled={!this.state.submitable || this.state.logining} onClick={this.handleSubmitClick} style={{display: 'block', width: '100%'}} backgroundColor={Theme.color.pale2} /></div>
                </form>
            </Paper>
          </div>
          <BuildInfo style={STYLE.buildInfo}/>
        </div>
    }
});

export default Login;

