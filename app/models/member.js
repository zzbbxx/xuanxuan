import Entity from './entity';
import Path   from 'path';

/**
 * Define status names
 */
const USER_STATUS = ['unverified', 'disconnect', 'online', 'busy', 'away'];

/**
 * Define status value code
 */
USER_STATUS.unverified = 0;
USER_STATUS.offline    = 0;
USER_STATUS.disconnect = 1;
USER_STATUS.online     = 2;
USER_STATUS.busy       = 3;
USER_STATUS.away       = 4;

/**
 * Get status name
 */
USER_STATUS.getName = (val, defaultName) => {
    if(val !== undefined && USER_STATUS[val] !== undefined) {
        let typeofStatus = typeof val;
        if(typeofStatus === 'string') {
            return val;
        } else if(typeofStatus === 'number') {
            return USER_STATUS[val];
        }
    }
    return defaultName || USER_STATUS[USER_STATUS.unverified];
};

/**
 * Get status value code
 */
USER_STATUS.getValue = (value, defaultValue) => {
    if(value !== undefined && USER_STATUS[value] !== undefined) {
        let typeofStatus = typeof value;
        if(typeofStatus === 'number') {
            return value;
        } else if(typeofStatus === 'string') {
            return USER_STATUS[value];
        }
    }
    return defaultValue || USER_STATUS.unverified;
}

/**
 * Member class
 */
class Member extends Entity {

    constructor(data) {
        super(data, {dept: 'int'});
    }

    /**
     * Get display name
     * @return {String}
     */
    get displayName() {
        return this.realname ? this.realname : `[${this.account}]`;
    }

    /**
     * Get user status name
     */
    get statusName() {
        return USER_STATUS.getName(this.status);
    }

    /**
     * Get status value
     */
    get statusValue() {
        if(this.status !== undefined && USER_STATUS[this.status] !== undefined) {
            let typeofStatus = typeof this.status;
            if(typeofStatus === 'number') {
                return this.status;
            } else if(typeofStatus === 'string') {
                return USER_STATUS[this.status];
            }
        }
        return USER_STATUS.unverified;
    }

    /**
     * Check user status is online
     * @return {Boolean}
     */
    get isOnline() {
        return this.statusValue >= USER_STATUS.online;
    }

    /**
     * Check user status is disconnect
     */
    get isDisconnect() {
        return this.statusValue === USER_STATUS.disconnect;
    }

    /**
     * Check user status is offline
     * @return {Boolean}
     */
    get isOffline() {
        return !this.isOnline;
    }

    /**
     * Check user status is unverified
     */
    get isUnverified() {
        return this.statusValue <= USER_STATUS.unverified;
    }

    /**
     * Check user status is disconnect
     */
    get isDisconnect() {
        return this.statusValue === USER_STATUS.disconnect;
    }

    /**
     * Check status
     */
    isStatus(status) {
        return this.status === status || this.statusValue === status || this.statusName === status;
    }

    /**
     * Check the member is current user
     */
    get isMyself() {
        return this.$.isMyself;
    }

    /**
     * Set the member is current user
     */
    set isMyself(isMyself) {
        this.$.isMyself = isMyself;
    }

    /**
     * Check the user is supper admin
     */
    get isSuperAdmin() {
        return this.admin === 'super';
    }

    /**
     * Get a number for compare function
     * @return {number}
     */
    get orderCompareValue() {
        let isMyselfVal = this.isMyself ? 1 : 0;
        let statusVal = USER_STATUS.getValue(this.status);
        return isMyselfVal * 10 + statusVal;
    }

    getLocalAvatar(imagePath) {
        if(this.avatar) {
            return Path.join(imagePath, Path.basename(this.avatar));
        }
        return null;
    }
}

Entity.addCreator({Member});

export {USER_STATUS}
export default Member;
