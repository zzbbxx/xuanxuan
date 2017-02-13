import React         from 'react';
import Theme         from '../theme';
import Avatar        from 'material-ui/Avatar';
import PersonIcon    from 'material-ui/svg-icons/social/person';
import Helper        from 'Helper';

function getCodeFromString(str) {
    return str.split('')
        .map(char => char.charCodeAt(0))
        .reduce((current, previous) => previous + current);
}

function getColorFromCode(code) {
    return `hsl(${(code * 43) % 360}, 70%, 60%)`;
}

const UserAvatar = React.createClass({

    getInitialState() {
        return {
            src: ''
        }
    },

    componentWillMount() {
        let {user, src} = this.props;
        if(user.avatar && !src) {
            let localPath = user.getLocalAvatar(App.user.imagesPath);
            if(Helper.isFileExist(localPath)) {
                this.setState({src: localPath});
            } else {
                App.downloadFile({
                    path: localPath,
                    url: user.avatar
                }).then(() => {
                    setTimeout(() => {
                        this.setState({src: localPath});
                        console.info('>>> Avatar file download success', localPath);
                    }, 500);
                });
            }
        }
    },

    render() {
        let {
            user,
            style,
            size,
            ...other,
        } = this.props;

        size = size || 40;

        let iconText = null;

        if(user) {
            if(this.state.src) other.src = this.state.src;
            if(other.src) {
                return <Avatar className='user-avatar' size={size} {...other} style={style}/>;
            } else {
                let displayName = user.displayName || user.account || user.realname;
                if(displayName) {
                    iconText = displayName.substr(0, 1).toUpperCase();
                    let colorCode = user.id || getCodeFromString(displayName);
                    other.backgroundColor = getColorFromCode(colorCode);
                    if(iconText === null || iconText === '[' || iconText === undefined || iconText === '') {
                        other.icon = size > 30 ? <PersonIcon /> : null;
                        iconText = size > 30 ? null: '*';
                    }
                } else {
                    other.icon = size > 30 ? <PersonIcon /> : null;
                    other.backgroundColor = Theme.color.accent1;
                    iconText = size > 30 ? null: '*';
                }
            }
        } else {
            other.icon = size > 30 ? <PersonIcon /> : null;
            other.backgroundColor = Theme.color.accent1;
            iconText = size > 30 ? null: '*';
        }

        let fontSize = Math.max(12, Math.floor(0.5 * size));

        return <Avatar className='user-avatar' size={size} {...other} style={Object.assign({fontSize: fontSize + 'px', fontWeight: 'lighter'}, style)}>{iconText}{this.props.children}</Avatar>
    }
});

export default UserAvatar;
