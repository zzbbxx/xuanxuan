import React               from 'react';
import Theme               from '../../theme';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import {App, Lang, Config} from '../../app';
import BuildInfo           from './build-info';
import FlatButton          from 'material-ui/FlatButton';
import {shell}             from 'electron';
import Helper              from 'Helper';

const xuanxuanWebsite = 'http://xuanxuan.chat';

// display app component
const About = React.createClass({
    mixins: [PureRenderMixin],

    render() {
        const STYLE = {
            main: {
                backgroundColor: Theme.color.canvas
            },
            logo: {
                maxWidth: 150,
                margin: '0 auto 20px'
            },
            btnLabel: {
                textTransform: 'none', 
                fontWeight: 'normal'
            }
        };

        let {
            style,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);

        return <div {...other} style={style}>
          <div className='text-center'>
            <div style={STYLE.logo}><img src='img/logo.png' /></div>
            <BuildInfo style={{fontSize: '12px'}}/>
            <br/><br/>
            <FlatButton onClick={e => {
                shell.openExternal('https://github.com/easysoft/xuanxuan/blob/master/LICENSE');
            }} label='License ZPL' labelStyle={STYLE.btnLabel} />
            <br/>
            <FlatButton onClick={e => {
                shell.openExternal('http://cnezsoft.com/');
            }} label='Copyright (c) 2017 cnezsoft.com' labelStyle={STYLE.btnLabel} />
            <br/>
            <FlatButton onClick={e => {
                shell.openExternal(xuanxuanWebsite);
            }} label={xuanxuanWebsite} primary={true} labelStyle={{textTransform: 'none'}} />
            <br/>
            <FlatButton onClick={e => {
                shell.openExternal('http://emojione.com/');
            }} label="Emoji provided free by EmojiOne" labelStyle={STYLE.btnLabel} />
            <br/>
          </div>
        </div>
    }
});

export default About;
