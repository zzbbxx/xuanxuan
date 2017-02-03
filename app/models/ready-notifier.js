let idSeed = 1;

class ReadyNotifier {

    /**
     * Call ready callbacks or plan to call callbacks on ready
     * @param  {function} callback
     * @return {number}   callback id
     */
    ready(callback) {
        if(typeof callback === 'function') {
            if(this.isReady) {
                callback();
                return true;
            } else {
                this.isReady = false;
                if(!this._readyCalls) {
                    this._readyCalls = [];
                }
                let readyCall = {id: idSeed++, callback};
                this._readyCalls.push(readyCall);
                return readyCall.id;
            }
        } else {
            this.isReady = true;
            if(this._readyCalls) {
                this._readyCalls.forEach(function(call) {
                    call.callback();
                });
                delete this._readyCalls;
            }
        }
    }

    /**
     * Remove ready callback by id or remove all callbacks
     * 
     * @param  {number} callId callback id or let empty to remove all callbacks
     * @return {bool}   result
     */
    removeReadyCall(callId) {
        if(!this._readyCalls) return false;
        if(callId) {
            for(let i = 0; i < this._readyCalls.length; ++i) {
                if(this._readyCalls[i].id == callId) {
                    this._readyCalls.splice(i, 1);
                    return;
                }
            }
            return false;
        } else {
            this._readyCalls = null;
        }
        return true;
    }
}

export default ReadyNotifier;
