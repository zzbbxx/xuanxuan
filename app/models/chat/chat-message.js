import Entity from '../entity';
import UUID   from 'uuid';
import Emojione  from '../../views/components/emojione';

const Helper = global.Helper;

const MESSAGE_TYPES = {
    'normal': {},
    'broadcast': {},
    'action': {}
};

/**
 * Chat message class
 */
class Message extends Entity {
    constructor(data) {
        super(data);

        // Properties
        this.cgid;
        this.id;
        this.user;
        this.date = this.date || new Date().getTime();
        this.type; // message types
        this.contentType; // text, image, file, emoticon
        this.content; // text,image, file or action saved as json data

        if(this.unread === undefined) this.unread = true;
    }

    /**
     * Initial function return an object for init and convert attribute values
     * @return {object}
     */
    _initValuesConverter() {
        return {
            date: "timestamp",
            type: ["normal", "broadcast"],
            contentType: ["text", "image", "file", "emoticon"],
            $global: data => {
                data.type = data.type || 'normal';
                data.contentType = data.contentType || 'text';
            }
        };
    }

    /**
     * Initial function to generate id attribute
     * @return {string}
     */
    _generateId() {
        this._id = this.typeName + '/' + this.cgid + '/' + this.gid;
        return this._id;
    }

    /**
     * Check the message whether need to check resend
     * @return {boolean}
     */
    get needCheckResend() {
        return !this.id && this.contentType !== 'file';
    }

    /**
     * Check the message whether need to resend
     * @return {boolean}
     */
    get needResend() {
        return !this.id && this.contentType !== 'file' && this.isOutdated;
    }

    /**
     * Check the message whether is outdated
     * @return {boolean}
     */
    get isOutdated() {
        return (new Date().getTime() - this.date) > 10000;
    }

    /**
     * Get meeesage sender
     * @return {Member}
     */
    get sender() {
        return this.$.sender;
    }

    /**
     * Set message sender
     * @param  {Message} sendUser
     * @return {void}
     */
    set sender(sendUser) {
        if(sendUser) {
            this.$.sender = sendUser;
            this.user = sendUser.id;
        }
    }

    /**
     * Check the message whether the type is 'broadcast'
     * @return {boolean}
     */
    get isBroadcast() {
        return this.type === 'broadcast';
    }

    /**
     * Get message send time as Date
     * @return {Date}
     */
    get sendTime() {
        return new Date(this.date);
    }

    /**
     * Find message sender from a dao object
     * @param  {DAO} dao
     * @return {Member | null}
     */
    findSender(dao) {
        if(!this.$.sender || this.$.sender.account !== this.user) {
            this.$.sender = dao.getMember(this.user, true);
        }
        return this.$.sender;
    }

    /**
     * Get command object from message content
     * @return {object | null}
     */
    getCommand() {
        if(this.contentType === 'text') {
            let content = this.content.trim();
            if(content.length > 8 && content.startsWith('$$name=')) {
                return {action: 'rename', name: content.substr(7)};
            } else if(content === '$$version') {
                this.content = '```\n$$version = ' +  + ';\n```'
                return {action: 'version'};
            }
        }
        return null;
    }

    /**
     * Render text content with the given render function
     * @param  {function} render
     * @param  {boolean} forceRender
     * @return {string}
     */
    renderTextContent(render, forceRender) {
        if(render === true || forceRender || this.$._renderTextContent === undefined) {
            let content = this.content;
            content = Helper.markdown(content);
            content = Emojione.toImage(content);
            if(typeof render === 'function') content = render(content);
            this.$._renderTextContent = content;
        }
        return this.$._renderTextContent;
    }

    /**
     * Set image content
     * @param  {object} content
     * @return {void}
     */
    set imageContent(content) {
        if(!this.contentType) {
            this.contentType = 'image';
        }
        if(this.contentType === 'image') {
            this.$.imageContent = content;
            this.content = JSON.stringify(content);
        }
    }

    /**
     * Get image content object
     * @return {object}
     */
    get imageContent() {
        let content = this.$.imageContent;
        if(!content) {
            content = JSON.parse(this.content);
        }
        return content;
    }

    /**
     * Set file content
     * @param  {object} content
     * @return {void}
     */
    set fileContent(content) {
        if(!this.contentType) {
            this.contentType = 'file';
        }
        if(this.contentType === 'file') {
            this.$.fileContent = content;
            this.content = JSON.stringify({name: content.name, size: content.size, send: content.send, type: content.type, id: content.id});
        }
    }

    /**
     * Get file content object
     * @return {object}
     */
    get fileContent() {
        let content = this.$.fileContent;
        if(!content) {
            content = JSON.parse(this.content);
            this.$.fileContent = content;
        }
        if(content) {
            content.user = this.user;
            content.sender = this.sender;
            content.attachFile = this.attachFile;
            content.date = this.date;
            content.gid = this.gid;
        }
        return content;
    }

    /**
     * Get message types setting
     */
    static TYPES() {
        return MESSAGE_TYPES;
    }
}

Entity.addCreator({Message});

export default Message;
