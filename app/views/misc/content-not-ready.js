import React               from 'react';
import Theme               from '../../theme';
import Emojione            from '../components/emojione';
import PureRenderMixin     from 'react-addons-pure-render-mixin';

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
            title: '此处内容尚未准备就绪。',
            iconName: ':confused:'
        };
    },

    render() {
        let {
            title,
            iconName,
            ...other
        } = this.props;

        return <div {...other} className='center-block dock-full' style={STYLE.main}>
          <div className='text-center'>
            <div dangerouslySetInnerHTML={{__html: Emojione.toImage(iconName)}}></div>
            <h4 style={STYLE.title}>{title}</h4>
          </div>
        </div>
    }
});

export default Page;
