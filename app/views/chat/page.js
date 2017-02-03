import React               from 'react';
import Theme               from '../../theme';
import {App, Lang, Config} from '../../app';
import Menu                from './menu';
import NewChatWindow       from './newchat';
import ContactsWindow      from '../contacts/contacts';
import ChatWindow          from './chat';
import CacheContents       from '../mixins/cache-contents';
import Member              from '../../models/member';
import R                   from '../../resource';

/**
 * Chat page react component class
 */
const Page = React.createClass({
    mixins: [CacheContents],
    
    getInitialState() {
        return {
            page: null,
        };
    },

    _handleMenuItemClick(name, data, tag) {
        this.setState({page: tag});
    },

    componentDidMount() {
        this._handleDataDeleteEvent = App.on(R.event.data_delete, data => {
            if(data.chats) {
                data.chats.forEach(chat => {
                    this.removeCacheContent('chat#' + chat.gid);
                });
                this.forceUpdate();
            }
        });

        this._handleUserSwapEvent = App.on(R.event.user_swap, data => {
            this.clearCache();
            this.setState({page: null});
        });
    },

    componentWillUnmount() {
        App.off(this._handleDataDeleteEvent, this._handleUserSwapEvent);
    },

    getDisplayCacheContentId(cacheName) {
        return this.state.page;
    },

    renderCacheContent(contentId, cacheName) {
        const STYLE = {
            page: {
                left: App.user.config.ui.chat.menu.width
            }
        };
        let className = "dock-full";
        if(contentId === 'newchat') {
            return <NewChatWindow className={className} style={STYLE.page}/>
        } else if(contentId === 'contacts') {
            return <ContactsWindow className={className} style={STYLE.page}/>
        } else if(contentId) {
            let chatId = contentId.split('#')[1];
            App.chat.activeChatWindow = chatId;
            return <ChatWindow chatId={chatId} className={className} style={STYLE.page}/>
        }
    },

    render() {
        return <div {...this.props}>
            <Menu onItemClick={this._handleMenuItemClick}/>
            {this.renderCacheContents()}
        </div>
    }
});

export default Page;
