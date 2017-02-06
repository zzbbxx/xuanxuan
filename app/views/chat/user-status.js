import React               from 'react';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import {App, Lang}         from 'App';
import Theme               from 'Theme';
import Colors              from 'Utils/material-colors';
import {USER_STATUS}       from 'Models/user';

const STYLE = {
    main: {
        backgroundColor: Theme.color.accent2
    },
    title: {
        color: Theme.color.disabled
    }
};

// display app component
const Page = React.createClass({
    mixins: [PureRenderMixin],

    getDefaultProps() {
        return  {
            status: 'offline',
            type: 'dot', // 'dot', 'dot-text', 'text'
        };
    },

    render() {
        const STYLE = {
            dot:        {display: 'inline-block', width: 10, height: 10, backgroundColor: 'gray', borderRadius: 6, marginRight: 5, transition: Theme.transition.long('background-color'), border: '1px solid #fff', position: 'relative', top: 1},
            online:     {backgroundColor: Colors.greenA400},
            offline:    {backgroundColor: Colors.grey400},
            disconnect: {backgroundColor: Colors.grey400},
            unverified: {backgroundColor: Colors.grey400},
            busy:       {backgroundColor: Colors.yellowA700},
            away:       {backgroundColor: Colors.redA400},
            text:       {fontSize: '12px'}
        };

        let {
            status,
            dotStyle,
            textStyle,
            text,
            type,
            ...other
        } = this.props;

        status = USER_STATUS.getName(status);
        dotStyle = Object.assign({}, STYLE.dot, STYLE[status], dotStyle);
        textStyle = Object.assign(type === 'text' ? {color: STYLE[status].backgroundColor} : {},STYLE.text, textStyle);

        return <span {...other}>
            {type !== 'text' ? <span style={dotStyle}></span> : null}
            {type !== 'dot' ? <span style={textStyle}>{text !== undefined ? text : Lang.user.status[status]}</span> : null}
        </span>
    }
});

export default Page;
