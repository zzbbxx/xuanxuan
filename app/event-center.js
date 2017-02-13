import electron     from 'electron';
import EventEmitter from 'events';
import {EVENT}      from './resource';

class EventCenter extends EventEmitter {

    /**
     * Event center constructor
     */
    constructor() {
        super();
        this.isMainProcess = process.type !== 'renderer';
        this.ipc = (this.isMainProcess && electron.ipcMain) ? electron.ipcMain : electron.ipcRenderer;
    }

    sendToWindow(windowName, eventName, ...args) {
        if(this.isMainProcess) {
            if(DEBUG) console.error('Can not send to window in main process');
            return;
        }
        this.ipc.send(EVENT.app_remote_send, windowName, eventName, ...args);
    }

    sendToMainWindow(eventName, ...args) {
        return this.sendToWindow('main', eventName, ...args);
    }
    
    /**
     * Bind event
     * @param  {String} event
     * @param  {Function} listener
     * @return {Symbol}
     */
    on(event, listener) {
        super.on(event, listener);
        let name = Symbol(event);
        if(!this._eventsMap) this._eventsMap = {};
        this._eventsMap[name] = {listener, name: event};
         if(DEBUG) console.log('%c ON EVENT ' + event, 'color: orange');
        return name;
    }

    /**
     * Bind once event
     * @param  {String} event
     * @param  {Function} listener
     * @return {Symbol}
     */
    once(event, listener) {
        super.once(event, listener);
        let name = Symbol(event);
        if(!this._eventsMap) this._eventsMap = {};
        this._eventsMap[name] = {listener, name: event};
         if(DEBUG) console.log('%c ON EVENT ' + event, 'color: orange');
        return name;
    }

    /**
     * Unbind event
     * @param  {...[Symbol]} names
     * @return {Void}
     */
    off(...names) {
        if(this._eventsMap) {
            names.forEach(name => {
                let event = this._eventsMap[name];
                if(event) {
                    this.removeListener(event.name, event.listener);
                    delete this._eventsMap[name];
                     if(DEBUG) console.log('%c OFF EVENT ' + event.name, 'color: brown');
                }
            });
        }
    }

    /**
     * Emit event
     */
    emit(names, ...args) {
        super.emit(names, ...args);
        if(DEBUG) console.log('%c EMIT EVENT %c' + names, 'color: orange', 'background: orange; color: #fff', args);
    }
}

const eventCenter = new EventCenter();

if(DEBUG) console.log('%cEventCenter [' + process.type + ']', 'color: #fff; background: orange')

export default eventCenter;