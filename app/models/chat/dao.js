import {User, Member, Chat, ChatMessage} from '../entities';
import R                                 from '../../resource';

/**
 * Chat dao class
 */
class Dao {
    constructor(app) {
        this.app = app;
        this.chats = {};
    }

    /**
     * Get system dao object
     * @return {DAO}
     */
    get $dao() {
        return this.app.$dao;
    }

    /**
     * Init all chats
     * @param  {Array} chats
     * @return {Void}
     */
    initChats(chats) {
        this.chats = {};
        chats.forEach(chat => {
            // if(!chat.hide) {
                this.chats[chat.gid] = chat;
            // }
        });
        this.$dao.upsert(chats);
        this.$dao._emit(R.event.data_change, {chats: chats});

        this.loadChatMessages();
    }

    /**
     * Get chats by condition
     * @param  {Function} condition optional
     * @return {Array[Chat]}
     */
    getChats(condition, includeHiddenItems = false) {
        if(condition === true || includeHiddenItems) {
            return this.$dao.all('Chat');
        }
        if(typeof(condition) === 'function') {
            let result = [];
            Object.keys(this.chats).forEach(x => {
                let chat = this.chats[x];
                if(condition(chat)) result.push(chat);
            });
            return result;
        }

        return Object.keys(this.chats).map(x => this.chats[x]);
    }

    /**
     * Get chat by gid
     * @param  {String} gid
     * @return {Chat}
     */
    getChat(gid, includeHiddenItem = false, ignoreMessage = false) {
        let chat = this.chats[gid];
        if(!ignoreMessage && chat && (!chat.messages || chat.messages.length === 0)) {
            this.getChatMessages(gid, true).then(messages => {
                if(messages && messages.length) {
                    chat.addMessage(...messages);
                    this.$dao._emit(R.event.data_change, {chats: [chat]});
                }
            }).catch(error => console.log(error));
        }
        if(!chat && includeHiddenItem) {
            return this.$dao.get('Chat', gid);
        }
        return chat;
    }

    /**
     * Get chat messages
     * @param  {string}  gid
     * @param  {boolean} includeSender
     * @return {Promise}
     */
    getChatMessages(gid, includeSender = false) {
        if(!includeSender) {
            return this.$dao.all('Message/' + gid);
        } else {
            return new Promise((resolve, reject) => {
                this.$dao.all('Message/' + gid).then(messages => {
                    if(messages && messages.length) {
                        messages.forEach(x => {
                            if(!x.sender) x.sender = this.$dao.getMember(x.user, true);
                        });
                    }
                    resolve(messages);
                }).catch(reject);
            });
        }
    }

    /**
     * Get chat files
     * @param  {string}  gid
     * @param  {boolean} returnMessages
     * @return {Promise}
     */
    getChatFiles(gid, returnMessages = false) {
        return new Promise((resolve, reject) => {
            this.getChatMessages(gid, true).then(messages => {
                let files = [];
                if(messages && messages.length) {
                    messages.forEach(f => {
                        if(f.contentType === 'file') {
                            files.push(returnMessages ? f : f.fileContent);
                        }
                    });
                }
                resolve(files);
            }).catch(reject);
        });
    }

    /**
     * Delete chat
     * @param  {String} gid
     * @return {Void}
     */
    deleteChat(gid) {
        let chat = this.chats[gid];
        if(chat) {
            this.$dao.delete(chat);
            delete this.chats[gid];
            this.$dao._emit(R.event.data_change, {chats: [chat]});
            this.$dao._emit(R.event.data_delete, {chats: [chat]});
        }
    }

    /**
     * Update chats
     * @param  {Array} chats
     * @return {Void}
     */
    updateChats(chats) {
        if(!Array.isArray(chats)) {
            chats = [chats];
        }
        chats.forEach(chat => {
            // if(!chat.hide) {
                this.chats[chat.gid] = chat;
            // }
        });
        this.$dao.upsert(chats);
        this.$dao._emit(R.event.data_change, {chats: chats});
    }

    /**
     * Load chat messages
     * @return {Void}
     */
    loadChatMessages() {
        let chatsIds = Object.keys(this.chats);
        if(!chatsIds.length) return;

        chatsIds.forEach(cgid => {
            this.$dao.all(`Message/${cgid}`).then(messages => {
                if(messages.length) {
                    let chat = this.chats[cgid];
                    chat.addMessage(...messages);
                    this.$dao._emit(R.event.data_change, {chats: [chat]});
                }
            });
        });
    }

    /**
     * Update chat messages
     * @param  {Array} messages
     * @return {Void}
     */
    updateChatMessages(messages, noticeMe, ignoreDuplicate) {
        if(!Array.isArray(messages)) {
            messages = [messages];
        }
        let chatsMessages = {};
        let messagesForUpdate = [];
        messages.forEach(message => {
            if(!message.sender) message.sender = this.$dao.getMember(message.user, true);

            if(ignoreDuplicate && (
               (message.contentType === 'image' && message.imageContent.send === 0) 
               || (message.contentType === 'file' && message.fileContent.send === 0)
               )) {
                return;
            }

            messagesForUpdate.push(message);

            if(!chatsMessages[message.cgid]) {
                chatsMessages[message.cgid] = [message];
            } else {
                chatsMessages[message.cgid].push(message);
            }
        });

        let chats = [], noticeChats = [];
        Object.keys(chatsMessages).forEach(cgid => {
            let chat = this.getChat(cgid);
            if(chat) {
                chat.addMessage(...chatsMessages[cgid]);
                if(noticeMe) {
                    let noticeCount = 0;
                    chatsMessages[cgid].forEach(msg => {
                        if(msg.user !== noticeMe && !msg.updateTime) {
                            noticeCount++;
                        }
                    });
                    chat.noticeCount = chat.noticeCount + noticeCount;
                    if(chat.noticeCount) {
                        chat.hide = false;
                        noticeChats.push(chat);
                    }
                }
                chats.push(chat);
            }
        });

        this.$dao.upsert(messagesForUpdate);
        if(chats.length) {
            this.$dao._emit(R.event.data_change, {chats: chats});
            if(noticeChats.length) this.$dao._emit(R.event.chats_notice, {newChats: noticeChats});
        }
    }
}

export default Dao;
