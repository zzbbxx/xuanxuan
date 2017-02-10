import Entity from '../entity';
import UUID   from 'uuid';

const CHAT_TYPES = {
    'one2one': {},
    'group': {},
    'project': {},
    'product': {}
};

const MAX_MESSAGE_COUNT = 30;

/**
 * Chat class
 */
class Chat extends Entity {
    constructor(data) {
        super(data);

        this.id;
        this.type;
        this.gid;
        this.name;
        this.createdBy;
        this.createdDate;
        this.members;
        this.messages;
    }

    /**
     * Initial function return an object for init and convert attribute values
     * @return {object}
     */
    _initValuesConverter() {
        return {
            createdDate: 'timestamp',
            lastActiveTime: 'timestamp',
            'public': 'bool',
            'hide': 'bool',
            star: 'bool',
            mute: 'bool',
            admins: 'intSet',
            $global: data => {
                if(Array.isArray(data.members)) {
                    data.members = new Set(data.members);
                } else if(typeof(data.members) === 'object' && data.members.size === undefined) {
                    data.members = new Set(Object.keys(data.members).map(x => parseInt(data.members[x].id)));
                }

                if(!data.type) {
                    if(data.members && data.members.size === 2 && (!data.gid || data.gid.indexOf('&') > -1)) {
                        data.type = 'one2one';
                    } else {
                        data.type = 'group';
                    }
                }

                if(!data.gid) {
                    if(data.type === 'one2one') {
                        data.gid = Array.from(data.members).sort().join('&');
                    } else {
                        data.gid = UUID.v4();
                    }
                }
            }
        };
    }

    /**
     * Initial function to generate id attribute
     * @return {string}
     */
    _generateId() {
        this._id = this.typeName + '/' + this.gid;
        return this._id;
    }

    /**
     * Get display name
     * @param  {App} app
     * @return {string}
     */
    getDisplayName(app) {
        if(this.isOne2One) {
            let otherOne = this.getTheOtherOne(app.user);
            return otherOne ? otherOne.displayName : app.lang.chat.tempChat;
        } else if(this.type === 'system') {
            return app.lang.chat.groupNameFormat.format(this.name || app.lang.chat.systemGroup, app.lang.chat.allMembers);
        } else if(this.name !== undefined && this.name !== '') {
            return app.lang.chat.groupNameFormat.format(this.name, this.membersCount);
        } else {
            return app.lang.chat.chatGroup + (this.id || (' (' + app.lang.chat.tempChat + ')'));
        }
    }

    /**
     * Check the chat contacs is online
     */
    isOnline(app) {
        if(this.isOne2One) {
            let otherOne = this.getTheOtherOne(app.user);
            if(!otherOne) {
                if(DEBUG) console.error('Can not get the other member of the chat', {chat: this, user: app.user});
                return false;
            }
            return otherOne.isOnline;
        }
        return true;
    }

    /**
     * Get members count
     */
    get membersCount() {
        return this.members ? this.members.size : 0;
    }

    /**
     * Try to get the other member
     * @param  {Member} current user, me
     * @return {Member | null}
     */
    getTheOtherOne(user) {
        if(this.isOne2One) {
            if(!this.$.theOtherOne) {
                this.$.theOtherOne = this.membersSet.find(member => member.id !== user.id);
            }
            return this.$.theOtherOne;
        }
        return null;
    }

    /**
     * Check the user whether is the chat owner
     * @param  {Member}  user
     * @return {boolean}
     */
    isOwner(user) {
        return user.id === this.createdBy || user.account === this.createdBy;
    }

    /**
     * Check the chat type whether is 'one2one'
     * @return {boolean}
     */
    get isOne2One() {
        return this.type === 'one2one';
    }

    /**
     * Check the chat can add more members
     * @return {boolean}
     */
    get canJoin() {
        return this.public && this.type === 'group';
    }

    /**
     * Check whether the chat type is 'system'
     * @return {boolean}
     */
    get isSystem() {
        return this.type === 'system';
    }

    get isGroup() {
        return this.type === 'group';
    }

    /**
     * Check the chat whether can turn public status by the given user
     * @param  {User | Member} user
     * @return {boolean}
     */
    canMakePublic(user) {
        return this.isAdmin(user) &&  this.type === 'group';
    }

    /**
     * Check whether the chat can invite more members
     * @return {boolean}
     */
    canInvite(user) {
        return this.isCommiter(user) && (this.type === 'one2one' || this.type === 'group');
    }

    /**
     * Check whether member of chat can exit it
     * @return {boolean}
     */
    get canExit() {
        return this.type === 'group';
    }

    /**
     * Get notice count
     * @return {number}
     */
    get noticeCount() {
        return this.$.noticeCount || 0;
    }

    /**
     * Check whether the chat can change name
     * @return {booean}
     */
    canRename(user) {
        return this.isCommiter(user) && this.type !== 'one2one';
    }

    /**
     * Check the current user is whether can set the chat commiters
     */
    canSetCommiters(user) {
        return this.isAdmin(user);
    }

    /**
     * Get commiters type
     */
    get commitersType() {
        if((this.isSystem || this.isGroup) && this.commiters && this.commiters !== '$ALL') {
            if(this.commiters === '$ADMINS') {
                return 'admins';
            }
            return 'whitelist';
        }
        return 'all';
    }

    /**
     * Check whether has whitelist setting
     */
    get hasWhitelist() {
        return this.commitersType === 'whitelist';
    }

    /**
     * Get whitelist
     */
    get whitelist() {
        if(this.hasWhitelist) {
            let set = new Set();
            this.commiters.split(',').forEach(x => {
                x = Number.parseInt(x);
                if(x !== NaN) {
                    set.add(x);
                }
            });
            return set;
        }
        return null;
    }

    /**
     * Set whitelist
     */
    set whitelist(value) {
        if(!this.isSystem && !this.isGroup) {
            value = '';
        }
        let valType = typeof value;
        if(value instanceof Set) {
            value = Array.from(value);
        }
        if(Array.isArray(value)) {
            value = value.join(',');
        }
        this.commiters = value;
    }

    /**
     * Check a member whether is in whitelist
     */
    isInWhitelist(member, whitelist) {
        if(typeof member === 'object') {
            member = member.remoteId;
        }
        whitelist = whitelist || this.whitelist;
        if(whitelist) {
            return whitelist.has(member);
        }
        return false;
    }

    /**
     * Add member to whitelist
     */
    addToWhitelist(member) {
        let whitelist = this.whitelist;
        if(whitelist) {
            if(typeof member === 'object') {
                member = member.remoteId;
            }
            if(!whitelist.has(member)) {
                whitelist.add(member);
                this.whitelist = whitelist;
                return true;
            }
        }
        return false;
    }

    /**
     * Remove user from whitelist
     */
    removeFromWhitelist(member) {
        let whitelist = this.whitelist;
        if(whitelist) {
            if(typeof member === 'object') {
                member = member.remoteId;
            }
            if(whitelist.has(member)) {
                whitelist.delete(member);
                this.whitelist = whitelist;
                return true;
            }
        }
        return false;
    }

    /**
     * Check a member whether is commiter
     */
    isCommiter(member) {
        switch(this.commitersType) {
            case 'admins':
                return this.isAdmin(member);
            case 'whitelist':
                if(typeof member === 'object') {
                    member = member.remoteId;
                }
                return this.isInWhitelist(member);
        }
        return true;
    }

    /**
     * Check a member whether can only read the chat
     */
    isReadonly(member) {
        return !this.isCommiter(member);
    }

    /**
     * Check whether the chat is a new chat
     * @return {boolean}
     */
    get isNewChat() {
        if(this.createdDate) {
            return ((new Date()).getTime() - this.createdDate) < 3600000;
        }
        return false;
    }

    /**
     * Set notice count
     * @param  {number} count
     * @return {void}
     */
    set noticeCount(count) {
        this.$.noticeCount = count;
    }

    /**
     * Get chat members as set
     * @return {Set<Member>}
     */
    get membersSet() {
        return this.$.members || this.members;
    }

    /**
     * Set chat members in set
     * @param  {Set<Member>} members
     * @return {void}
     */
    set membersSet(members) {
        this.$.members = members;
        this._updateMembersFromSet();
    }

    /**
     * Get chat messages as Array
     * @return {[Message]}
     */
    get messages() {
        return this.$.messages;
    }

    /**
     * Set chat messages in array
     * @param  {[Message]} messages
     * @return {void}
     */
    set messages(messages) {
        this.$.messages = messages;
    }

    /**
     * Add a member as 
     */
    addAdmin(member) {
        if(!this.admins) {
            this.admins = new Set();
        }
        this.admins.add(typeof member === 'object' ? member.remoteId : member);
    }

    /**
     * Check a member whether is administrator
     */
    isAdmin(member) {
        if(typeof member !== 'object') {
            member = {remoteId: member, account: member};
        }
        if(this.isSystem && member.isSuperAdmin) {
            return true;
        }
        if(this.createdBy === member.account) {
            return true;
        }
        if(this.admins) {
            return this.admins.has(member.remoteId) || this.admins.has(member.account);
        }
        return false;
    }

    /**
     * Update members information with the DAO object
     * @param  {DAO} dao
     * @return {void}
     */
    updateMembersSet(app) {
        this.$.members = app.$dao.getMembers(Array.isArray(this.members) ? this.members : Array.from(this.members));
    }

    /**
     * Update active time
     */
    updateActiveTime(app) {
        if(!this.lastActiveTime) {
            this.lastActiveTime = this.createdDate;
            app.dao.getChatMessages().then(messages => {
                let maxTime = 0, lastMessage;
                messages.forEach(function(message) {
                    if(message.date > maxTime) {
                        lastMessage = message;
                        maxTime = message.date;
                    }
                });
                if(maxTime) {
                    this.addMessage(lastMessage);
                }
            });
        }
    }

    /**
     * Update chat information with dao
     */
    updateWithApp(app) {
        this.updateMembersSet(app);
        this.updateActiveTime(app);
    }

    /**
     * Update and store members ids in a set
     * @return {void}
     */
    _updateMembersFromSet() {
        this.members = new Set(this.$.members.map(x => x.id));
    }

    /**
     * Add member
     * @param {Member} member
     */
    addMember(...members) {
        if(!this.$.members) this.$.members = [];
        this.$.members.push(...members);
        this._updateMembersFromSet();
    }

    /**
     * Add message
     * @param {ChatMessage} message
     */
    addMessage(...messages) {
        if(!this.$.messages) this.$.messages = [];
        let size = this.$.messages.length;
        let firstMessage = size > 0 ? this.$.messages[0] : null;
        let hasNewMessage = false;
        messages.forEach(message => {
            if(size >= MAX_MESSAGE_COUNT && firstMessage.date >= message.date && firstMessage.gid !== message.gid) return;

            let checkMessage = this.$.messages.find(x => x.gid === message.gid);
            if(checkMessage) {
                message.updateTime = new Date();
                checkMessage.assign(message);
            } else {
                this.$.messages.push(message);
                hasNewMessage = true;
            }

            if(!this.lastActiveTime || this.lastActiveTime < message.date) {
                this.lastActiveTime = message.date;
            }
        });

        if(hasNewMessage) {
            this.$.messages.sort((x, y) => {
                if(x.date === y.date) {
                    return (x.remoteId || 0) - (y.remoteId || 0);
                } else {
                    return x.date - y.date;
                }
            });
            size = this.$.messages.length;
            if(size > MAX_MESSAGE_COUNT) {
                this.$.messagesOverflow = true;
                this.$.messages.splice(0, size - MAX_MESSAGE_COUNT);
            }
        }
    }

    /**
     * Delete local message
     * @param  {ChatMessage} message
     * @return {void}
     */
    // deleteLocalMessage(message) {
    // }

    static TYPES() {
        return MESSAGE_TYPES;
    }

    /**
     * Sort chats
     */
    static sort(chats, app, order = -1, onlyTime = false) {
        return chats.sort((x, y) => {
            let result = 0;
            if(result === 0) {
                result = (!x.hide ? 1 : 0) - (!y.hide ? 1 : 0);
            }
            if(result === 0) {
                result = (x.star ? 1 : 0) - (y.star ? 1 : 0);
            }
            if(!onlyTime) {
                if(result === 0 && (x.noticeCount || y.noticeCount)) {
                    result = (x.noticeCount || 0) - (y.noticeCount || 0);
                }
                if(result === 0 && app) {
                    result = (x.isOnline(app) ? 1 : 0) - (y.isOnline(app) ? 1 : 0);
                }
            }
            if(result === 0 && (x.lastActiveTime || y.lastActiveTime)) {
                result = (x.lastActiveTime || 0) - (y.lastActiveTime || 0);
            }
            if(result === 0) {
                result = (x.createdDate || 0) - (y.createdDate || 0);
            }
            if(result === 0) {
                result = x.id - y.id;
            }
            return order * result;
        });
    }
}

Entity.addCreator({Chat});

export default Chat;
