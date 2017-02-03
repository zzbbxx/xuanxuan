/**
 * Application action link object
 */
class AppActionLink {
    constructor(link, event) {
        this.link  = link;
        this.event = event;
    }

    /**
     * Initial function to extract attributes
     * @return {void}
     */
    _extract() {
        let link = this.link;

        var urlFlagIndex = link.indexOf(':');
        if(urlFlagIndex < 7 && urlFlagIndex > -1) {
            this._action = 'URL';
            this._target = link;
            return;
        }

        if(link.startsWith('#')) {
            link = link.substring(1);
        }

        let params = link.split('/');
        let length = params.length;
        this._params = params;
        this._action = length > 0 ? params[0] : null;
        this._target = length > 1 ? params[1] : null;
        this._extras = length > 2 ? params.slice(2, length) : null;
    }

    /**
     * Get action name
     * @return {string}
     */
    get action() {
        if(this._action === undefined) {
            this._extract();
        }
        return this._action;
    }

    /**
     * Get target
     * @return {string}
     */
    get target() {
        if(this._target === undefined) {
            this._extract();
        }
        return this._target;
    }

    /**
     * Get extras
     * @return {string}
     */
    get extras() {
        if(this._extras === undefined) {
            this._extract();
        }
        return this._extras;
    }
}

export default AppActionLink;
