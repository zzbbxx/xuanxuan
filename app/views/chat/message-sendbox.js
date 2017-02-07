import {clipboard}         from 'electron';
import React               from 'react';
import Theme               from '../../theme';
import {App, Lang, Config} from '../../app';
import MessageListItem     from './message-list-item';
import MessageListDivider  from './message-list-divider';
import MessageTip          from './message-tip';
import EmoticonIcon        from 'material-ui/svg-icons/editor/insert-emoticon';
import SendIcon            from 'material-ui/svg-icons/content/send';
import CutIcon             from 'material-ui/svg-icons/content/content-cut';
import HelpIcon            from 'material-ui/svg-icons/communication/live-help';
import IconButton          from 'material-ui/IconButton';
import ColorManipulator    from 'Utils/color-helper';
import Checkbox            from 'material-ui/checkbox';
import FileIcon            from '../icons/file-outline';
import ImageIcon           from '../icons/message-image';
import Moment              from 'moment';
import Hotkey              from '../mixins/hotkey';
import Popover             from '../components/popover';
import Modal               from '../components/modal';
import EmoticonList        from '../components/emoticon-list';
import EditBox             from '../components/editbox';
import UUID                from 'uuid';
import Helper              from 'Helper';
import R                   from 'Resource';
import ShortcutField       from '../components/shortcut-field';

/**
 * React component: MessageSendbox
 */
const MessageSendbox = React.createClass({
    mixins: [Hotkey],

    getInitialState() {
        return {
            expand: true,
            sendButtonDisabled: true
        };
    },

    _handleOnChange(value) {
        if(!value) value = this.editbox.getContent();
        let sendButtonDisabled = Helper.isEmptyString(value) || value.trim() === '';
        if(this.state.sendButtonDisabled !== sendButtonDisabled) this.setState({sendButtonDisabled});
    },

    clearContent() {
        this.editbox.clearContent();
        this.setState({sendButtonDisabled: true})
    },

    focusInputArea() {
        this.editbox.focus();
    },

    _handleSendButtonClick() {
        if(!this.state.sendButtonDisabled) {
            return this.props.onSendButtonClick && this.props.onSendButtonClick(this);
        }
    },

    _handleEmoticonSelect(shortname) {
        Popover.hide('ChatEmojiSelectorPopover');

        if(App.user.config.ui.chat.HDEmoticon) {
            return this.props.onSendButtonClick && this.props.onSendButtonClick(this, shortname);
        } else {
            this.editbox.appendContent(shortname + ' ');
            this._handleOnChange();
            this.editbox.focus();
        }
    },

    _handleEmoticonClick(e) {
        Popover.toggle({
            getLazyContent: () => <EmoticonList onEmojiClick={this._handleEmoticonSelect} />,
            contentId: 'chat-' + this.props.chatId,
            id: 'ChatEmojiSelectorPopover',
            removeAfterHide: true,
            trigger: this.emotionBtn,
            placement: 'top',
            style: {
                width: 406,
                height: 261
            },
            float: 'start',
            footer: <Checkbox onCheck={(e, checked) => {App.user.config.ui.chat.HDEmoticon = checked}} label={Lang.chat.sendHDEmoticon} defaultChecked={App.user.config.ui.chat.HDEmoticon}/>
        });
    },

    onHotkeyPress(e) {
        if(!e || App.chat.activeChatWindow !== this.props.chatId) return;
        if(e.keyCode === 13) {
            if(e.shiftKey || e.altKey) {
                this.editbox.appendContent('\n');
                this._handleOnChange();
                this.editbox.focus();
            } else {
                if(!this.state.sendButtonDisabled) this._handleSendButtonClick();
                e.preventDefault();
                return false;
            }
        }
    },

    _handleSelectImageFile(e) {
        this.appendImages(e.target.files);
    },

    _handleOnPaste(e) {
        if(!e || App.chat.activeChatWindow !== this.props.chatId) return;
        let imageFile = clipboard.readImage();
        let imageFileSize = imageFile.getSize();
        if(imageFileSize && imageFileSize.width * imageFileSize.height > 0) {
            let filename = UUID.v4() + '.png';
            let filePath = App.user.makeFilePath(filename);
            Helper.saveImage(imageFile, filePath).then(image => {
                image.width = imageFileSize.width;
                image.height = imageFileSize.height;
                image.filename = filename;
                image.name = filename;
                image.type = 'image/png';
                this.appendImages(image);
            });
            e.preventDefault();
        }
    },

    appendImages(images) {
        if(images instanceof FileList) {
            let files = images;
            images = [];
            for(let i = 0; i < files.length; ++i) {
                images.push(files[i]);
            }
        }
        if(!Array.isArray(images)) {
            images = [images];
        }
        images.forEach(image => {
            this.editbox.appendImage(image);
        });
        this.editbox.focus();
    },

    _handleSelectFile(e) {
        let file = e.target.files[0];
        return file && this.props.onSelectFile && this.props.onSelectFile(file);
    },

    _handleCaptureScreen(e) {
        App.openCaptureScreen('all').then(image => {
            this.editbox.appendImage(image);
            this.editbox.focus();
        });
    },

    _openCaptureScreenContextMenu(e) {
        App.popupContextMenu(App.createContextMenu([
        {
            label: Lang.chat.captureScreen,
            click: this._handleCaptureScreen
        }, {
            label: Lang.chat.hideCurrentWindowAndCaptureScreen,
            click: () => {
                App.openCaptureScreen('all', true).then(image => {
                    this.editbox.appendImage(image);
                    this.editbox.focus();
                });
            }
        }, {
            type: 'separator'
        }, {
            label: Lang.chat.setCaptureScreenShotcut,
            click: () => {
                let shortcut = null;
                let defaultShortcut = App.user.config.shortcut.captureScreen || 'Ctrl+Alt+Z';
                Modal.show({
                    modal: true,
                    header: Lang.chat.setCaptureScreenShotcut,
                    content: <ShortcutField fullWidth={true} hintText={defaultShortcut} checkGlobal={true} focus={true} onChange={newShortcut => {
                        shortcut = newShortcut;
                    }}/>,
                    width: 360,
                    actions: [{type: 'cancel'}, {type: 'submit', label: Lang.common.confirm}],
                    onSubmit: () => {
                        if(Helper.isNotEmptyString(shortcut) && App.user.config.shortcut.captureScreen !== shortcut) {
                            App.user.config.shortcut.captureScreen = shortcut;
                            App.saveUser();
                            App.chat.registerGlobalHotKey();
                            this.forceUpdate();
                        }
                    }
                });
            }
        }]), e);
    },

    _handleMessageTip() {
        Popover.toggle({
            getLazyContent: () => <MessageTip />,
            contentId: 'chat-' + this.props.chatId,
            id: 'ChatMessageTipPopover',
            removeAfterHide: false,
            trigger: this.messageTipBtn,
            placement: 'top',
            style: {
                width: 350,
                height: 150
            },
            float: 'center'
        });
    },

    componentDidMount() {
        this._handleCaptureScreenGlobalShortcutEvent = App.on(R.event.capture_screen_global, (image, chat) => {
            if(this.props.chatId === chat.gid) {
                this.editbox.appendImage(image);
                this.editbox.focus();
            }
        });
    },

    componentWillUnmount() {
        App.off(this._handleCaptureScreenGlobalShortcutEvent);
    },

    render() {
        const STYLE = {
            main: {
                backgroundColor: Theme.color.canvas,
                height: App.user.config.ui.chat.sendbox.height,
                zIndex: 10
            },
            editboxWrapper: {
                bottom: 48
            },
            editbox: {
                outline: 'none',
                display: 'block',
                border: 'none',
                resize: 'none',
                boxSizing: 'border-box',
                position: 'absolute'
            },
            editStyle: {
                padding: 10,
            },
            toolbar: {
                height: 48,
                backgroundColor: Theme.color.pale2
            },
            toolbarRight: {
                right: 10
            },
            icon: {
                pointerEvents: 'none'
            },
            fileButtonStyle: {
                cursor: 'pointer',
                position: 'absolute',
                left: 0,
                right: 0,
                bottom: 0,
                top: 0,
                width: '100%',
                opacity: 0,
                pointerEvents: 'auto'
            },
            fileButtonWrapper: {
                display: 'inline-block',
                position: 'relative'
            }
        };

        let {
            content,
            chatId,
            style,
            forNewChat,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);
    
        return <div {...other} style={style}>
            <div className="dock-full" style={STYLE.editboxWrapper}>
              <EditBox onChange={this._handleOnChange} className="dock-full"
                editStyle={STYLE.editStyle}
                placeholderStyle={STYLE.editStyle}
                style={STYLE.editbox} 
                ref={(e) => this.editbox = e}
                onPaste={this._handleOnPaste}
                placeholder={forNewChat ? Lang.chat.sendboxPlaceholderForNewChat : Lang.chat.sendboxPlaceholder}
                defaultValue={content}/>
            </div>

            <div className="dock-bottom" style={STYLE.toolbar}>
              <div style={STYLE.fileButtonWrapper} ref={(e) => this.emotionBtn = e}>
                <IconButton className="hint--top" onClick={this._handleEmoticonClick} data-hint={Lang.chat.sendEmoticon}>
                  <EmoticonIcon color={Theme.color.icon} hoverColor={Theme.color.primary1}/>
                </IconButton>
              </div>
              <div style={STYLE.fileButtonWrapper} className="hint--top" data-hint={Lang.chat.sendImage}>
                <input ref={e => this.selectImageFileBtn = e} style={STYLE.fileButtonStyle} onChange={this._handleSelectImageFile} type="file" accept=".png, .jpg, .jpeg, .gif, .bmp"/>
                <IconButton onClick={() => this.selectImageFileBtn.click()}>
                  <ImageIcon color={Theme.color.icon} hoverColor={Theme.color.primary1}/>
                </IconButton>
              </div>
              <div style={STYLE.fileButtonWrapper} className="hint--top" data-hint={Lang.chat.sendFile}>
                <input ref={e => this.selectFileBtn = e} style={STYLE.fileButtonStyle} onChange={this._handleSelectFile} type="file" />
                <IconButton onClick={() => this.selectFileBtn.click()}>
                    <FileIcon color={Theme.color.icon} hoverColor={Theme.color.primary1}/>
                </IconButton>
              </div>
              <div style={STYLE.fileButtonWrapper} className="hint--top" data-hint={Lang.chat.captureScreen + ' (' + App.user.config.shortcut.captureScreen + ')'}>
                <IconButton onClick={this._handleCaptureScreen} onContextMenu={this._openCaptureScreenContextMenu}>
                    <CutIcon color={Theme.color.icon} hoverColor={Theme.color.primary1}/>
                </IconButton>
              </div>
              <div ref={e => this.messageTipBtn = e} style={STYLE.fileButtonWrapper} className="hint--top" data-hint={Lang.chat.messageTip}>
                <IconButton onClick={this._handleMessageTip}>
                    <HelpIcon color={Theme.color.icon} hoverColor={Theme.color.primary1}/>
                </IconButton>
              </div>
              <div className="dock-right" style={STYLE.toolbarRight}>
                <IconButton disabled={this.state.sendButtonDisabled} className="hint--top-left" onClick={this._handleSendButtonClick} data-hint={Lang.chat.sendMessageTooltip}>
                  <SendIcon color={this.state.sendButtonDisabled ? Theme.color.disabled : Theme.color.primary1} hoverColor={this.state.sendButtonDisabled ? Theme.color.disabled : ColorManipulator.fade(Theme.color.primary1, 0.9)}/>
                </IconButton>
              </div>
            </div>
        </div>
    }
});

export default MessageSendbox;
