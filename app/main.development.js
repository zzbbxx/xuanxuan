import electron, { 
    app, 
    BrowserWindow, 
    Menu, 
    shell
}                   from 'electron';
import DEBUG        from './utils/debug';
import lang         from './lang';
import application  from './app-remote';
import PKG          from './package.json';

let menu;
let template;
let mainWindow = null;

if (process.env.NODE_ENV === 'production') {
    const sourceMapSupport = require('source-map-support'); // eslint-disable-line
    sourceMapSupport.install();
}

if (DEBUG) {
    require('electron-debug')(); // eslint-disable-line global-require
    const path = require('path'); // eslint-disable-line
    const p = path.join(__dirname, '..', 'app', 'node_modules'); // eslint-disable-line
    require('module').globalPaths.push(p); // eslint-disable-line
}

// Quit when all windows are closed.
app.on('window-all-closed', () => {
    // On OS X it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') app.quit();
});

const installExtensions = async() => {
    if (DEBUG) {
        const installer = require('electron-devtools-installer'); // eslint-disable-line global-require

        const extensions = [
            'REACT_DEVELOPER_TOOLS',
            'REDUX_DEVTOOLS'
        ];
        const forceDownload = !!process.env.UPGRADE_EXTENSIONS;
        for (const name of extensions) { // eslint-disable-line
            try {
                await installer.default(installer[name], forceDownload);
            } catch (e) {} // eslint-disable-line
        }
    }
};

const createWindow = () => {
    let mainWindowOptions = {
        show: false,
        width: 1024,
        height: 728
    };
    if(DEBUG) {
        let display = electron.screen.getPrimaryDisplay();
        mainWindowOptions.height = display.workAreaSize.height;
        mainWindowOptions.width = 1200;
        mainWindowOptions.x = display.workArea.x;
        mainWindowOptions.y = display.workArea.y;
    }
    mainWindow = new BrowserWindow(mainWindowOptions);

    mainWindow.loadURL(`file://${__dirname}/app.html`);

    mainWindow.webContents.on('did-finish-load', () => {
        mainWindow.show();
        mainWindow.focus();
    });

    mainWindow.on('closed', () => {
        mainWindow = null;
    });

    application.mainWindow = mainWindow;

    // Create application menu
    if (process.platform === 'darwin') {
        template = [{
            label: lang.title,
            submenu: [{
                label: lang.menu.about,
                selector: 'orderFrontStandardAboutPanel:'
            }, {
                type: 'separator'
            }, {
                label: 'Services',
                submenu: []
            }, {
                type: 'separator'
            }, {
                label: lang.menu.hideCurrentWindow,
                accelerator: 'Command+H',
                selector: 'hide:'
            }, {
                label: lang.menu.hideOtherWindows,
                accelerator: 'Command+Shift+H',
                selector: 'hideOtherApplications:'
            }, {
                label: lang.menu.showAllWindows,
                selector: 'unhideAllApplications:'
            }, {
                type: 'separator'
            }, {
                label: lang.menu.quit,
                accelerator: 'Command+Q',
                click() {
                    app.quit();
                }
            }]
        }, {
            label: lang.menu.edit,
            submenu: [{
                label: lang.menu.undo,
                accelerator: 'Command+Z',
                selector: 'undo:'
            }, {
                label: lang.menu.redo,
                accelerator: 'Shift+Command+Z',
                selector: 'redo:'
            }, {
                type: 'separator'
            }, {
                label: lang.menu.cut,
                accelerator: 'Command+X',
                selector: 'cut:'
            }, {
                label: lang.menu.copy,
                accelerator: 'Command+C',
                selector: 'copy:'
            }, {
                label: lang.menu.paste,
                accelerator: 'Command+V',
                selector: 'paste:'
            }, {
                label: lang.menu.selectAll,
                accelerator: 'Command+A',
                selector: 'selectAll:'
            }]
        }, {
            label: lang.menu.view,
            submenu: (DEBUG) ? [{
                label: lang.menu.reload,
                accelerator: 'Command+R',
                click() {
                    mainWindow.webContents.reload();
                }
            }, {
                label: lang.menu.toggleFullscreen,
                accelerator: 'Ctrl+Command+F',
                click() {
                    mainWindow.setFullScreen(!mainWindow.isFullScreen());
                }
            }, {
                label: lang.menu.toggleDeveloperTool,
                accelerator: 'Alt+Command+I',
                click() {
                    mainWindow.toggleDevTools();
                }
            }] : [{
                label: lang.menu.toggleFullscreen,
                accelerator: 'Ctrl+Command+F',
                click() {
                    mainWindow.setFullScreen(!mainWindow.isFullScreen());
                }
            }]
        }, {
            label: lang.menu.window,
            submenu: [{
                label: lang.menu.minimize,
                accelerator: 'Command+M',
                selector: 'performMiniaturize:'
            }, {
                label: lang.menu.close,
                accelerator: 'Command+W',
                selector: 'performClose:'
            }, {
                type: 'separator'
            }, {
                label: lang.menu.bringAllToFront,
                selector: 'arrangeInFront:'
            }]
        }, {
            label: lang.menu.help,
            submenu: [{
                label: lang.menu.website,
                click() {
                    shell.openExternal('https://github.com/easysoft/xuanxuan');
                }
            }, {
                label: lang.menu.project,
                click() {
                    shell.openExternal('https://github.com/easysoft/xuanxuan');
                }
            }, {
                label: lang.menu.community,
                click() {
                    shell.openExternal('https://github.com/easysoft/xuanxuan');
                }
            }, {
                label: lang.menu.issues,
                click() {
                    shell.openExternal('https://github.com/easysoft/xuanxuan/issues');
                }
            }]
        }];

        menu = Menu.buildFromTemplate(template);
        Menu.setApplicationMenu(menu);
    } else {
        template = [{
            label: '&File',
            submenu: [{
                label: '&Open',
                accelerator: 'Ctrl+O'
            }, {
                label: '&Close',
                accelerator: 'Ctrl+W',
                click() {
                    mainWindow.close();
                }
            }]
        }, {
            label: '&View',
            submenu: (DEBUG) ? [{
                label: '&Reload',
                accelerator: 'Ctrl+R',
                click() {
                    mainWindow.webContents.reload();
                }
            }, {
                label: 'Toggle &Full Screen',
                accelerator: 'F11',
                click() {
                    mainWindow.setFullScreen(!mainWindow.isFullScreen());
                }
            }, {
                label: 'Toggle &Developer Tools',
                accelerator: 'Alt+Ctrl+I',
                click() {
                    mainWindow.toggleDevTools();
                }
            }] : [{
                label: 'Toggle &Full Screen',
                accelerator: 'F11',
                click() {
                    mainWindow.setFullScreen(!mainWindow.isFullScreen());
                }
            }]
        }, {
            label: 'Help',
            submenu: [{
                label: 'Learn More',
                click() {
                    shell.openExternal('http://electron.atom.io');
                }
            }, {
                label: 'Documentation',
                click() {
                    shell.openExternal('https://github.com/atom/electron/tree/master/docs#readme');
                }
            }, {
                label: 'Community Discussions',
                click() {
                    shell.openExternal('https://discuss.atom.io/c/electron');
                }
            }, {
                label: 'Search Issues',
                click() {
                    shell.openExternal('https://github.com/atom/electron/issues');
                }
            }]
        }];
        menu = Menu.buildFromTemplate(template);
        mainWindow.setMenu(menu);
    }

    // Show developer tools
    if (DEBUG) {
        mainWindow.openDevTools();
        mainWindow.webContents.on('context-menu', (e, props) => {
            const { x, y } = props;

            Menu.buildFromTemplate([{
                label: lang.debug.inspectElement,
                click() {
                    mainWindow.inspectElement(x, y);
                }
            }]).popup(mainWindow);
        });
        console.info('Main window created.');
    }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on('ready', async() => {
    await installExtensions();
    createWindow();
    application.init();
    if(DEBUG) console.info('Electron app ready.');
});

app.on('activate', () => {
    // On OS X it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (mainWindow === null) {
        createWindow();
    }
    if(DEBUG) console.info('Electron app activate.');
});

app.setAboutPanelOptions({
    applicationName: lang.title,
    applicationVersion: PKG.version,
    copyright: 'Copyright (C) 2017 cnezsoft.com',
    credits: 'Licence: ' + PKG.license,
    version: DEBUG ? '[debug]' : ''
});

if(DEBUG) console.info('Electron main process finish.');
