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

    downloadLocalPath() {
        let {user} = this.props;
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
                }, 500);
            });
        }
    },

    render() {
        let {
            user,
            style,
            size,
            src,
            ...other,
        } = this.props;

        size = size || 40;

        let iconText = null;

        if(user) {
            if(user.avatar && !src) {
                if(Helper.isOSX) {
                    if(this.state && this.state.src) {
                        src = this.state.src;
                    } else {
                        setTimeout(() => {
                            this.downloadLocalPath();
                        }, 50);
                    }
                } else {
                    src = user.avatar;
                }
            }
            if(src) {
                if(Helper.isOSX) src += '?v=' + Helper.guid;
                return <Avatar className='user-avatar' size={size} src={src} {...other} style={style}/>;
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
