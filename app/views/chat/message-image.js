import React               from 'react';
import Path                from 'path';
import Theme               from '../../theme';
import {App, Lang, Config} from '../../app';
import UserAvatar          from '../user-avatar';
import Moment              from 'moment';
import Emojione            from '../components/emojione';
import Messager            from '../components/messager';
import ImageBrokenIcon     from '../icons/image-broken';
import Paper               from 'material-ui/Paper';
import CircularProgress    from 'material-ui/CircularProgress';
import ImageIcon           from 'material-ui/svg-icons/image/photo';
import UploadIcon          from 'material-ui/svg-icons/file/file-upload';
import RefreshIcon         from 'material-ui/svg-icons/navigation/refresh';
import R                   from '../../resource';
import {
    shell,
    clipboard,
    nativeImage
}                          from 'electron';

const Helper = global.Helper;

/**
 * React component: Image message item
 */
const ImageMessage = React.createClass({

    getInitialState() {
        return {
            imageState: null, // check, ok, upload, download, broken, resend
        };
    },

    _handleImageContextMenu(e) {
        let message = this.props.message;
        let image = message.imageContent;
        if(image && this.state.imageState === 'ok') {
            let imagePath = Path.join(App.user.imagesPath, image.name);
            App.popupContextMenu(App.createContextMenu([
            {
                label: Lang.common.preview,
                click: () => {
                    App.openImagePreview(imagePath);
                }
            }, {
                label: Lang.common.open,
                click: () => {
                    shell.openItem(imagePath);
                }
            }, {
                label: Lang.common.savedAs,
                click: () => {
                    App.showSaveDialog({
                        title: Lang.dialog.imageSaveTo,
                        fileName: image.name,
                        sourceFilePath: imagePath,
                        filters: [
                            {name: Lang.dialog.filterImage,    extensions: [Path.extname(image.name).split('.').pop()]},
                            {name: Lang.dialog.filterAllFiles, extensions: ['*']}
                        ]
                    }, filePath => {
                        if(filePath) {
                            Messager.show({clickAway: true, autoHide: false, content: Lang.chat.imageSaveAs.format(filePath), color: Theme.color.positive});
                        } else {
                            if(DEBUG) console.error('SAVE FILE FAILED in', filePath, err);
                            Messager.show({clickAway: true, autoHide: false, content: Lang.chat.cannotSaveAs.format(filePath), color: Theme.color.negative});
                        }
                    });
                }
            }, {
                label: Lang.menu.copyImage,
                click: () => {
                    let image = nativeImage.createFromPath(imagePath);
                    clipboard.writeImage(image);
                }
            }]), e);
        }
    },

    _handleImageDoubleClick() {
        let message = this.props.message;
        let image = message.imageContent;
        if(image && this.state.imageState === 'ok') {
            let imagePath = Path.join(App.user.imagesPath, image.name);
            App.openImagePreview(imagePath);
        }
    },

    _checkImageState(message) {
        if(!message) message = this.props.message;
        let image = message.imageContent;

        if(image.type === 'base64' || image.type === 'emoji') return;
        if(!App.user.dataPath) return;

        let iAmSender = message.user === App.user.id;
        let imageState = this.state.imageState; // the old state
        let imagePath = Path.join(App.user.imagesPath, image.name);
        if(image.id) { // ok, broken, download
            if(image.send === true) {
                if(Helper.isFileExist(imagePath)) {
                    imageState = 'ok';
                } else {
                    imageState = 'download';
                    this.imageReceived = 0;
                    image.path = imagePath;
                    App.downloadFile(image, (state) => {
                        this.imageReceived = state.received;
                        this.setState({imageState: 'download'});
                    }).then(() => {
                        setTimeout(() => {
                            this.setState({imageState: 'ok'});
                        }, 500);
                    }).catch(err => {
                        this.setState({imageState: 'broken'});
                    });
                }
            } else {
                imageState = 'broken';
            }
        } else { // upload, resend, broken
            if(image.send === false || message.isOutdated) {
                if(iAmSender) {
                    if(Helper.isFileExist(imagePath)) {
                        imageState = 'resend';
                    } else {
                        imageState = 'broken';
                    }
                } else {
                    imageState = 'broken';
                }
            } else {
                imageState = 'upload';
            }
        }
        this.setState({imageState});
    },

    componentWillReceiveProps(nextProps) {
        this._checkImageState(nextProps.message);
    },

    componentDidMount() {
        this._checkImageState();
    },

    _handleResendBtnClick() {
        App.chat.uploadMessageImage(this.props.message, null, err => {
            if(err && err.code) {
                Messager.show({clickAway: true, autoHide: false, content: Lang.errors[err.code], color: Theme.color.negative});
            }
        });
    },

    render() {
        let {
            message,
            style,
            ...other
        } = this.props;

        let image = message.imageContent;
        
        if(image.type === 'base64') {
            return <img src={image.content} />;
        } else if(image.type === 'emoji') {
            return <div className="emojione-hd" dangerouslySetInnerHTML={{__html: Emojione.toImage(image.content)}}/>;
        } else if(App.user.dataPath) {
            let imagePath = Path.join(App.user.imagesPath, image.name).replace(/\\/g, '/');
            let imageState = this.state.imageState;

            if(imageState === 'ok') {
                return <img onDoubleClick={this._handleImageDoubleClick} onContextMenu={this._handleImageContextMenu} style={{margin: '4px 0 8px'}} src={'file://' + imagePath + '?v=' + Helper.guid}/>;
            } else if(imageState === 'upload') {
                let wrapperStyle = {
                    display: 'inline-block',
                    position: 'relative',
                    padding: 10,
                    backgroundColor: Theme.color.pale3,
                    backgroundImage: 'url("file://' + imagePath + '")',
                    backgroundRepeat: 'none',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover'
                };
                let progressStyle = {
                    display: 'block',
                };
                let iconStyle = {
                    position: 'absolute',
                    left: 33,
                    top: 33,
                };
                return <div style={wrapperStyle}>
                  <CircularProgress color={Theme.color.icon} mode='indeterminate' style={progressStyle}/>
                  <UploadIcon color={Theme.color.icon} style={iconStyle} />
                </div>;
            } else if(imageState === 'download') {
                let wrapperStyle = {display: 'inline-block',
                    position: 'relative',
                    padding: 10,
                    backgroundColor: Theme.color.pale3
                };
                let progressStyle = {display: 'block', margin: '10px'};
                let progressTextStyle = {
                    position: 'absolute',
                    left: 0,
                    top: 0,
                    width: 90,
                    height: 90,
                    lineHeight: '90px',
                    textAlign: 'center',
                    fontWeight: 'bold',
                    color: Theme.color.icon,
                    fontSize: '15px'
                };
                let imageReceived = this.imageReceived;
                let progressPercent = Math.min(100, Math.round(100*(imageReceived || 0)/image.size));
                if(isNaN(progressPercent)) progressPercent = 0;
                return <div style={wrapperStyle}>
                  <CircularProgress color={Theme.color.icon} max={image.size} value={imageReceived || 0} mode={imageReceived ? 'determinate' : 'indeterminate'} style={progressStyle}/>
                  <div color={Theme.color.icon} style={progressTextStyle}>{progressPercent}%</div>
                </div>;
            } else if(imageState === 'broken') {
                let wrapperStyle = {
                    display: 'inline-block',
                    position: 'relative',
                    padding: 20,
                    backgroundColor: Theme.color.negativePale
                };
                return <div title={Lang.chat.brokenImage} style={wrapperStyle}>
                  <ImageBrokenIcon color={Theme.color.file.image} style={{display: 'block'}} />
                </div>;
            } else if(imageState === 'resend') {
                let wrapperStyle = {
                    width: 80,
                    height: 80,
                };
                let imageStyle = {
                    backgroundColor: Theme.color.pale3,
                    backgroundImage: 'url("file://' + imagePath + '")',
                    backgroundRepeat: 'none',
                    backgroundPosition: 'center',
                    backgroundSize: 'cover',
                    opacity: 1
                }
                let iconStyle = {
                    padding: 28,
                    cursor: 'pointer',
                    backgroundColor: 'rgba(255,255,255,0.8)'
                };
                return <div className='relative' style={wrapperStyle}>
                  <div className='dock-full' style={imageStyle}/>
                  <RefreshIcon title={Lang.chat.resend} onClick={this._handleResendBtnClick} className='dock-full' color={Theme.color.primary1} style={iconStyle} />
                </div>;
            } else {
                return <img style={{margin: '4px 0 8px'}} src={'file://' + imagePath + '?v=' + Helper.guid}/>;
            }
        } else {
            return <ImageBrokenIcon color={Theme.color.file.image} style={{display: 'block'}} />;
        }
    }
});

export default ImageMessage;
