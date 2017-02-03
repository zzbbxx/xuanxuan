import React               from 'react';
import Theme               from '../../theme';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import {App, Lang, Config} from '../../app';
import BuildInfo           from './build-info';

const Helper = global.Helper;

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
          </div>
        </div>
    }
});

export default About;
