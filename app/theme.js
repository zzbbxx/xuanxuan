import React            from 'react';
import Spacing          from 'material-ui/styles/spacing';
import lightBaseTheme   from 'material-ui/styles/baseThemes/lightBaseTheme';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import getMuiTheme      from 'material-ui/styles/getMuiTheme';
import {fade}           from 'material-ui/utils/colorManipulator';
import Colors           from 'Utils/material-colors';

/**
 * Theme config
 * @type {Object}
 */
let config = {
    spacing    : Spacing,
    transition : {longTime: '.7s', normalTime: '.3s', fastTime: '.2s', type: 'cubic-bezier(0.175,.885,.32,1)'},
    fontFamily : '"Helvetica Neue", Helvetica, Tahoma, Arial, "Microsoft Yahei", "PingFang SC", "Hiragino Sans GB", "WenQuanYi Micro Hei", sans-serif',
    palette    : {
        primary1Color: Colors.indigo500,
        primary2Color: Colors.indigo700,
        primary3Color: Colors.lightBlack,
        pale1Color: Colors.indigo50,
        pale2Color: '#F5F6FB',
        pale3Color: Colors.grey50,
        accent1Color: Colors.pinkA200,
        accent2Color: Colors.grey100,
        accent3Color: Colors.grey500,
        textColor: Colors.darkBlack,
        alternateTextColor: Colors.white,
        canvasColor: Colors.white,
        borderColor: Colors.grey200,
        iconColor: Colors.grey600,
        disabledColor: fade(Colors.darkBlack, 0.3),
        positiveColor: Colors.green500,
        positivePaleColor: Colors.green50,
        negativeColor: Colors.red500,
        negativePaleColor: Colors.red50
    },
};

/**
 * Color palette helpers
 */
let colors = {};
for(let colorName of Object.keys(config.palette)) {
    colors[colorName.replace('Color', '')] = config.palette[colorName];
}
config.color = colors;
config.color.file = {
    image: Colors.red500,
    default: Colors.blueGrey500
};

/**
 * Generate transition css
 */
config.transition.css = function(timeType, ...props) {
    var time = config.transition[timeType + 'Time'];
    if(!time) time = timeType;
    var css = '';
    for(let prop of props) {
        if(css !== '') {
            css += ','
        }
        css += `${prop} ${time} ${config.transition.type}`;
    }
    return css;
};

/**
 * Generate transition css with normal speed
 */
config.transition.normal = function(...props) {
    return config.transition.css('normal', ...props);
};

/**
 * Generate transition css with fast speed
 */
config.transition.fast = function(...props) {
    return config.transition.css('fast', ...props);
};

/**
 * Generate transition css with slow speed
 */
config.transition.long = function(...props) {
    return config.transition.css('long', ...props);
}

/**
 * Icon style
 */
config.icon = {style: {color: config.color.icon, fill: config.color.icon}};

/**
 * MUI Theme
 */
const theme = config.Theme = getMuiTheme(Object.assign({}, lightBaseTheme, config));

/**
 * MUI theme provider react class
 */
const ThemeProvider = React.createClass({
    render() {
        return <MuiThemeProvider muiTheme={theme}>{this.props.children}</MuiThemeProvider>;
    }
});

export {
    ThemeProvider,
    theme as Theme,
    MuiThemeProvider
};
export default config;
