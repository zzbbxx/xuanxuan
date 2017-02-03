import React               from 'react';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import Theme               from '../../theme';

const STYLE = {
    arrow: {
        width: 0,
        height: 0,
        position: 'relative',
        borderStyle: 'solid',
        borderColor: 'transparent'
    },
    inner: {
        position: 'absolute',
    }
};

const Arrow = React.createClass({
    mixins: [PureRenderMixin],

    getDefaultProps() {
        return {
            animated: true,
            width: 20,
            height: 10,
            borderColor: Theme.color.border,
            color: Theme.color.accent2,
            direction: 'down',
            inverseDirection: false
        };
    },
    
    render() {
        let {
            style,
            width,
            height,
            borderColor,
            color,
            direction,
            inverseDirection,
            ...other
        } = this.props;

        if(inverseDirection) {
            switch(direction) {
                case 'top':
                case 'up':
                    direction = 'down';
                    break;
                case 'left':
                    direction = 'right';
                    break;
                case 'right':
                    direction = 'left';
                    break;
                case 'bottom':
                case 'down':
                    direction = 'up';
                    break;
            }
        }

        style = Object.assign({}, STYLE.arrow, style);
        let innerStyle = Object.assign({}, STYLE.inner, style, {left: 'auto', top: 'auto'});
        switch(direction) {
            case 'top':
            case 'up':
                style.borderWidth = `0 ${width/2}px ${height}px ${width/2}px`;
                style.borderBottomColor = borderColor;

                innerStyle.borderWidth = style.borderWidth;
                innerStyle.borderBottomColor = color;
                innerStyle.marginLeft = -(width/2);
                innerStyle.top = 1;
                break;
            case 'left':
                style.borderWidth = `${width/2}px ${height}px ${width/2}px 0`;
                style.borderRightColor = borderColor;

                innerStyle.borderWidth = style.borderWidth;
                innerStyle.borderRightColor = color;
                innerStyle.marginTop = -(width/2);
                innerStyle.left = 1;
                break;
            case 'right':
                style.borderWidth = `${width/2}px 0 ${width/2}px ${height}px`;
                style.borderLeftColor = borderColor;

                innerStyle.borderWidth = style.borderWidth;
                innerStyle.borderRightColor = color;
                innerStyle.marginBottom = -(width/2);
                innerStyle.right = 1;
                break;
            case 'bottom':
            case 'down':
                style.borderWidth = `${height}px ${width/2}px 0 ${width/2}px`;
                style.borderTopColor = borderColor;

                innerStyle.borderWidth = style.borderWidth;
                innerStyle.borderTopColor = color;
                innerStyle.marginLeft = -(width/2);
                innerStyle.bottom = 1;
                break;
        }

        return <div {...other} style={style}><div style={innerStyle} /></div>
    }
});

export default Arrow;
