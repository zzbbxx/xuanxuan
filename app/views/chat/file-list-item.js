import React               from 'react';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import Theme               from '../../theme';
import FileIcon            from '../icons/file-outline';
import ByteSizeSpan        from '../components/byte-size-span';
import ImageIcon           from 'material-ui/svg-icons/image/photo';
import UploadIcon          from 'material-ui/svg-icons/file/cloud-upload';
import DownloadIcon        from 'material-ui/svg-icons/file/file-download';
import SaveIcon            from 'material-ui/svg-icons/file/cloud-download';
import OpenIcon            from 'material-ui/svg-icons/action/open-in-browser';
import FolderIcon          from 'material-ui/svg-icons/file/folder-open';
import ColorManipulator    from 'Utils/color-helper';
import CircularProgress    from 'material-ui/CircularProgress';
import Avatar              from 'material-ui/Avatar';
import IconButton          from 'material-ui/IconButton';
import RefreshIcon         from 'material-ui/svg-icons/navigation/refresh';
import DeleteIcon          from 'material-ui/svg-icons/action/delete';
import {App, Lang, Config} from '../../app';
import Messager            from '../components/messager';
import R                   from '../../resource';
import UserAvatar          from '../user-avatar';
import Moment              from 'moment';
import {shell as Shell}    from 'electron';

const Helper = global.Helper;

const FileListItem = React.createClass({
    // mixins: [PureRenderMixin],
    
    getInitialState() {
        return {
            fileState: null, // null(need check), upload, download, ok, ready, fail, failForResend
        }
    },

    _checkFileState(file) {
        if(!file) file = this.props.file;
        if(!file && this.props.message) file = this.props.message.fileContent;
        let iAmSender = file.user === App.user.id;
        let fileState = this.state.fileState;

        if(!file.id) {
            if(file.send === false || ((new Date().getTime() - file.date) > 10000)) { // fail
                let filePath = this.filePath;
                if(!filePath && file.attachFile) {
                    filePath = file.attachFile.path;
                    this.filePath = filePath;
                }
                if(filePath && Helper.isFileExist(filePath) && this.props.message) {
                    fileState = 'failForResend';
                } else {
                    fileState = 'fail';
                }
            } else if(iAmSender) {
                fileState = 'upload';
            }
        } else if(fileState !== 'download') {
            let filePath = this.filePath;
            if(!filePath && file.attachFile) {
                filePath = file.attachFile.path;
                this.filePath = filePath;
            }
            if(filePath && Helper.isFileExist(filePath)) {
                fileState = 'ready';
            } else {
                fileState = 'ok';
            }
        }
        this.setState({fileState});
    },

    componentWillReceiveProps(nextProps) {
        this._checkFileState(nextProps.file);
    },

    componentDidMount() {
        this._checkFileState();
    },

    _handOnDownloadBtnClick() {
        let fileState = this.state.fileState;
        if(fileState !== 'download') {
            let file = this.props.file;
            if(!file && this.props.message) file = this.props.message.fileContent;
            file = Object.assign({}, file);
            App.showSaveDialog({
                fileName: file.name
            }, filePath => {
                if(!filePath) return;
                this.filePath = filePath;
                this.fileReceived = 0;
                file.path = filePath;
                this.setState({fileState: 'download'});

                App.downloadFile(file, (state) => {
                    this.fileReceived = state.received;
                    this.setState({fileState: 'download'});
                }).then(() => {
                    this.setState({fileState: 'ready'});
                    Messager.show({clickAway: true, autoHide: false, content: Lang.chat.fileSaveAs.format(filePath), color: Theme.color.positive});
                }).catch(err => {
                    this.setState({fileState: 'ok'});
                    Messager.show({clickAway: true, autoHide: false, content: Lang.chat.cannotSaveAs.format(filePath), color: Theme.color.negative});
                    if(DEBUG) console.error('_handOnDownloadBtnClick', err);
                });
            });
        }
    },

    _handOnOpenFolderBtnClick() {
        if(this.state.fileState === 'ready' && this.filePath) {
            Shell.showItemInFolder(this.filePath);
        }
    },

    _handOnOpenFileBtnClick() {
        if(this.state.fileState === 'ready' && this.filePath) {
            Shell.openItem(this.filePath);
        }
    },

    _handOnResendFileBtnClick() {
        if(this.state.fileState === 'failForResend') {
            this.setState({fileState: 'upload'});
            App.chat.uploadMessageFile(this.props.message, null, err => {
                if(err && err.code) {
                    Messager.show({clickAway: true, autoHide: false, content: Lang.errors[err.code], color: Theme.color.negative});
                }
            });
        }
    },

    _handOnDeleteFileBtnClick() {

    },

    render() {
        const STYLE = {
            main: {
                display: 'table',
                fontSize: '13px'
            },
            iconWrapper: {
                display: 'table-cell',
                verticalAlign: 'top',
                width: 40,
            },
            content: {
                display: 'table-cell',
                verticalAlign: 'top',
                padding: '0 8px',
                lineHeight: '20px'
            },
            actions: {
                display: 'table-cell',
                verticalAlign: 'top',
                textAlign: 'right',
                whiteSpace: 'nowrap'
            },
            filename: {
                fontWeight: '500',
            },
            filesize: {
                fontSize: '12px',
                color: Theme.color.disabled
            },
            progressWrapper: {
                position: 'relative',
            },
            progressIcon: {
                position: 'absolute',
                left: 8,
                top: 4,
                color: Theme.color.icon,
                fill: Theme.color.icon,
            },
            tooltip: {
                fontSize: '12px',
                zIndex: 100,
                pointerEvents: 'none'
            }
        };

        let {
            style,
            icon,
            file,
            showUser,
            showTime,
            message,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);
        if(!file && message) file = this.props.message.fileContent;

        if(icon === undefined) {
            if(file.type && file.type.startsWith('image')) {
                icon = <Avatar style={{display: 'block'}} color={Theme.color.file.image} backgroundColor={ColorManipulator.fade(Theme.color.file.image, 0.15)} icon={<ImageIcon />}/>
            } else {
                icon = <Avatar style={{display: 'block'}} color={Theme.color.file.default} backgroundColor={ColorManipulator.fade(Theme.color.file.default, 0.15)} icon={<FileIcon />}/>
            }
        }

        let actions = [], tip;
        let fileState = this.state.fileState;

        if(fileState === 'ready') {
            actions.push(
                <IconButton tooltipStyles={STYLE.tooltip} tooltip={Lang.common.open} key='openFileBtn' style={{padding: 8, width: 40, height: 40}} onClick={this._handOnOpenFileBtnClick} ><OpenIcon color={Theme.color.primary1} /></IconButton>
            );
            actions.push(
                <IconButton tooltipStyles={STYLE.tooltip} tooltip={Lang.common.openFolder} key='openFolderBtn' style={{padding: 8, width: 40, height: 40}} onClick={this._handOnOpenFolderBtnClick} ><FolderIcon color={Theme.color.primary1} /></IconButton>
            );
        } else if(fileState === 'download') {
            let tipStyle = {
                fontSize: '12px',
                color: Theme.color.primary1
            };
            tip = <span style={tipStyle}>{Lang.chat.downloadingFile} &nbsp; </span>;
            let fileReceived = this.fileReceived;
            let fileReceivedPercent = Math.round(100*fileReceived/file.size);
            let progressTextStyle = {
                position: 'absolute',
                left: 7,
                top: 0,
                width: 40,
                height: 40,
                lineHeight: '40px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: Theme.color.icon,
                fontSize: '15px'
            };
            let progressStyle = {zoom: 0.68, margin: '4px', display: 'block'};
            actions.push(
                <div key='progressWrapper' style={STYLE.progressWrapper}>
                  <CircularProgress color={Theme.color.icon} style={progressStyle} mode={fileReceived ? 'determinate' : 'indeterminate'} max={file.size} value={fileReceived ? fileReceived : 0}/>
                  {fileReceived ? <span style={progressTextStyle}>{fileReceivedPercent}%</span> : <DownloadIcon style={STYLE.progressIcon}/>}
                </div>
            );
        } else if(fileState === 'upload') {
            let tipStyle = {
                fontSize: '12px',
                color: Theme.color.primary1
            };
            tip = <span style={tipStyle}>{Lang.chat.uploadingFile} &nbsp; </span>;
            let isInProgress = typeof(file.send) === 'number' && file.send > 0;
            let progressTextStyle = {
                position: 'absolute',
                left: 7,
                top: 0,
                width: 40,
                height: 40,
                lineHeight: '40px',
                textAlign: 'center',
                fontWeight: 'bold',
                color: Theme.color.icon,
                fontSize: '15px'
            };
            let progressStyle = {zoom: 0.68, margin: '4px', display: 'block'};
            let fileSendPercent = Math.round(100*file.send/file.size);
            actions.push(
                <div key='progressWrapper' style={STYLE.progressWrapper}>
                  <CircularProgress color={Theme.color.icon} style={progressStyle} mode={isInProgress ? 'determinate' : 'indeterminate'} max={file.size} value={isInProgress ? file.send : 0}/>
                  {isInProgress ? <span style={progressTextStyle}>{fileSendPercent}%</span> : <UploadIcon style={STYLE.progressIcon}/>}
                </div>
            );
        } else if(fileState === 'fail') {
            let tipStyle = {
                fontSize: '12px',
                color: Theme.color.negative
            };
            tip = <span style={tipStyle}>{Lang.chat.uploadFail} &nbsp; </span>;
            // actions.push(
            //     <DeleteIcon tooltip={Lang.common.delete} key='deleteFileBtn' style={{padding: 8, width: 40, height: 40}} onClick={this._handOnDeleteFileBtnClick} ><OpenIcon color={Theme.color.primary1} /></DeleteIcon>
            // );
        } else if(fileState === 'failForResend') {
            let tipStyle = {
                fontSize: '12px',
                color: Theme.color.negative
            };
            tip = <span style={tipStyle}>{Lang.chat.uploadFailAndResend} &nbsp; </span>;
            actions.push(
                <IconButton tooltipStyles={STYLE.tooltip} tooltip={Lang.chat.resend} key='resendFileBtn' style={{padding: 8, width: 40, height: 40}} onClick={this._handOnResendFileBtnClick} ><RefreshIcon color={Theme.color.primary1} /></IconButton>
            );
            // actions.push(
            //     <IconButton tooltipStyles={STYLE.tooltip} tooltip={Lang.common.delete} key='deleteFileBtn' style={{padding: 8, width: 40, height: 40}} onClick={this._handOnDeleteFileBtnClick} ><DeleteIcon color={Theme.color.primary1} /></IconButton>
            // );
        } else if(fileState === 'ok') {
            actions.push(
                <IconButton tooltipStyles={STYLE.tooltip} tooltip={Lang.common.download} key='downloadBtn' style={{padding: 8, width: 40, height: 40}} onClick={this._handOnDownloadBtnClick} ><DownloadIcon color={Theme.color.primary1} /></IconButton>
            );
        }

        let userContent = null;
        if(showUser && (file.user || file.sender)) {
            if(!file.sender) {
                file.sender = App.dao.getMember(file.user);
            }
            let userStyle = {
                fontSize: '12px',
                display: 'inline-block',
                marginRight: 8,
            };
            userContent = <span style={userStyle}><UserAvatar size={16} user={file.sender}/> {file.sender.displayName}</span>
        }

        let timeContent = null;
        if(showTime && file.date) {
            let timeStyle = {
                color: Theme.color.disabled,
                fontSize: '12px',
                display: 'inline-block',
                marginRight: 8,
                marginLeft: 8,
            };
            timeContent = <small style={timeStyle}>{Moment(file.date).fromNow()}</small>
        }

        return <div {...other} style={style}>
            <div style={STYLE.iconWrapper}>{icon}</div>
            <div style={STYLE.content} className='user-selectable'>
              <div style={STYLE.filename} className='text-ellipsis'>{file.name}</div>
              {tip}{userContent}<small style={STYLE.filesize}><ByteSizeSpan size={file.size} /></small>{timeContent}
            </div>
            <div style={STYLE.actions}>{actions}</div>
        </div>
    }
});

export default FileListItem;
