import React                from 'react';
import EnhancedButton       from 'material-ui/internal/EnhancedButton';
import Lang                 from '../lang';
import Theme                from '../theme';
import Navbar               from './navbar';
import PageContianer        from './page-container';
import Login                from './login';
import Hotkey               from './mixins/hotkey';
import Messager             from './components/messager';
import AppActionLink        from '../utils/app-link';
import R                    from '../resource';
import App                  from '../app';

EnhancedButton.defaultProps.disableTouchRipple = true;
EnhancedButton.defaultProps.disableFocusRipple = true;

const STYLE = {
    app: {
        transition: Theme.transition.long('left'), 
        width: '100%',
        color: Theme.color.text
    }
}

// React component: AppContainer
const AppContainer = React.createClass({
    mixins: [Hotkey],

    onHotkeyPress(e) {
        if(e && (e.ctrlKey || e.shiftKey || e.metaKey || e.altKey)) {
            if(DEBUG) {
                console.log("%cKEY PRESS " + (e.ctrlKey ? 'Ctrl + ' : '') + (e.shiftKey ? 'Shift + ' : '') + (e.altKey ? 'Alt + ' : '') + (e.metaKey ? 'Meta + ' : '') + e.keyCode, 'display: inline-block; font-size: 10px; color: #8D6E63; border: 1px solid #8D6E63; padding: 1px 5px; border-radius: 2px', e);
            }

            App.emit(R.event.ui_hotkey, e);
        }
    },

    getInitialState() {
        return {
            login: true
        };
    },

    componentDidMount() {
        this._handleUserChangeEvent = App.on(R.event.user_change, e => {
            return this.setState({login: App.user.isUnverified});
        });

        this._handleUserStatusChangeEvent = App.on(R.event.user_status_change, (user, message) => {
            let isUnverified = App.user.isUnverified;
            this.setState({login: isUnverified});
            if(message && !isUnverified) {
                Messager.show({
                    clickAway: true,
                    autoHide: user.isOnline,
                    content: message,
                    color: user.isOnline ? Theme.color.positiveColor : Theme.color.negative
                });
            } else {
                Messager.hide();
            }
        });
    },

    componentWillUnmount() {
        App.off(this._handleUserChangeEvent, this._handleUserStatusChangeEvent);
    },

    _handleOnAppClick(e) {
        let target = e.target;
        while(target && !((target.classList && target.classList.contains('link-app')) || (target.tagName === 'A' && target.attributes['href']))) {
            target = target.parentNode;
        }
        if(target && ((target.classList && target.classList.contains('link-app')) || (target.tagName === 'A' && target.attributes['href']))) {
            let link = target.attributes['href'] || target.attributes['data-target'];
            if(link && link.value) {
                App.emit(R.event.ui_link, new AppActionLink(link.value, e));
            }
            e.preventDefault();
        }
    },

    render() {
        let appStyle = Object.assign({left: this.state.login ? '100%' : 0}, STYLE.app);

        return (
          <div id="app" className="dock-full" style={appStyle} onClick={this._handleOnAppClick}>
            <Navbar id='navbar'/>
            <PageContianer />
            <Login id="login"/>
          </div>
        );
    }
});

export default AppContainer;
