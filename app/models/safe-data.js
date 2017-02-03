/**
 * SafeData
 */
class SafeData {
    constructor() {
        this.$ = function() {
            let argumentsLength = arguments.length;
            if(argumentsLength === 1) {
                let arg = arguments[0];
                if(typeof(arg) === 'object') {
                    Object.assign(this.$, arg);
                } else {
                    return this.$[arg];
                }
            } else if(argumentsLength === 2) {
                this.$[arguments[0]] = arguments[1];
            }
            return this.$;
        }
    }

    /**
     * Set inner values
     * @param {String|Object} key
     * @param {Any} val 
     */
    $set(key, val) {
        if(typeof key === 'object') {
            Object.assign(this.$, key);
        } else {
            this.$[key] = val;
        }
    }

    /**
     * Get inner value
     * @param  {String} key
     * @return {any}
     */
    $get(key) {
        return this.$[key];
    }
}

export default SafeData;
