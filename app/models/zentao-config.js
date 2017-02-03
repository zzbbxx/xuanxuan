/**
 * Extract version number from string
 * @param  {String} version
 * @return {Number}
 */
function extractVersionNumber(version) {
    let excludeDot = false;
    let ver = '';
    for(let c in version) {
        switch(c) {
            case '1': case '2': case '3': case '4': case '5':
            case '6': case '7': case '8': case '9': case '0':
                ver += c;
                break;
            case '.':
                if(!excludeDot) {
                    ver += c;
                    excludeDot = true;
                }
                break;
            default:
                continue;
        }
    }
    return Number.parseFloat(ver);
}

/**
 * The ZentaoConfig class
 * config as json like: {"version":"6.3","requestType":"PATH_INFO","pathType":"clean",
 * "requestFix":"-","moduleVar":"m","methodVar":"f","viewVar":"t","sessionVar":"sid",
 * "sessionName":"sid","sessionID":"joj7nhuq6mk0snot551oaju405","rand":4396,"expiredTime":"1440"}
 */
class ZentaoConfig {
    constructor(config) {
        Object.assign(this, config);
        this.createTime = new Date().getTime();
    }

    /**
     * Check whether the zentao is a pro version
     * @return {boolean}
     */
    get isPro() {
        return this.version && this.version.indexOf('pro') > -1;
    }

    /**
     * Check whether the request type is 'PATH_INFO'
     * @return {boolean}
     */
    get isPathInfoRequestType() {
        return this.requestType && this.requestType.toUpperCase() === 'PATH_INFO';
    }

    /**
     * Get zentao version as number
     * @return {number}
     */
    get versionNumber() {
        return this.version ? extractVersionNumber(this.version) : 0;
    }

    /**
     * Check whether the zentao api is available
     * @return {boolean}
     */
    get isZentaoAPIAvailable() {
        return this.isPro && this.versionNumber > 4.3;
    }

    /**
     * Check whether the session is expired
     * @return {boolean}
     */
    get isExpired() {
        return (new Date().getTime() - this.createTime + 30000) >= this.expiredTime * 1000;
    }
}

export default ZentaoConfig;
