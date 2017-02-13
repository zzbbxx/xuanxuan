import fs                 from 'fs';
import Moment             from 'moment';
import UUID               from 'uuid';
import Path               from 'path';
import {
    BrowserWindow,
    app as ElectronApp,
    dialog,
    Tray,
    Menu,
    nativeImage,
    globalShortcut
}                         from 'electron';
import Lang               from './lang';
import R, {EVENT}         from './resource';
import ReadyNotifier      from './models/ready-notifier';
import Event              from './event-center';
import Helper             from './utils/helper';

if(DEBUG && process.type === 'renderer') {
    console.error('App must run in main process.');
}

/**
 * App
 * 
 * Only for main process
 */
class AppRemote extends ReadyNotifier {

    constructor(mainWindow) {
        super();

        this.event = Event;
        this.ipc = Event.ipc;

        this.windows = {};
        if(typeof mainWindow === 'object') {
            if(mainWindow instanceof BrowserWindow) {
                this.windows.main = mainWindow;
            } else {
                this.createWindow('main', mainWindow);
            }
        }

        this.dataPath = ElectronApp.getPath('userData');
        this.appRoot  = __dirname;
    }

    createWindow(name, options) {
        if(typeof name === 'object') {
            options = name;
            name = options.name;
        }
        if(!name) {
            if(DEBUG) console.error("Window name must be set.");
            name = UUID.v4();
        }

        let browserWindow = this.windows[name];
        if(browserWindow) {
            if(options.single) {
                browserWindow.show();
                browserWindow.reload();
                return;
            } else {
                browserWindow.close();
            }
        }

        browserWindow = new BrowserWindow(options);
        this.windows[name] = browserWindow;
        browserWindow.on('closed', () => {
            delete this.windows[name];
        });

        return browserWindow;
    }

    sendToWindows(channel, ...args) {
        Object.keys(this.windows).forEach(name => {
            this.sendToWindow(name, channel, ...args);
        });
    }

    sendToWindow(name, channel, ...args) {
        let browserWindow = this.windows[name];
        if(browserWindow) {
            browserWindow.webContents.send(channel, ...args);
        }
    }

        /**
     * Bind event
     * @param  {String} event
     * @param  {Function} listener
     * @return {Symbol}
     */
    on(event, listener) {
        return this.event.on(event, listener);
    }

    /**
     * Unbind event
     * @param  {...[Symbol]} names
     * @return {Void}
     */
    off(...names) {
        this.event.off(...names);
    }

    emit(event, ...args) {
        this.event.emit(event, ...args);
    }

    init(mainWindow) {
        if(mainWindow instanceof BrowserWindow) {
            this.mainWindow = mainWindow;
        }

        Helper.tryMkdirp(this.dataPath);

        Event.ipc.on(EVENT.app_quit, e => {
            electron.app.quit();
        });

        Event.ipc.on(EVENT.app_remote, (e, method, callBackEventName, ...args) => {
            let result = this[method];
            if(typeof result === 'function') {
                result = result.call(this, ...args);
            }
            if(method === 'quit') return;
            if(result instanceof Promise) {
                result.then(x => {
                    e.sender.send(callBackEventName, x);
                });
            } else if(result instanceof BrowserWindow) {
                result.webContents.on('did-finish-load', () => {
                    e.sender.send(callBackEventName, result.webContents);
                });
            } else {
                e.sender.send(callBackEventName, result);
            }
            if(DEBUG) console.info('Accept remote call', callBackEventName + '.' + method + '(', args, ')');
        });

        Event.ipc.on(EVENT.app_remote_send, (e, windowName, eventName, ...args) => {
            let browserWindow = this.windows[windowName];
            if(browserWindow) {
                browserWindow.webContents.send(eventName, ...args);
            }
        });

        let tray = new Tray(`${__dirname}/img/tray-icon-16.png`);
        let trayContextMenu = Menu.buildFromTemplate([
            {
                label: Lang.common.open,
                click: () => {
                    this.showAndFocusWindow();
                }
            }, {
                label: Lang.common.exit,
                click: () => {
                    this.quit();
                }
            }
        ]);
        tray.setToolTip(Lang.title);
        tray.on('click', () => {
            this.showAndFocusWindow();
        });
        tray.on('right-click', () => {
            tray.popUpContextMenu(trayContextMenu);
        });
        this.tray = tray;
        this._trayIcons = [
            nativeImage.createFromPath(`${__dirname}/img/tray-icon-16.png`), 
            nativeImage.createFromPath(`${__dirname}/img/tray-icon-transparent.png`)
        ];
        this._trayIconCounter = 0;
    }

    /**
     * Set tooltip text on tray icon
     * @param  {string | false} tooltip
     * @return {void}
     */
    trayTooltip(tooltip) {
        this.tray.setToolTip(tooltip || Lang.title);
    }

    /**
     * Flash tray icon
     * @param  {boolean} flash
     * @return {void}
     */
    flashTrayIcon(flash = true) {
        if(flash) {
            if(!this._flashTrayIconTask) {
                this._flashTrayIconTask = setInterval(() => {
                    this.tray.setImage(this._trayIcons[this._trayIconCounter++%2]);
                }, 400);
            }
        } else {
            if(this._flashTrayIconTask) {
                clearInterval(this._flashTrayIconTask);
                this._flashTrayIconTask = null;
            }
            this.tray.setImage(this._trayIcons[0]);
        }
    }

    /**
     * Show and focus window
     */
    showAndFocusWindow(windowName = 'main') {
        let browserWindow = this.windows[windowName];
        if(browserWindow) {
            browserWindow.show();
            browserWindow.focus();
        }
    }

    /**
     * Close main window and quit
     */
    quit() {
        this.closeMainWindow();
        this.tray.destroy();
        ElectronApp.quit();
        globalShortcut.unregisterAll();
    }

    get mainWindow() {
        return this.windows.main;
    }

    set mainWindow(mainWindow) {
        if(!mainWindow) {
            delete this.windows.main;
        } else {
            this.windows.main = mainWindow;
            mainWindow.on('close', e => {
                if(this.markClose) return;
                mainWindow.webContents.send(R.event.app_main_window_close);
                e.preventDefault();
                return false;
            });
        }
    }

    closeMainWindow() {
        this.markClose = true;
        this.mainWindow.close();
        this.mainWindow = null;
    }

    reloadWindow(windowNameOrWebContents, confirm = true, ignoreCache = false) {
        let webContents, browserWindow;
        if(typeof windowNameOrWebContents === 'string') {
            browserWindow = this.windows[windowNameOrWebContents];
            if(browserWindow) webContents = browserWindow.webContents;
        } else if(windowNameOrWebContents.webContents) {
            browserWindow = windowNameOrWebContents;
            webContents = windowNameOrWebContents.webContents;
        } else if(windowNameOrWebContents.reload) {
            webContents = windowNameOrWebContents;
        }
        if(webContents) {
            let reloadWindowCallback = () => {
                webContents[ignoreCache ? 'reloadIgnoringCache' : 'reload']();
            };
            if(confirm) {
                let options = {
                    buttons: [Lang.main.reload],
                    cancelId: 0,
                    type: 'question',
                    message: typeof confirm === 'string' ? confirm : Lang.main.confirmToReloadWindow
                };
                if(browserWindow) {
                    dialog.showMessageBox(browserWindow, options, reloadWindowCallback);
                } else {
                    dialog.showMessageBox(options, reloadWindowCallback);
                }
            } else {
                reloadWindowCallback();
            }
        }
    }

    dockBadgeLabel(label) {
        if(Helper.isOSX) {
            ElectronApp.dock.setBadge(label);
            if(label) {
                this.trayTooltip = (Lang.title + ' （' + Lang.chat.someNewMessages.format(label) + ')');
            }
        }
    }

    dockBounce(type = 'informational') {
        if(Helper.isOSX) {
            ElectronApp.dock.bounce(type);
        }
    }
}

const app = new AppRemote();
if(DEBUG) console.info('App created.');

export default app;
