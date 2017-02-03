import '../../style/less/app.less';
import 'Utils/debug';
import 'Utils/helper';
import React                  from 'react';
import ReactDOM               from 'react-dom';
import electron               from 'electron';
import R, {EVENT}             from 'Resource';
import ImageCutter            from 'Components/image-cutter';
import {ThemeProvider}        from 'Theme';
import lang                   from 'Lang';
import Events                 from '../../event-center';

document.title = lang.chat.captureScreen;
const sourceImageFile = decodeURIComponent(window.location.hash.substring(1));

const onFinishCutImage = (image) => {
    Events.sendToMainWindow(EVENT.capture_screen, image);
};

let appElement = document.getElementById('appContainer');
ReactDOM.render(<ThemeProvider>
  <ImageCutter 
    onFinish={onFinishCutImage} 
    sourceImage={sourceImageFile} />
</ThemeProvider>, appElement);

let loadingElement = document.getElementById('loading');
loadingElement.parentNode.removeChild(loadingElement);

