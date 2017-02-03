/**
 * SocketMessage
 */
class SocketMessage {
    constructor(data) {
        Object.assign(this, data);
    }

    /**
     * Stringify as json
     * @return {string}
     */
    get json() {
        return JSON.stringify(this) + '\n';
    }

    /**
     * Check whether the socket message is success
     * @return {boolean}
     */
    get isSuccess() {
        return this.result === 'success' || (this.data && this.result === undefined);
    }

    /**
     * Create Scoket message from json string
     * @param  {string} json
     * @return {ScoketMessage}
     */
    static fromJSON(json) {
        try {
            if(Array.isArray(json)) {
                if(DEBUG) console.log('Build socket message from buffer array.', json);
                json = json.map(x => x.toString()).join('');
            }
            if(typeof json !== 'string') json = json.toString();
            if(json.endsWith('\n')) json = json.substring(0, json.length - 1);
            let firstEOF = json.indexOf('\n');
            if(firstEOF > 0 && firstEOF < json.length) {
                json = '[' + json.split('\n').join(',') + ']';
                if(DEBUG) console.log('Socket message contains "\\n", make it as json array.', json);
            }
            let data = JSON.parse(json);
            if(Array.isArray(data)) {
                let msgs = [];
                data.forEach(x => {
                    if(Array.isArray(x)) {
                        msgs.push(...x.map(y => new SocketMessage(y)));
                    } else {
                        msgs.push(new SocketMessage(x));
                    }
                });
                return msgs;
            }
            return new SocketMessage(data);
        } catch (error) {
            if(DEBUG) {
                console.groupCollapsed('%cError: SocketMessage from json', 'color:red', error);
                console.log('raw', json);
                console.log('raw string', json.toString());
                console.groupEnd();
            }

        }
        
    }
}

export default SocketMessage;
