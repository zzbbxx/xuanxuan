import React               from 'react';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import Theme               from '../../theme';
import Emojione            from './emojione';

const Emoticon = React.createClass({
    mixins: [PureRenderMixin],

    getDefaultProps() {
        return {
            size: 20
        };
    },

    componentWillMount() {

    },
    
    render() {
        let {
            style,
            shortname,
            unicode,
            shortnameOrUnicode,
            size,
            ...other
        } = this.props;

        let content = null;
        if(shortname) content = Emojione.shortnameToImage(shortname);
        else if(unicode) content = Emojione.unicodeToImage(unicode);
        else content = Emojione.toImage(shortnameOrUnicode);

        style = Object.assign({width: size, height: size, display: 'inline-block'}, style);

        return <span {...other} style={style} dangerouslySetInnerHTML={{__html: content}}/>
    }
});

export default Emoticon;
