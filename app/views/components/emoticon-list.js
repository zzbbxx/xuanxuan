import React, {PropTypes}  from 'react';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import Theme               from '../../theme';
import Emoticon            from './emoticon';

const STYLE = {
    main: {
        padding: 8
    },
    icon: {
        padding: 4,
        border: '1px solid transparent'
    }
};

const emojis = [
    'grinning', 'grin', 'joy', 'smiley', 'smile', 'sweat_smile', 'laughing', 'innocent', 'smiling_imp', 'imp', 'wink', 'blush', 'relaxed', 'yum', 'relieved', 'heart_eyes', 'sunglasses', 'smirk', 'neutral_face', 'expressionless', 'unamused', 'sweat', 'pensive', 'confused', 'confounded', 'kissing', 'kissing_heart', 'kissing_smiling_eyes', 'kissing_closed_eyes', 'stuck_out_tongue', 'stuck_out_tongue_winking_eye', 'stuck_out_tongue_closed_eyes', 'disappointed', 'worried', 'angry', 'rage', 'cry', 'persevere', 'triumph', 'disappointed_relieved', 'frowning', 'anguished', 'fearful', 'weary', 'sleepy', 'tired_face', 'grimacing', 'sob', 'open_mouth', 'hushed', 'cold_sweat', 'scream', 'astonished', 'flushed', 'sleeping', 'dizzy_face', 'no_mouth', 'mask', 'slight_frown', 'slight_smile', 'smile_cat', 'joy_cat', 'smiley_cat', 'heart_eyes_cat', 'smirk_cat', 'kissing_cat', 'pouting_cat', 'crying_cat_face', 'scream_cat', 'older_man', 'older_woman', 'cop', 'construction_worker', 'princess', 'guardsman', 'angel', 'santa', 'ghost', 'japanese_ogre', 'japanese_goblin', 'poop', 'skull', 'alien', 'space_invader', 'clap', 'eyes', 'thumbsup', 'thumbsdown', 'ok_hand', 'v', 'pray'
];

const EmoticonList = React.createClass({
    mixins: [PureRenderMixin],

    propTypes: {
        onEmojiClick: PropTypes.func,
        style: PropTypes.object
    },

    componentWillMount() {
    },

    _handleEmojiClick(shortname) {
        // if(DEBUG) console.log('_handleEmojiClick', shortname);
        return this.props.onEmojiClick && this.props.onEmojiClick(':' + shortname + ':');
    },
    
    render() {
        let {
            style,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);

        let list = emojis.map(emoji => {
            return <Emoticon className='emoticon-item' key={'emoji-' + emoji} shortname={':' + emoji + ':'} size={20} style={STYLE.icon} onClick={this._handleEmojiClick.bind(this, emoji)} />;
        });

        return <div className='emoticon-list' {...other} style={style}>{list}</div>
    }
});

export default EmoticonList;
