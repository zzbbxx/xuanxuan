import React               from 'react';
import Theme               from '../../theme';
import {App, Lang, Config} from '../../app';
import UserAvatar          from '../user-avatar';
import Moment              from 'moment';

const STYLE = {
    main: {
        marginTop: 20,
        position: 'relative',
        lineHeight: '30px',
        textAlign: 'center'
    },
    text: {
        display: 'inline-block',
        padding: '0 10px',
        backgroundColor: Theme.color.canvas,
        fontSize: '13px',
        color: Theme.color.accent3,
        position: 'relative',
        zIndex: 2
    },
    hr: {
        border: 'none',
        height: 1,
        backgroundColor: Theme.color.border,
        position: 'absolute',
        left: 0,
        right: 0,
        top: 15,
        margin: 0,
        zIndex: 0
    }
};

// display app component
const MessageListDivider = React.createClass({

    render() {
        let {
            text,
            style,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);

        return <div {...other} style={style}><hr style={STYLE.hr}/><div style={STYLE.text}>{text}</div></div>
    }
});

export default MessageListDivider;
