import React, {PropTypes}     from 'react';
import ReactDOM               from 'react-dom';
import PureRenderMixin        from 'react-addons-pure-render-mixin';
import ClickAwayable          from 'react-clickaway';
import ColorManipulator       from 'Utils/color-helper';
import Arrow                  from './arrow';
import Spinner                from './spinner';
import Theme, {ThemeProvider} from '../../theme';

const STYLE = {
    popover: {
        backgroundColor: Theme.color.canvas,
        boxShadow: 'rgba(0, 0, 0, 0.117647) 0px 1px 6px, rgba(0, 0, 0, 0.239216) 0px 1px 4px',
        position: 'fixed',
        zIndex: 1000,
        transform: 'scale(.5)',
        opacity: 0,
        visibility: 'hidden'
    },
    cover: {
        boxShadow: 'none',
    },
    stage: {
        showed: {
            transition: Theme.transition.fast('visibility', 'margin-left', 'margin-top', 'opacity', 'transform'),
            opacity: 1,
            visibility: 'visible',
            transform: 'scale(1)',
            marginTop: 0,
            marginLeft: 0,
        },
        hide: {
            transition: Theme.transition.fast('visibility', 'margin-left', 'margin-top', 'opacity', 'transform'),
            transform: 'scale(.5)',
            opacity: 0,
            visibility: 'hidden'
        }
    },
    header: {
        lineHeight: '20px',
        padding: '5px 10px',
        fontWeight: 'bold',
        backgroundColor: Theme.color.accent2,
        borderBottom: '1px solid ' + Theme.color.border
    },
    footer: {
        lineHeight: '20px',
        padding: '5px 10px',
        backgroundColor: Theme.color.accent2,
        color: Theme.color.disabled,
        borderTop: '1px solid ' + Theme.color.border,
        fontSize: '12px'
    },
    arrow: {
        height: 10,
        width: 20,
        borderColor: ColorManipulator.darken(Theme.color.border, 0.1)
    }
};

const STAGE = {
    init: 0,
    show: 1,
    showed: 2,
    hide: 3
};

const STAGE_NAME = ['init', 'show', 'showed', 'hide'];

const Popover = React.createClass({
    mixins: [PureRenderMixin, ClickAwayable],

    propTypes: {
        removeAfterHide: PropTypes.any,
        trigger: PropTypes.any,
        triggerSize: PropTypes.any,
        triggerEvent: PropTypes.object,
        x: PropTypes.any,
        y: PropTypes.any,
        onHide: PropTypes.func,
        afterHide: PropTypes.func,
        onShow: PropTypes.func,
        animated: PropTypes.bool,
        float: PropTypes.any,
        placement: PropTypes.any,
        clickAway: PropTypes.any,
        arrow: PropTypes.bool
    },

    getInitialState() {
        return {
            stage: STAGE.init
        };
    },

    getDefaultProps() {
        return {
            arrow: true,
            clickAway: true,
            animated: true,
            placement: 'auto', // 'auto', 'top', 'bottom', 'left', 'right'
            float: 'center' // 'center', 'start', 'end'
        };
    },

    componentClickAway() {
        let clickAway = this.props.clickAway;
        if(typeof(clickAway) === 'function') {
            clickAway = clickAway();
        }
        if(clickAway) this.hide();
    },

    hide() {
        clearTimeout(this.setStateTimeout);
        this.setState({stage: STAGE.hide});

        this.props.onHide && this.props.onHide(this);
        this.setStateTimeout = setTimeout(() => {
            this.props.afterHide && this.props.afterHide(this);
        }, 500);
    },

    init(callback) {
        this.setState({stage: STAGE.init}, callback);
    },

    _initPosition(options) {
        if(this.popover) {
            options = Object.assign({}, this.props, options);
            let {x, y, trigger, arrow, triggerSize, triggerEvent, placement, float} = options;
            let width = this.popover.clientWidth;
            let height = this.popover.clientHeight;
            const winWidth = window.innerWidth;
            const winHeight = window.innerHeight;
            const arrowWidth = arrow ? STYLE.arrow.width : 0;
            const arrowHeight = arrow ? STYLE.arrow.height : 0;
            let offset = {}, arrowPos = {}, animateMargin = {marginTop: 0, marginLeft: 0};

            if(triggerEvent) {
                if(!trigger) trigger = triggerEvent.target;
                if(x === undefined) x = triggerEvent.clientX;
                if(y === undefined) y = triggerEvent.clientY;
            }

            if(placement === 'auto') {
                let vSpace = Math.max(y, winHeight - y);
                let hSpace = Math.max(x, winWidth - x);
                if(vSpace >= hSpace) {
                    placement = y > (winHeight - y) ? 'top' : 'bottom';
                } else {
                    placement = x > (winWidth - x) ? 'left' : 'right';
                }
            }

            if(trigger) {
                let offsetLeft =  trigger.offsetLeft, 
                    offsetTop = trigger.offsetTop;
                let parent = trigger.parentNode;
                while(parent && typeof(parent.offsetLeft) === 'number') {
                    offsetLeft += parent.offsetLeft;
                    offsetTop += parent.offsetTop;
                    parent = parent.parentNode;
                }

                if(!triggerSize) {
                    triggerSize = {width: trigger.clientWidth, height: trigger.clientHeight};
                }

                switch(placement) {
                    case 'top':
                        x = offsetLeft + triggerSize.width / 2;
                        y = offsetTop;
                        break;
                    case 'bottom':
                        x = offsetLeft + triggerSize.width / 2;
                        y = offsetTop + triggerSize.height;
                        break;
                    case 'left':
                        x = offsetLeft ;
                        y = offsetTop + triggerSize.height / 2;
                        break;
                    case 'right':
                        x = offsetLeft + triggerSize.width;
                        y = offsetTop + triggerSize.height / 2;
                        break;
                    case 'cover':
                        x = offsetLeft;
                        y = offsetTop;
                        break;
                }
            }

            if(placement !== 'cover') {
                if(placement === 'top') {
                    offset.top = y - height - arrowHeight;
                    arrowPos.top = y - arrowHeight;
                } else if(placement === 'bottom') {
                    offset.top = y +  arrowHeight;
                    arrowPos.top = y;
                } else {
                    offset.top = float === 'start' ? y : float === 'end' ? (y - height) : (y - height/2);
                    arrowPos.top = y - arrowWidth/2;
                }

                if(placement === 'left') {
                    offset.left = x - width - arrowHeight;
                    arrowPos.left = x - arrowHeight;
                } else if(placement === 'right') {
                    offset.left = x + arrowHeight;
                    arrowPos.left = x;
                } else {
                    offset.left = float === 'start' ? (x - triggerSize.width/2) : float === 'end' ? (x - width + triggerSize.width/2) : (x - width/2);
                    arrowPos.left = x - arrowWidth / 2;
                }

                animateMargin.marginTop = (y - height/2 - offset.top)/2;
                animateMargin.marginLeft = (x - width/2 - offset.left)/2;

                offset.left = Math.min(winWidth - width, Math.max(0, offset.left));
                offset.top = Math.min(winHeight - height, Math.max(0, offset.top));

                arrowPos.left -= offset.left;
                arrowPos.top -= offset.top;
            } else {
                offset.top = y;
                offset.left = x;
                if(triggerSize) {
                    width = triggerSize.width;
                    height = triggerSize.height;
                }
            }

            this._offset = offset;
            this._size = {width, height};
            this._arrowPos = arrowPos;
            this._animateMargin = animateMargin;
            this._placement = placement;
        }
    },

    isShow() {
        return this.state.stage >= STAGE.show && this.state.stage < STAGE.hide;
    },

    show(options) {
        if(options || this.state.stage === STAGE.init) {
            this._initPosition(options);
        }

        clearTimeout(this.setStateTimeout);
        this.setStateTimeout = setTimeout(() => {
            this.setState({stage: STAGE.show}, () => {
                this.setStateTimeout = setTimeout(() => {
                    this.setState({stage: STAGE.showed});
                    if((this.state.content === undefined || this.state.contentId !== this.props.contentId) && this.props.getLazyContent) {
                        setTimeout(() => {
                            this.setState({content: this.props.getLazyContent(), contentId: this.props.contentId});
                        }, 320);
                    }
                    return this.props.afterShow && this.props.afterShow(this);
                }, 10);
            })
        }, 10);

        this.props.onShow && this.props.onShow(this);
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
        let {
            x,
            y,
            placement,
            float,
            children,
            content,
            contentId,
            header,
            footer,
            style,
            arrow,
            clickAway,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.popover, this._size, style);
        content = content === undefined ? (contentId === this.state.contentId ? this.state.content : null) : content;

        if(this.state.stage > STAGE.init) {
            Object.assign(style, this._offset);
        }
        if(this.state.stage === STAGE.show) {
            Object.assign(style, this._animateMargin);
        } else if(this.state.stage === STAGE.showed) {
            Object.assign(style, STYLE.stage.showed);
        } else if(this.state.stage === STAGE.hide) {
            Object.assign(style, STYLE.stage.hide, this._animateMargin);
        }

        if(this._placement === 'cover') {
            Object.assign(style, STYLE.cover);
        }

        let arrowStyle = Object.assign({position: 'absolute'}, this._arrowPos);
        let hasContent = content !== undefined || children !== undefined;

        return <ThemeProvider>
          <div ref={(e) => this.popover = e} {...other} style={style}>
            {hasContent && header !== undefined ? <div style={STYLE.header}>{header}</div> : null}
            {content !== undefined ? <div>{content}</div> : null}
            {children !== undefined ? <div>{children}</div> : null}
            {!hasContent ? <Spinner /> : null}
            {hasContent && footer !== undefined ? <div style={STYLE.footer}>{footer}</div> : null}
            {arrow && this._placement !== undefined && this._placement !== 'cover' ? <Arrow borderColor={STYLE.arrow.borderColor} inverseDirection={true} direction={this._placement} width={STYLE.arrow.width} height={STYLE.arrow.height} style={arrowStyle} /> : null}
          </div>
        </ThemeProvider>
    }
});

Popover.global = {};

/**
 * Show global popover
 * @param  {Object} options
 * @return {Void}
 */
Popover.show = function(options) {
    options = Object.assign({id: 'globalPopover', removeAfterHide: 'auto'}, options);

    let popover = Popover.global[options.id];
    if(popover) {
        setTimeout(() => {
            popover.show(options);
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

    let onShow = popover => {
        Popover.global[popover.props.id] = popover;
        options.onShow && options.onShow(popover);
    };

    let afterHide = popover => {
        options.afterHide && options.afterHide(popover);
        let removeAfterHide = popover.props.removeAfterHide;
        if(removeAfterHide === true || (removeAfterHide === 'auto' && popover.props.id === 'globalPopover')) {
            let containerElement = document.getElementById(popover.props.id + 'Container');
            ReactDOM.unmountComponentAtNode(containerElement);
            containerElement.parentNode.removeChild(containerElement);
            delete Popover.global[popover.props.id];
        }
    };

    ReactDOM.render(<Popover {...options} afterHide={afterHide} onShow={onShow} />, container);
};

/**
 * Hide global popover
 * @param  {String}  id
 * @return {Void}
 */
Popover.hide = function(id = 'globalPopover') {
    let popover = Popover.global[id];
    if(popover) {
        popover.hide();
    }
};

/**
 * Check the popover is show or hidden
 * @param  {String}  id
 * @return {Boolean}
 */
Popover.isShow = function(id = 'globalPopover') {
    let popover = Popover.global[id];
    if(popover) return popover.isShow(); 
    return false;
};

/**
 * Toggle popover
 * @param  {Object} options
 * @return {Void}
 */
Popover.toggle = function(options) {
    options = Object.assign({id: 'globalPopover', removeAfterHide: 'auto'}, options);
    if(Popover.isShow(options.id)) {
        Popover.hide(options.id, options.removeAfterHide);
    } else {
        Popover.show(options);
    }
};

export default Popover;
