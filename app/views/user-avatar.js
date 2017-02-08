import React         from 'react';
import Theme         from '../theme';
import Avatar        from 'material-ui/Avatar';
import PersonIcon    from 'material-ui/svg-icons/social/person';

function getCodeFromString(str) {
    return str.split('')
        .map(char => char.charCodeAt(0))
        .reduce((current, previous) => previous + current);
}

function getColorFromCode(code) {
    return `hsl(${(code * 43) % 360}, 70%, 60%)`;
}

const UserAvatar = React.createClass({
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
            if(user.avatar) other.src = user.avatar;
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
