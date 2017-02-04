import React, {
    Component,
    PropTypes
}                             from 'react';
import ReactDOM               from 'react-dom';
import PureRenderMixin        from 'react-addons-pure-render-mixin';
import ColorManipulator       from 'Utils/color-helper';
import Colors                 from 'Utils/material-colors';
import CloseIcon              from 'material-ui/svg-icons/navigation/close';
import Paper                  from 'material-ui/Paper';
import FlatButton             from 'material-ui/FlatButton';
import EventListener          from 'react-event-listener';
import Lang                   from '../../lang';
import Theme, {ThemeProvider} from '../../theme';
import Spinner                from './spinner';

const STAGE = {
    init: 0,
    show: 1,
    hide: 2,
    hidden: 3
};

class Modal extends Component {

    state = {
        stage: STAGE.init,
        content: null
    };

    static propTypes = {
        afterShow: PropTypes.func,
        afterHide: PropTypes.func,
        onShow: PropTypes.func,
        onHide: PropTypes.func,
        onSubmit: PropTypes.func,
        onCancel: PropTypes.func,
        onClick: PropTypes.func,
        getLazyContent: PropTypes.func,
        modal: PropTypes.bool.isRequired,
        closeButton: PropTypes.bool.isRequired,
        header: PropTypes.any,
        footer: PropTypes.any,
        animated: PropTypes.bool,
        actions: PropTypes.any,
        removeAfterHide: PropTypes.any
    };

    static defaultProps = {
        closeButton: true,
        animated: true,
        modal: false,
        actions: [
            {type: 'cancel'},
            {type: 'submit'},
        ]
    };

    _resetContentSize() {
        if(this.modalContent) {
            let maxHeight = window.innerHeight;
            if(this.modalHeader) maxHeight -= this.modalHeader.offsetHeight;
            if(this.modalFooter) maxHeight -= this.modalFooter.offsetHeight;
            this.modalContent.style.maxHeight = maxHeight + 'px';
        }
    }

    _handleWindowKeyUp(e) {
        if (e.keyCode === 27 && !this.props.modal) { // ESC key code: 27
            this.hide();
        }
    }

    hide() {
        this.setState({stage: STAGE.hide});

        this.props.onHide && this.props.onHide(this);
        clearTimeout(this.setStateTimeout);
        this.setStateTimeout = setTimeout(() => {
            this.setState({stage: STAGE.hidden});
            this.props.afterHide && this.props.afterHide(this);
        }, 320);
    }

    init() {
        this.setState({stage: STAGE.init});
        this.content = null;
    }

    isShow() {
        return this.state.stage >= STAGE.show && this.state.stage < STAGE.hide;
    }

    show() {
        clearTimeout(this.setStateTimeout);
        this.setStateTimeout = setTimeout(() => {
            this.setState({stage: STAGE.show}, () => {
                if(this.props.getLazyContent) {
                    setTimeout(() => {
                        this.setState({content: this.props.getLazyContent()});
                    }, 320);
                }
                return this.props.afterShow && this.props.afterShow(this);
            })
        }, 10);

        this.props.onShow && this.props.onShow(this);
    }

    _handleClickCover() {
        if(!this.props.modal) this.hide();
    }

    componentDidMount() {
        this.show();
        this._resetContentSize();
    }

    componentDidUpdate() {
        if(this.state.stage === STAGE.init) {
            this.show();
        }
        this._resetContentSize();
    }

    _handleActionButtonClick(type, click) {
        let cacelHide = false;
        if(type === 'submit' && this.props.onSubmit) {
            cacelHide = this.props.onSubmit(this) === false;
        }
        if(type === 'cancel' && this.props.onCancel) {
            cacelHide = this.props.onCancel(this) === false;
        }
        if(!cacelHide && (type === 'submit' || type === 'cancel')) {
            this.hide();
        }
        return click && click(this);
    }
    
    render() {
        const STYLE = {
            cover: {
                position: 'fixed',
                zIndex: 1000,
                overflow: 'hidden',
                backgroundColor: 'rgba(0,0,0,0.54)',
                opacity: 0,
                visibility: 'hidden',
                transition: Theme.transition.normal('visibility', 'opacity'),
            },
            modal: {
                transform: 'scale(.9) translate(0, -100px)',
                position: 'relative',
                opacity: 0,
                visibility: 'hidden',
                borderRadius: 2,
                zIndex: 1010,
                maxWidth: '100%',
                maxHeight: '100%',
                top: 0,
            },
            closeButton: {
                cursor: 'pointer',
                position: 'absolute',
                right: 0,
                top: 0,
                padding: 15,
                width: 20,
                height: 20,
                textAlign: 'center',
                zIndex: 1011,
            },
            header: {
                fontWeight: 400,
                lineHeight: '36px',
                padding: '8px 60px 8px 20px',
                fontSize: '16px'
            },
            footer: {
                lineHeight: '36px',
                padding: 8,
            },
            actions: {
                textAlign: 'right',
            },
            content: {
                fontSize: '14px',
                lineHeight: '20px',
                padding: '10px 20px',
                overflowX: 'hidden',
                overflowY: 'auto',
                boxSizing: 'border-box'
            },
            coverStage: {
                show: {
                    opacity: 1,
                    visibility: 'visible',
                },
                hide: {
                    opacity: 0,
                    visibility: 'hidden',
                }
            },
            stage: {
                show: {
                    transition: Theme.transition.normal('visibility', 'top', 'opacity', 'transform'),
                    opacity: 1,
                    visibility: 'visible',
                    transform: 'scale(1) translate(0, 0)'
                },
                hide: {
                    transition: Theme.transition.normal('visibility', 'top', 'opacity', 'transform'),
                    transform: 'scale(.9) translate(0, -100px)',
                    opacity: 0,
                    visibility: 'visible'
                }
            }
        };

        let {
            children,
            content,
            style,
            header,
            footer,
            modal,
            width,
            closeButton,
            actions,
            ...other
        } = this.props;

        content = this.state.content || content;

        let buttons = null;
        if(actions) {
            let buttonsIndex = 0;
            buttons = actions.map(action => {
                if(action.label === undefined) {
                    action.label = action.type === 'submit' ? Lang.common.confirm : action.type === 'cancel' ? Lang.common.cancel : 'SUBMIT';
                }
                action.primary = action.type === 'primary';
                action.secondary = action.type === 'submit' || action.type === 'secondary';
                action.onClick = this._handleActionButtonClick.bind(this, action.type, action.click);
                action.key = buttonsIndex++;
                return <FlatButton {...action} />
            });
        }

        style = Object.assign({width: width || 'auto'}, STYLE.modal, style);
        let coverStyle = Object.assign({}, STYLE.cover);

        if(this.state.stage === STAGE.show) {
            Object.assign(style, STYLE.stage.show);
            Object.assign(coverStyle, STYLE.coverStage.show);
        } else if(this.state.stage >= STAGE.hide) {
            Object.assign(style, STYLE.stage.hide);
            Object.assign(coverStyle, STYLE.coverStage.hide);
        }

        this.modalHeader = null;
        this.modalFooter = null;

        return <ThemeProvider>
          <div {...other} style={this.state.stage >= STAGE.hidden ? {display: 'none'} : STYLE.wrapper} className='fix-full center-block'>
              <div className='fix-full' style={coverStyle} onClick={this._handleClickCover.bind(this)}></div>
              <Paper ref={(e) => this.modal = e} style={style} zDepth={4}>
                {closeButton ? <CloseIcon onClick={this.hide.bind(this)} color={ColorManipulator.fade(Theme.color.icon, 0.5)} hoverColor={Theme.color.icon} style={STYLE.closeButton} /> : null}
                {header !== undefined ? <header ref={e => this.modalHeader = e} style={STYLE.header}>{header}</header> : null}
                <div style={STYLE.content} ref={e => this.modalContent = e}>
                  {typeof(content) === 'function' ? content() : content || <Spinner />}
                  {children ? <div>{children}</div> : null}
                </div>
                {footer !== undefined || buttons ? <footer ref={e => this.modalFooter = e} style={STYLE.footer}>{footer}<div style={STYLE.actions}>{buttons}</div></footer> : null}
              </Paper>
              <EventListener
                target='window'
                onResize={this._resetContentSize.bind(this)}
                onKeyup={this._handleWindowKeyUp.bind(this)}
              />
            </div>
        </ThemeProvider>
    }
}

Modal.global = {};

/**
 * Show global modal
 * @param  {Object} options
 * @return {Void}
 */
Modal.show = function(options) {
    options = Object.assign({id: 'globalModal', removeAfterHide: 'auto'}, options);
    let modal = Modal.global[options.id];
    if(modal) {
        setTimeout(() => {
            modal.show(options);
        }, 10);
        return;
    }

    let containerId = options.id + 'Container';
    let container = document.getElementById(containerId);
    if(!container) {
        container = document.createElement('div');
        container.id = containerId;
        document.body.appendChild(container);
        container = document.getElementById(containerId);
    }

    let afterShow = modal => {
        Modal.global[modal.props.id] = modal;
    };

    let afterHide = modal => {
        options.afterHide && options.afterHide(modal);
        let removeAfterHide = modal.props.removeAfterHide;
        if(removeAfterHide === true || (removeAfterHide === 'auto' && modal.props.id === 'globalModal')) {
            let containerElement = document.getElementById(modal.props.id + 'Container');
            ReactDOM.unmountComponentAtNode(containerElement);
            containerElement.parentNode.removeChild(containerElement);
            delete Modal.global[modal.props.id];
        }
    };

    ReactDOM.render(<Modal {...options} afterHide={afterHide} afterShow={afterShow} />, container);
};

/**
 * Hide global modal
 * @param  {String}  id
 * @return {Void}
 */
Modal.hide = function(id = 'globalModal') {
    let modal = Modal.global[id];
    if(modal) modal.hide(); 
};

/**
 * Check the modal is show or hidden
 * @param  {String}  id
 * @return {Boolean}
 */
Modal.isShow = function(id = 'globalModal') {
    let modal = Modal.global[id];
    if(modal) return modal.isShow(); 
    return false;
};

/**
 * Toggle modal
 * @param  {Object} options
 * @return {Void}
 */
Modal.toggle = function(options) {
    options = Object.assign({id: 'globalModal'}, options);
    if(Modal.isShow(options.id)) {
        Modal.hide(options.id);
    } else {
        Modal.show(options);
    }
};

Modal.open = Modal.show;
Modal.dismiss = Modal.close = Modal.hide;

export default Modal;
