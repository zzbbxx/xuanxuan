import './style/less/app.less';
import './utils/debug';
import './utils/helper';
import './utils/input-context-menu';
import React                  from 'react';
import ReactDOM               from 'react-dom';
import electron               from 'electron';
import R                      from './resource';
import AppContainer           from './views/app-container';
import {ThemeProvider}        from 'Theme';
import Messager               from 'Components/messager';
import lang                   from './lang';
import EventCenter            from './event-center';
import App                    from './app';

// prevent default behavior from changing page on dropped file
let dragLeaveTask;
let completeDragNDrop = () => {
    document.body.classList.remove('drag-n-drop-over-in');
    setTimeout(() => {
        document.body.classList.remove('drag-n-drop-over');
    }, 350);
}
window.ondragover = e => {
    clearTimeout(dragLeaveTask);
    if(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length) {
        document.body.classList.add('drag-n-drop-over');
        setTimeout(() => {
            document.body.classList.add('drag-n-drop-over-in');
        }, 10);
    }
    e.preventDefault();
    return false;
};
window.ondragleave = e => {
    clearTimeout(dragLeaveTask);
    dragLeaveTask = setTimeout(completeDragNDrop, 300);
    e.preventDefault();
    return false;
};
window.ondrop = e => {
    clearTimeout(dragLeaveTask);
    completeDragNDrop();
    if(DEBUG) console.log('%cDRAG FILE ' + (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length ? e.dataTransfer.files[0].path : ''), 'display: inline-block; font-size: 13px; background: #03B8CF; color: #fff; padding: 2px 5px', Object.assign({}, e));
    e.preventDefault();
    return false;
};
window.addEventListener('online',  () => {
    EventCenter.emit(R.event.net_online);
    EventCenter.ipc.emit(R.event.net_online);
});
window.addEventListener('offline',  () => {
    EventCenter.emit(R.event.net_offline);
    EventCenter.ipc.emit(R.event.net_online);
});

document.title = lang.title;

App.ready(() => {
    let appElement = document.getElementById('appContainer');
    ReactDOM.render(<ThemeProvider><AppContainer /></ThemeProvider>, appElement);

    let loadingElement = document.getElementById('loading');
    loadingElement.parentNode.removeChild(loadingElement);
});

EventCenter.on(R.event.ui_messager, options => {
    Messager.show(options);
});
