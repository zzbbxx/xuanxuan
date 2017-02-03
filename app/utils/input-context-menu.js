import {remote} from 'electron';
import Lang     from 'Lang';

const Menu   = remote.Menu;

document.body.addEventListener('contextmenu', (e) => {
    let node = e.target;

    while (node) {
        if (node.nodeName.match(/^(input|textarea)$/i) || node.isContentEditable) {
            Menu.getApplicationMenu().items[1].submenu.popup(remote.getCurrentWindow());
            e.preventDefault();
            e.stopPropagation();
            break;
        }
        node = node.parentNode;
    }
});