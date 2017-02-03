import React         from 'react';
import Theme         from '../theme';

const STYLE = {
    content: {padding: '8px 15px', fontSize: '14px'}
};

const Message = React.createClass({
    getDefaultProps() {
        return {
            color: Theme.color.primary1,
            textColor: Theme.color.alternateText
        };
    },

    render() {
        if(this.props.content) {
            let style = Object.assign({backgroundColor: this.props.color, color: this.props.textColor}, STYLE.content, this.props.style);
            return <div {...this.props} style={style}>{this.props.content}</div>
        }
        return null;
    }
});

export default Message;
