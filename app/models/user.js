import Md5    from 'md5';
import UUID   from 'uuid';
import Url    from 'url';
import Path   from 'path';
import Events from '../event-center';
import Member, {USER_STATUS} from './member';
import R      from 'Resource';

const PASSWORD_WITH_MD5_FLAG = '%%%PWD_FLAG%%% ';
const PASSWORD_WITH_MD5_FLAG_LENGTH = 15;
const DEFAULT = {
    version: 2,
    ui: {
        navbar: {
            compactWidth: 50,
            width: 200,
            expand: false,
            dock: 'left',
            page: 'chat'
        },

        chat: {
            menu: {
                width: 200,
                type: 'recents'
            },
            sendbox: {
                height: 125,
                HDEmoticon: true
            },
            sidebar: {
                width: 300
            },
            fontSize: {
                name: '1em',
                time: '0.9230769231em',
                lineHeight: 1.53846153846,
                size: 13
            }
        },

        onClose: 'ask'
    },

    shortcut: {
        captureScreen: 'Ctrl+Alt+Z',
        sendMessage: 'Enter'
    }
};

/**
 * The user class
 */
class User extends Member {
    constructor(user) {
        super(user);

        this.config;
        this.zentaoConfig;

        this.$['status'] = USER_STATUS.unverified;
        if(user && user.password) {
            this.setPassword(user.password);
        }

        if(this.config && this.config.version !== DEFAULT.version) {
            this.config = null;
        }
        this.config = Object.assign({}, DEFAULT, this.config);

        if(this._zentao) this.zentao = this._zentao;
    }

    /**
     * Initial function to generate id attribute
     * @return {string}
     */
    _initValuesConverter() {
        return {
            lastLoginTime: "timestamp",
            _zentao: zentao => {
                if(typeof zentao === 'string') {
                    this.zentao = zentao;
                }
            }
        };
    }

    /**
     * Set user config
     */
    setConfig(objOrKey, value) {
        if(!this.config) this.config = {};
        if(typeof objOrKey === 'object') {
            Object.assign(this.config, objOrKey);
        } else {
            this.config[objOrKey] = value;
        }
        if(this.listenStatus) {
            Events.emit(R.event.user_config_change, this, objOrKey, value);
        }
    }

    /**
     * Get user config
     * @param {string} key
     * @param {any}    defaultValue optional
     */
    getConfig(key, defaultValue) {
        if(this.config) {
            let val = this.config[key];
            if(val !== undefined) return val;
        }
        return defaultValue;
    }

    /**
     * Get zentao config object
     * @return {ZentaoConfig}
     */
    get zentaoConfig() {
        return this.$.zentaoConfig;
    }

    /**
     * Set zentao config object
     * @param  {ZentaoCofnig} zentaoConfig
     * @return {void}
     */
    set zentaoConfig(zentaoConfig) {
        this.$.zentaoConfig = zentaoConfig;
        if(zentaoConfig.port) this._port = zentaoConfig.port;
        if(zentaoConfig.ip) this._host = zentaoConfig.ip;
    }

    /**
     * Get user images path
     * @return {string}
     */
    get imagesPath() {
        return Path.join(this.dataPath, 'images');
    }

    /**
     * Get user files path
     * @return {string}
     */
    get filesPath() {
        return Path.join(this.dataPath, 'files');
    }

    /**
     * Get user temp files path
     * @return {string}
     */
    get tempPath() {
        return Path.join(this.dataPath, 'temp');
    }

    /**
     * Get user data path
     * @return {string}
     */
    get dataPath() {
        return this.$.dataPath;
    }

    /**
     * Set user data path
     * @param  {string} dataPath
     */
    set dataPath(dataPath) {
        this.$.dataPath = dataPath;
    }

    /**
     * Make file name
     * @param  {string} filenameOrType
     * @return {string}
     */
    makeFileName(filenameOrType) {
        let ext;
        let idx = filenameOrType.lastIndexOf('/');
        if(idx > -1) {
            ext = '.' + filenameOrType.substr(idx + 1);
        } else if(filenameOrType.length < 6 && filenameOrType[0] === '.') {
            ext = filenameOrType;
        }
        return ext ? (UUID.v4() + ext) : filenameOrType ? filenameOrType : UUID.v4();
    }

    /**
     * Make file path with user data path
     * @param  {string} filename
     * @param  {string} type
     * @return {string}
     */
    makeFilePath(filename, type = 'temp') {
        return Path.join(this.dataPath, type, this.makeFileName(filename));
    }

    /**
     * Get user profile
     * @return {UserProfile}
     */
    get profile() {
        return this.$.profile;
    }

    /**
     * Set user profile
     * @param  {UserProfile} profile
     * @return {void}
     */
    set profile(profile) {
        this.$.profile = profile;
    }

    /**
     * Get zentao address
     * @return {string}
     */
    get zentao() {
        if(!this.$.zentao) return '';
        let zentao = this.$.zentao.protocol + '//' + this.$.zentao.hostname + this.$.zentao.pathname;
        return zentao.endsWith('/') ? zentao : (zentao + '/');
    }

    /**
     * Get port
     * @return {number}
     */
    get port() {
        return this._port || this.$.zentao.port || 8080;
    }

    /**
     * Get host
     * @return {string}
     */
    get host() {
        return this._host && this._host !== '127.0.0.1' ? this._host : this.$.zentao.hostname;
    }

    /**
     * Set zentao address
     * @param  {string} zentaoAddress
     * @return {void}
     */
    set zentao(zentaoAddress) {
        zentaoAddress = zentaoAddress.trim();
        let zentaoAddressLowerCase = zentaoAddress.toLowerCase();

        if(!zentaoAddressLowerCase.startsWith('http://') && !zentaoAddressLowerCase.startsWith('https://')) {
            zentaoAddress = 'http://' + zentaoAddress;
        }

        this._zentao = zentaoAddress;
        this.$.zentao = Url.parse(zentaoAddress);
    }

    /**
     * Set user address
     * @param {string} address
     */
    set address(address) {
        this.zentao = address;
    }

    /**
     * Get user address
     * @return {string}
     */
    get address() {
        return this.zentao;
    }

    /**
     * Get user identify string
     * @return {string}
     */
    get identify() {
        if(!this.$.zentao) return '';
        let pathname = this.$.zentao.pathname;
        if(pathname === '/') pathname = '';
        if(pathname.length) pathname = pathname.replace(/\//g, '_');
        return this.account + '@' + this.$.zentao.hostname + pathname;
    }

    /**
     * Check the useris never logined
     * @return {Boolean}
     */
    get isNeverLogined() {
        return !this.lastLoginTime;
    }

    /**
     * Get password md5 string with flag
     * @return {String}
     */
    get passwordMD5WithFlag() {
        if(this.password && !this.password.startsWith(PASSWORD_WITH_MD5_FLAG)) {
            return PASSWORD_WITH_MD5_FLAG + this.password;
        }
        return this.password;
    }

    /**
     * Get password md5
     * @return {String}
     */
    get passwordMD5() {
        if(this.password.startsWith(PASSWORD_WITH_MD5_FLAG)) {
            return this.password.substr(PASSWORD_WITH_MD5_FLAG_LENGTH);
        }
        return this.password;
    }

    /**
     * Set password
     * @param {void}
     */
    setPassword(password) {
        if(password && !password.startsWith(PASSWORD_WITH_MD5_FLAG)) {
            password = PASSWORD_WITH_MD5_FLAG + Md5(password);
        }
        this.password = password;
    }

    /**
     * Get password md5 string with rand in zentao config
     * @return {String}
     */
    get passwordMD5WithRand() {
        if(this.zentaoConfig && this.zentaoConfig.rand) {
            return Md5(this.passwordMD5 + this.zentaoConfig.rand);
        }
        return '';
    }

    /**
     * Fix user avatar path
     */
    fixAvatar(avatar) {
        if(typeof avatar === 'object') {
            let member = avatar;
            avatar = member.avatar;
            if(avatar && avatar.indexOf('http://') !== 0 && avatar.indexOf('https://') !== 0) {
                member.avatar = this.address + avatar;
            }
            return member.avatar;
        } else {
            avatar = avatar || this.avatar;
            if(avatar && avatar.indexOf('http://') !== 0 && avatar.indexOf('https://') !== 0) {
                avatar = this.address + avatar;
            }
            this.avatar = avatar;
            return this.avatar;
        }
    }

    /**
     * Set user status
     * @param  {String} status
     * @return {Void}
     */
    set status(status) {
        this.changeStatus(status);
    }

    /**
     * Change user status
     */
    changeStatus(status, msg, type) {
        if(typeof status === 'string') {
            status = USER_STATUS[status.toLowerCase()];
        }
        if(USER_STATUS[status] !== undefined) {
            this.$('status', status);
            if(this.listenStatus) {
                let lastUserStatusIdentify = Events._lastStatusIdentify;
                let newUserStatusIdentify = this.identify + '$' + status;
                if(lastUserStatusIdentify !== newUserStatusIdentify) {
                    Events._lastStatusIdentify = newUserStatusIdentify;
                    Events.emit(R.event.user_status_change, this, msg, type);
                }
            }
        }
    }

    /**
     * Get user status
     * @return {string}
     */
    get status() {
        return this.$('status');
    }

    /**
     * Check listenStatus
     * @returns {boolean}
     */
    get listenStatus() {
        return this.$('listenStatus');
    }

    /**
     * Set listenStatus
     */
    set listenStatus(toggle) {
        this.$('listenStatus', toggle);
    }

    static STATUS = USER_STATUS;
}

export {USER_STATUS};
export default User;
