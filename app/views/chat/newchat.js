import React               from 'react';
import Theme               from '../../theme';
import {App, Lang, Config} from '../../app';
import ArrowForwardIcon    from 'material-ui/svg-icons/navigation/arrow-forward';
import List                from 'material-ui/List/List';
import ListDivider         from 'material-ui/Divider';
import PeopleIcon          from 'material-ui/svg-icons/social/people';
import PersonOutlineIcon   from 'material-ui/svg-icons/social/people-outline';
import FolderIcon          from 'material-ui/svg-icons/file/folder-open';
import ChevronRightIcon    from 'material-ui/svg-icons/navigation/chevron-right';
import ListItem            from '../components/small-list-item';
import ChatsIcon           from '../icons/comments-outline';
import CubeIcon            from '../icons/cube-outline';
import NewChatGroupView    from './newchat-group';
import NewChatPublicView   from './newchat-public';
import ContentNotReady     from '../misc/content-not-ready';

const STYLE = {
    header: {
        borderBottom: '1px solid ' + Theme.color.border, 
        padding: '10px 15px 10px 50px',
        lineHeight: '28px',
        backgroundColor: Theme.color.pale2,
        zIndex: 9
    },
    headerIcon: {
        color: Theme.color.icon,
        fill: Theme.color.icon,
        position: 'absolute',
        left: 15,
        top: 12
    },
    headerTitle: {
        fontWeight: 500
    },
    listCol: {
        width: 200
    },
    listWrapper: {
        top: 49,
        backgroundColor: Theme.color.pale2
    },
    list: {
        backgroundColor: 'transparent',
        paddingTop: 0,
        paddingBottom: 0
    }
};

const chatTypesIcon = {
    group: PersonOutlineIcon,
    public: ChatsIcon
    // project: FolderIcon,
    // product: CubeIcon,
};

// display app component
const NewChatPage = React.createClass({

    getInitialState() {
        return {
            chatType: 'group'
        };
    },

    _handleChatTypeClick(chatType) {
        this.setState({chatType});
    },

    _renderChooseMenu() {
        if(this.state.chatType === 'group') {
            return <NewChatGroupView/>
        } else if(this.state.chatType === 'public') {
            return <NewChatPublicView />
        }
        return <ContentNotReady iconName=':ghost:' title={'暂不支持创建 【' + Lang.chat.createChatTypes[this.state.chatType] + '】'} />;
    },

    render() {
        let {
            style,
            contacts,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);

        return <div {...other} style={style}>
          <div className='dock-full table-row'>
            <div className='table-col relative' style={STYLE.listCol}>
              <header className='dock-top' style={STYLE.header}>
                <div><ArrowForwardIcon style={STYLE.headerIcon}/><span style={STYLE.headerTitle}>{Lang.chat.chooseChatType}</span></div>
              </header>
              <div className='dock-full scroll-y' style={STYLE.listWrapper}>
                <List style={STYLE.list}>
                {
                    Object.keys(chatTypesIcon).map(chatType => {
                        let actived = chatType === this.state.chatType;
                        let IconComponent = chatTypesIcon[chatType];
                        return <ListItem key={'newchat-' + chatType} onClick={this._handleChatTypeClick.bind(this, chatType)} actived={actived} size={48} leftIcon={<IconComponent/>} primaryText={Lang.chat.createChatTypes[chatType]} rightIcon={actived ? <ChevronRightIcon /> : null}/>
                    })
                }
                </List>
              </div>
            </div>
            <div className='table-col relative'>
              {this._renderChooseMenu()}
            </div>
          </div>
        </div>
    }
});

export default NewChatPage;
