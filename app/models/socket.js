import Net                 from 'net';
import SocketMessage       from './socket-message';
import FileReadTask        from './file-read-task';
import R, {EVENT}          from '../resource';
import {
    Member,
    Entity,
    Chat,
    ChatMessage
}                          from './entities';
import ReadyNotifier       from './ready-notifier';

if(DEBUG && process.type !== 'renderer') {
    console.error('Socket must run in renderer process.');
}

/**
 * Socket
 */
class Socket extends ReadyNotifier {

    /**
     * Constructor
     * @param  {User} user
     * @param  {Object} options
     * @return {Void}
     */
    constructor(app, user) {
        super();

        this.pingInterval = 1000 * 60 * 10;
        this.app    = app;
        this.user   = user;
        this.emiter = app;
        this.host   = this.user.host || '127.0.0.1';
        this.port   = this.user.port;
        this.lastHandTime = 0;
        this.lastOkTime = 0;
        this.client = new Net.Socket();

        this._initHandlers();
        this.app.on(R.event.user_change, status => {
            if(this.user.isOnline && !this.pingTask) {
                this.startPing();
            } else if(this.pingTask && this.user.isOffline) {
                this.stopPing();
            }
        });

        return this.connect();
    }

    /**
     * Connect to socket server
     * @return {Void}
     */
    connect() {
        this.client.connect(this.port, this.host, this._handleConnect.bind(this));
        this.client.on('data',    this._handleData.bind(this));
        this.client.on('close',   this._handleClose.bind(this));
        this.client.on('error',   this._handleError.bind(this));
        this.client.on('timeout', this._handleTimeout.bind(this));
    }

    /**
     * Ping
     * @return {void}
     */
    ping() {
        if(DEBUG) console.log('%cSOCKET PING :)', 'color: #03b8cf; font-weight: bold; font-size: 12px', this.user.status, 'from', new Date(this.lastOkTime).toLocaleString(), 'to', new Date().toLocaleString());
        return this.send(this.createSocketMessage({
            'method': 'ping'
        }));
    }

    /**
     * Stop cyclical ping
     * @return {void}
     */
    stopPing() {
        clearInterval(this.pingTask);
        this.pingTask = null;
    }

    /**
     * Start cyclical ping
     * @return {void}
     */
    startPing() {
        this.pingTask = setInterval(() => {
            var now = new Date().getTime();
            if(now - this.lastOkTime > this.pingInterval) {
                this.ping();
            }
        }, this.pingInterval/2);
    }

    /**
     * Login
     * @return {void}
     */
    login() {
        let msg = new SocketMessage({
            'module': 'chat',
            'method': 'login',
            'params': [
                this.user.account,
                this.user.passwordMD5,
                'online'
            ]
        });

        return this.send(msg);
    }

    /**
     * Logout
     * @return {void}
     */
    logout() {
        return this.send(this.createSocketMessage({
            'method': 'logout'
        }));
    }

    /**
     * Create a SocketMessage with default data
     * @param  {object} data
     * @return {void}
     */
    createSocketMessage(data) {
        return new SocketMessage(Object.assign({sid: this.sid, ['module']: 'chat'}, data));
    }

    /**
     * Request users list by send socket message
     * @return {Void}
     */
    requestUserList() {
        return this.send(this.createSocketMessage({
            'method': 'userGetlist'
        }));
    }

    /**
     * Change user status
     * @param  {string} status
     * @return {void}
     */
    changeUserStatus(status) {
        return this.send(this.createSocketMessage({
            'method': 'userChangeStatus',
            'params': [status]
        }));
    }

    /**
     * upload file
     * @param  {File} file
     * @return {void}
     */
    uploadFile(file) {
        if(!this.uploadTasks) {
            this.uploadTasks = {};
        }
        let task = new FileReadTask(file);

        task.onData = (data, t) => {
            return this.send(this.createSocketMessage({
                'method': 'uploadfile',
                'params': [data]
            }));
        };

        this.uploadTasks[task.gid] = task;
        task.read();
    }

    /**
     * Send socket message
     * @param  {ChatMessage} msg
     * @return {Void}
     */
    send(msg) {
        if(!msg.sid && this.user.sid) msg.sid = this.user.sid;
        this.client.write(msg.json, 'utf-8', e => {
            if(DEBUG) console.log('%cSOCKET SEND ⬆ ' + msg.module + '/' + msg.method, 'color: #03b8cf; font-weight: bold; font-size: 12px', msg);
        });
    }

    /**
     * Set socket message handler
     * @param {String} moduleName
     * @param {String} methodName
     * @param {Function} func
     */
    setHandler(moduleName, methodName, func) {
        if(typeof moduleName === 'object') {
            let handlers = moduleName;
            Object.keys(handlers).forEach(mName => {
                if(this._handlers[mName]) {
                    Object.assign(this._handlers[mName], handlers[mName]);
                } else {
                    this._handlers[mName] = handlers[mName];
                }
            });
            return;
        }

        if(!this._handlers[moduleName]) {
            this._handlers[moduleName] = {}
        };
        this._handlers[moduleName][methodName] = func;
    }

    /**
     * Get socketmessage handler
     * @param  {String} moduleName
     * @param  {String} methodName
     * @return {Function}
     */
    getHandler(moduleName, methodName) {
        if(!this._handlers[moduleName]) {
            return null;
        }
        return this._handlers[moduleName][methodName.toLowerCase()];
    }

    /**
     * Init socket message handlers
     * @return {Void}
     */
    _initHandlers() {
        this._handlers = {
            chat: {
                login: msg => {
                    if(msg.isSuccess) {
                        if(!this.user || this.user.isOffline || msg.data.id === this.user.id) {
                            this.sid = msg.sid;
                            let user = Object.assign({sid: msg.sid}, msg.data);
                            this._emit(R.event.user_login_message, user);
                        } else {
                            let member = this.app.dao.getMember(msg.data.id);
                            if(member) {
                                member.status = msg.data.status;
                                this._emit(R.event.data_change, {members: [member]});
                            }
                        }
                    } else {
                        this._emit(R.event.user_login_message, null, new Error(msg.data));
                    }
                },
                userchangestatus: msg => {
                    if(msg.isSuccess) {
                        if(!msg.data.id || msg.data.id === this.user.id) {
                            this.user.changeStatus(msg.data.status);
                        }
                        let member = this.app.dao.getMember(msg.data.id);
                        if(member) {
                            member.status = msg.data.status;
                            this._emit(R.event.data_change, {members: [member]});
                        }
                    }
                },
                logout: msg => {
                    if(msg.isSuccess) {
                        if(msg.data.id === this.user.id) {
                            this.user.status = 'offline';
                        }
                        let member = this.app.dao.getMember(msg.data.id);
                        if(member) {
                            member.status = 'offline';
                            this._emit(R.event.data_change, {members: [member]});
                        }
                    }
                },
                usergetlist: msg => {
                    if(msg.isSuccess) {
                        let members = Object.keys(msg.data).map(key => {
                            let member = new Member(msg.data[key]);
                            this.user.fixAvatar(member);
                            return member;
                        });

                        this.app.dao.initMembers(members);
                    }
                },
                uploadfile: msg => {
                    if(msg.isSuccess) {
                        let task = this.uploadTasks[msg.data.gid];
                        
                        if(task) {
                            this._emit(R.event.file_upload, task);
                            
                            if(task.isFinish) {
                                delete this.uploadTasks[msg.data.gid];
                                if(DEBUG) console.info('FILE UPLOAD FINISH', msg, task);
                            } else {
                                task.read();
                            }
                        }
                    }
                },
                kickoff: msg => {
                    this._emit(R.event.user_kickoff, {message: msg.message});
                }
            }
        };
    }

    /**
     * Emit event with given emiter
     * @param  {...Any} params
     * @return {Void}
     */
    _emit(...params) {
        if(this.emiter && this.emiter.emit) {
            this.emiter.emit(...params);
        }
    }

    /**
     * Handle socket connect event
     * @return {Void}
     */
    _handleConnect() {
        if(DEBUG) console.log('%cSOCKET CONNECTED ' + this.host +':' + this.port, 'color: purple');
        this.login();
        this.ready();
        this._emit(EVENT.socket_connected, {host: this.host, port: this.port});
    }

    /**
     * Handle socket message
     * @param  {SocketMessage} msg
     * @return {Any}
     */
    _handleMessage(msg) {
        this.lastHandTime = new Date().getTime();
        if(msg.isSuccess) this.lastOkTime = this.lastHandTime;

        let handler = this.getHandler(msg.module, msg.method);
        if(handler) {
            while(handler && typeof handler === 'string') {
                handler = this.getHandler(...handler.split('/'));
            }
            return handler(msg);
        }
        return false;
    }

    /**
     * Handle socket connect event
     * @return {Void}
     */
    _handleData(data) {
        this._emit(EVENT.socket_data, data);

        if(!data || !data.length) return;
        if(data[data.length - 1] !== 10) {
            if(this._rawData) {
                this._rawData.push(data);
            } else {
                this._rawData = [data];
            }
            // if(DEBUG) console.log('%cSOCKET DATA ⬇ CONTINUE RAW: ' + data , 'color: #8666b8; font-weight: bold; font-size: 12px');
            return;
        } else if(this._rawData) {
            this._rawData.push(data);
            data = this._rawData;
            this._rawData = null;
            // if(DEBUG) console.log('%cSOCKET DATA ⬇ FINISH CONTINUE RAW: ' + data , 'color: #8666b8; font-weight: bold; font-size: 12px', data);
        }

        let msg = SocketMessage.fromJSON(data);
        if(!msg) {
            if(DEBUG) console.log('%cSOCKET DATA ⬇ UNKNOW RAW: ' + data , 'color: #8666b8; font-weight: bold; font-size: 12px', msg);
            return;
        }

        if(DEBUG) console.log('%cSOCKET DATA ⬇ ' + (Array.isArray(msg) ? (msg.length + ' bundle') : (msg.module + '/' + msg.method)), 'color: #8666b8; font-weight: bold; font-size: 12px', msg);

        if(Array.isArray(msg)) {
            msg.forEach(x => this._handleMessage(x));
        } else {
            this._handleMessage(msg);
        }
    }

    /**
     * Handle socket connect event
     * @return {Void}
     */
    _handleClose(e) {
        if(this._markDestroy) return;
        if(DEBUG) console.log('%cSOCKET CLOSE', 'color: purple', e);
        this._emit(EVENT.socket_close, e);
    }

    /**
     * Handle socket connect event
     * @return {Void}
     */
    _handleError(e) {
        if(this._markDestroy) return;
        if(DEBUG) console.error('SOCKET ERROR', e);
        this._emit(EVENT.socket_error, e);
    }

    /**
     * Handle socket connect event
     * @return {Void}
     */
    _handleTimeout(e) {
        if(this._markDestroy) return;
        if(DEBUG) console.error('SOCKET TIMEOUT', e);
        this._emit(EVENT.socket_timeout, e);
    }

    /**
     * Destrory socket client
     * @return {Void}
     */
    destroy() {
        this.stopPing();
        this._markDestroy = true;
        this.client.destroy();
    }
}

export default Socket;
