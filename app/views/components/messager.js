import React                    from 'react';
import ReactDOM                 from 'react-dom';
import PureRenderMixin          from 'react-addons-pure-render-mixin';
import ClickAwayable            from 'react-clickaway';
import Colors                   from 'Utils/material-colors';
import ColorManipulator         from 'Utils/color-helper';
import CloseIcon                from 'material-ui/svg-icons/navigation/close';
import Spinner                  from './spinner';
import Theme, {ThemeProvider}   from '../../theme';

const STAGE = {
    init: 0,
    show: 1,
    hide: 2,
    hidden: 3
};

/**
 * React component: Messager
 */
const Messager = React.createClass({
    mixins: [PureRenderMixin, ClickAwayable],

    getInitialState() {
        return {
            stage: STAGE.init
        };
    },

    getDefaultProps() {
        return {
            color: Colors.darkBlack,
            closeButton: true,
            autoHide: 6000,
            clickAway: false,
            animated: true,
            placement: 'top', // 'top', 'bottom', 'center'
            float: 'center' // 'center', 'left', 'right'
        };
    },

    componentClickAway() {
        if(this.props.clickAway) this.hide();
    },

    hide() {
        this.setState({stage: STAGE.hide});

        clearTimeout(this.setStateTimeout);
        this.props.onHide && this.props.onHide(this);
        this.setStateTimeout = setTimeout(() => {
            this.setState({stage: STAGE.hidden});
            this.props.afterHide && this.props.afterHide(this);
        }, 320);
    },

    init() {
        this.setState({stage: STAGE.init});
    },

    isShow() {
        return this.state.stage >= STAGE.show && this.state.stage < STAGE.hide;
    },

    show() {
        clearTimeout(this.setStateTimeout);
        this.setStateTimeout = setTimeout(() => {
            this.setState({stage: STAGE.show}, () => {
                if(this.props.autoHide) {
                    setTimeout(() => {this.hide();}, this.props.autoHide);
                }
                return this.props.afterShow && this.props.afterShow(this);
            })
        }, 10);

        this.props.onShow && this.props.onShow(this);
    },

    update(content) {
        this.setState({content});
    },

    componentDidMount() {
        this.show();
    },

    componentDidUpdate() {
        if(this.state.stage === STAGE.init) {
            this.show();
        }
    },
    
    render() {
        const STYLE = {
            wrapper: {
                position: 'fixed',
                zIndex: 1000,
                left: 0,
                right: 0,
                overflow: 'visible',
            },
            wrapperPlacement: {
                top: {
                    top: 10
                },
                center: {
                    top: '40%'
                },
                bottom: {
                    bottom: 10
                }
            },
            messager: {
                flexGrow: 0,
                boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.239216) 0px 1px 4px',
                transform: 'scale(.5)',
                position: 'relative',
                opacity: 0,
                color: Theme.color.alternateText,
                visibility: 'hidden',
                padding: '10px 20px',
                borderRadius: 2
            },
            messagerWithCloseButton: {
                paddingRight: 50,
            },
            closeButton: {
                cursor: 'pointer',
                position: 'absolute',
                right: 0,
                top: 0,
                padding: 10,
                width: 20,
                height: 20,
                textAlign: 'center',
            },
            content: {
                fontSize: '14px',
                lineHeight: '20px'
            },
            messagerFloat: {
                left: {
                    float: 'left',
                    marginLeft: 10
                },
                right: {
                    float: 'right',
                    marginRight: 10
                },
                center: {
                    marginLeft: 'auto',
                    marginRight: 'auto'
                }
            },
            stage: {
                show: {
                    transition: Theme.transition.normal('visibility', 'left', 'top', 'opacity', 'transform'),
                    opacity: 1,
                    visibility: 'visible',
                    transform: 'scale(1)',
                    top: 0,
                    left: 0,
                },
                hide: {
                    transition: Theme.transition.normal('visibility', 'left', 'top', 'opacity', 'transform'),
                    transform: 'scale(0.8)',
                    opacity: 0,
                    visibility: 'visible',
                },
                hidden: {
                    display: 'none'
                }
            }
        };

        let {
            placement,
            float,
            children,
            content,
            style,
            wrapperStyle,
            color,
            clickAway,
            ...other
        } = this.props;

        wrapperStyle = Object.assign({display: float === 'center' ? 'flex' : 'block'}, STYLE.wrapper, STYLE.wrapperPlacement[placement], wrapperStyle);
        style = Object.assign({backgroundColor: color}, STYLE.messager, STYLE.messagerFloat[float], style);

        if(this.props.closeButton) Object.assign(style, STYLE.messagerWithCloseButton);

        let animateOffset = {
            left: float === 'left' ? -80 : float === 'right' ? 80 : 0,
            top: placement === 'bottom' ? 40 : -40
        }

        if(this.state.stage === STAGE.init) {
            Object.assign(style, animateOffset);
        } else if(this.state.stage === STAGE.show) {
            Object.assign(style, STYLE.stage.show);
        } else if(this.state.stage >= STAGE.hide) {
            Object.assign(style, STYLE.stage.hide, animateOffset);
            if(this.state.stage === STAGE.hidden) {
                Object.assign(style, STYLE.stage.hidden);
            }
        }

        return <ThemeProvider>
            <div {...other} style={wrapperStyle}>
            <div ref={(e) => this.messager = e} style={style}>
                <div>{this.state.content || content}</div>
                <div>{children}</div>
                {this.props.closeButton ? <CloseIcon onClick={this.hide} color={ColorManipulator.fade(Theme.color.alternateText, 0.5)} hoverColor={Theme.color.alternateText} style={STYLE.closeButton} /> : null}
            </div>
            </div>
        </ThemeProvider>
    }
});

Messager.global = {};

/**
 * Show global messager
 * @param  {Object} options
 * @return {Void}
 */
Messager.show = function(options) {
    options = Object.assign({id: 'globalMessager'}, options);
    let contextDocument = options.contextDocument || document;
    let messager = Messager.global[options.id];
    if(messager) {
        setTimeout(() => {
            messager.show(options);
        }, 10);
        return;
    }

    let containerId = options.id + 'Container';
    let container = contextDocument.getElementById(containerId);
    if(!container) {
        container = contextDocument.createElement('div');
        container.id = containerId;
        contextDocument.body.appendChild(container);
        container = contextDocument.getElementById(containerId);
    }

    let afterShow = messager => {
        Messager.global[messager.props.id] = messager;
    };

    let afterHide = messager => {
        options.afterHide && options.afterHide(messager);
        let removeAfterHide = messager.props.removeAfterHide;
        if(removeAfterHide !== false) {
            let containerElement = document.getElementById(messager.props.id + 'Container');
            ReactDOM.unmountComponentAtNode(containerElement);
            containerElement.parentNode.removeChild(containerElement);
            delete Messager.global[messager.props.id];
        }
    };

    ReactDOM.render(<Messager {...options} afterShow={afterShow} afterHide={afterHide} />, container);
};

Messager.update = function(content, id = 'globalMessager') {
    let messager = Messager.global[id];
    if(messager) {
        messager.update(content);
    }
};


/**
 * Hide global messager
 * @param  {String}  id
 * @return {Void}
 */
Messager.hide = function(id = 'globalMessager') {
    let messager = Messager.global[id];
    if(messager) {
        messager.hide();
    }
};

/**
 * Check the messager is show or hidden
 * @param  {String}  id
 * @return {Boolean}
 */
Messager.isShow = function(id = 'globalMessager') {
    let messager = Messager.global[id];
    if(messager) return messager.isShow(); 
    return false;
};

/**
 * Toggle messager
 * @param  {Object} options
 * @return {Void}
 */
Messager.toggle = function(options) {
    options = Object.assign({id: 'globalMessager'}, options);
    if(Messager.isShow(options.id)) {
        Messager.hide(options.id);
    } else {
        Messager.show(options);
    }
};

export default Messager;
