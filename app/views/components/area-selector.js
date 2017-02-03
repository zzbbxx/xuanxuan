import React               from 'react';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import Theme               from '../../theme';

const AreaSelector = React.createClass({
    mixins: [PureRenderMixin],

    getInitialState() {
        return {
            select: null,
            resizeable: false,
        };
    },

    _setSelect(select) {
        if(select) {
            select.height = Math.max(0, Math.min(this.contianer.clientHeight, select.height));
            select.width = Math.max(0, Math.min(this.contianer.clientWidth, select.width));

            select.top = Math.max(0, Math.min(this.contianer.clientHeight -  select.height, select.top));
            select.left = Math.max(0, Math.min(this.contianer.clientWidth - select.width, select.left));
            
        }
        if(!this.state.select || (this.state.select && (this.state.select.left !== select.left || this.state.select.top !== select.top || this.state.select.width !== select.width || this.state.select.height !== select.height ))) {
            select.x = select.left;
            select.y = select.top;
            this.setState({select});
            return this.props.onSelectArea && this.props.onSelectArea(select);
        }
    },

    _handleMouseDown(e) {
        this.mouseDownPos = {left: e.clientX, top: e.clientY};
        this.mouseDownSelect = Object.assign({}, this.state.select);
        if(this.state.resizeable) {
            this.mouseActionPosition = this._caculatePosition(this.mouseDownPos, this.mouseDownSelect);
        }
    },

    _isPiontInRect(point, rect) {
        return rect.width > 0 && rect.height > 0
            && point.left >= rect.left 
            && point.left <= (rect.left + rect.width)
            && point.top >= rect.top
            && point.top <= (rect.top + rect.height);
    },

    _caculatePosition(pos, area) {
        let halfHotSize = 5;
        let hotSize = halfHotSize + halfHotSize;
        if(this._isPiontInRect(pos, {
            left: area.left + halfHotSize, 
            top: area.top + halfHotSize, 
            width: area.width - hotSize, 
            height: area.height - hotSize
        })) {
            return 'center';
        }
        if(this._isPiontInRect(pos, {
            left: area.left - halfHotSize, 
            top: area.top + halfHotSize, 
            width: hotSize, 
            height: area.height - hotSize
        })) {
            return 'left';
        }
        if(this._isPiontInRect(pos, {
            left: area.left + area.width - halfHotSize, 
            top: area.top + halfHotSize, 
            width: hotSize, 
            height: area.height - hotSize
        })) {
            return 'right';
        }
        if(this._isPiontInRect(pos, {
            left: area.left + halfHotSize, 
            top: area.top - halfHotSize, 
            width: area.width - hotSize, 
            height: hotSize
        })) {
            return 'top';
        }
        if(this._isPiontInRect(pos, {
            left: area.left + halfHotSize, 
            top: area.top + area.height - halfHotSize, 
            width: area.width - hotSize, 
            height: hotSize
        })) {
            return 'bottom';
        }
        if(this._isPiontInRect(pos, {
            left: area.left - halfHotSize, 
            top: area.top - halfHotSize, 
            width: hotSize, 
            height: hotSize
        })) {
            return 'top-left';
        }
        if(this._isPiontInRect(pos, {
            left: area.left + area.width - halfHotSize, 
            top: area.top - halfHotSize, 
            width: hotSize, 
            height: hotSize
        })) {
            return 'top-right';
        }
        if(this._isPiontInRect(pos, {
            left: area.left - halfHotSize, 
            top: area.top + area.height - halfHotSize, 
            width: hotSize, 
            height: hotSize
        })) {
            return 'bottom-left';
        }
        if(this._isPiontInRect(pos, {
            left: area.left + area.width - halfHotSize, 
            top: area.top + area.height - halfHotSize, 
            width: hotSize, 
            height: hotSize
        })) {
            return 'bottom-right';
        }
        return null;
    },

    _handleMouseMove(e) {
        if(this.mouseDownPos) {
            this.mouseMovePos = {left: e.clientX, top: e.clientY};
            if(!this.state.resizeable) {
                this._setSelect({
                    left: Math.min(this.mouseDownPos.left, this.mouseMovePos.left), 
                    top: Math.min(this.mouseDownPos.top, this.mouseMovePos.top), 
                    width: Math.abs(this.mouseMovePos.left - this.mouseDownPos.left),
                    height: Math.abs(this.mouseMovePos.top - this.mouseDownPos.top),
                });
            } else {
                let select = this.state.select;
                if(select) {
                    let position = this.mouseActionPosition;
                    let newSelect = null;
                    let deltaX = this.mouseMovePos.left - this.mouseDownPos.left;
                    let deltaY = this.mouseMovePos.top - this.mouseDownPos.top;

                    switch(position) {
                        case 'center':
                            newSelect = {
                                top: this.mouseDownSelect.top + deltaY,
                                left: this.mouseDownSelect.left + deltaX,
                                width: select.width,
                                height: select.height
                            };
                            break;
                        case 'left':
                            newSelect = {
                                top: select.top,
                                left: this.mouseDownSelect.left + deltaX,
                                width: this.mouseDownSelect.width - deltaX,
                                height: select.height
                            };
                            break;
                        case 'right':
                            newSelect = {
                                top: select.top,
                                left: select.left,
                                width: this.mouseDownSelect.width + deltaX,
                                height: select.height
                            };
                            break;
                        case 'top':
                            newSelect = {
                                top: this.mouseDownSelect.top + deltaY,
                                left: select.left,
                                width: select.width,
                                height: this.mouseDownSelect.height - deltaY
                            };
                            break;
                        case 'bottom':
                            newSelect = {
                                top: select.top,
                                left: select.left,
                                width: select.width,
                                height: this.mouseDownSelect.height + deltaY
                            };
                            break;
                        case 'top-left':
                            newSelect = {
                                top: this.mouseDownSelect.top + deltaY,
                                left: this.mouseDownSelect.left + deltaX,
                                width: this.mouseDownSelect.width - deltaX,
                                height: this.mouseDownSelect.height - deltaY
                            };
                            break;
                        case 'top-right':
                            newSelect = {
                                top: this.mouseDownSelect.top + deltaY,
                                left: select.left,
                                width: this.mouseDownSelect.width + deltaX,
                                height: this.mouseDownSelect.height - deltaY
                            };
                            break;
                        case 'bottom-left':
                            newSelect = {
                                top: select.top,
                                left: this.mouseDownSelect.left + deltaX,
                                width: this.mouseDownSelect.width - deltaX,
                                height: this.mouseDownSelect.height + deltaY
                            };
                            break;
                        case 'bottom-right':
                            newSelect = {
                                top: select.top,
                                left: select.left,
                                width: this.mouseDownSelect.width + deltaX,
                                height: this.mouseDownSelect.height + deltaY
                            };
                            break;
                    }
                    if(newSelect) this._setSelect(newSelect);
                }
            }
        }
    },

    _handleMouseUp(e) {
        this.mouseDownPos = null;
        if(!this.state.resizeable && this.state.select) {
            this.setState({resizeable: true});
        }
    },

    render() {
        const STYLE = {
            main: {
                backgroundColor: 'rgba(0,0,0,0.4)',
            },
            controller: {
                position: 'absolute',
                backgroundColor: 'rgba(255,255,255,0.4)',
                cursor: 'move',
                boxSizing: 'border-box',
                backgroundRepeat: 'none'
            },
            controlBase: {
               position: 'absolute',
               width: 6,
               height: 6,
               border: '1px solid #fff',
               borderRadius: 1,
               background: 'rgba(0, 0, 0, 0.6)',
            },
            controls: {
                'left': {
                    left: -4,
                    top: '50%',
                    marginTop: -3,
                    cursor: 'w-resize',
                },
                'top': {
                    top: -4,
                    left: '50%',
                    marginLeft: -3,
                    cursor: 'n-resize',
                },
                'right': {
                    right: -4,
                    top: '50%',
                    marginTop: -3,
                    cursor: 'e-resize',
                },
                'bottom': {
                    bottom: -4,
                    left: '50%',
                    marginLeft: -3,
                    cursor: 's-resize',
                },
                'top-left': {
                    left: -4,
                    top: -4,
                    cursor: 'nw-resize',
                },
                'top-right': {
                    right: -4,
                    top: -4,
                    cursor: 'ne-resize',
                },
                'bottom-left': {
                    left: -4,
                    bottom: -4,
                    cursor: 'sw-resize',
                },
                'bottom-right': {
                    right: -4,
                    bottom: -4,
                    cursor: 'se-resize',
                },
            }
        };

        let {
            toolbar,
            toolbarHeight = 40,
            style,
            toolbarStyle,
            img,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);
        if(!this.state.resizeable) {
            Object.assign(style, {cursor: 'crosshair'});
        }

        let controllerStyle = Object.assign({backgroundImage: img ? ('url("' + img + '")') : 'none'}, STYLE.controller);
        if(this.state.select) {
            Object.assign(controllerStyle, {left: this.state.select.left, top: this.state.select.top, width: this.state.select.width, height: this.state.select.height, backgroundPositionX: -this.state.select.left-1, backgroundPositionY: -this.state.select.top-1});
        } else {
            Object.assign(controllerStyle, {display: 'none'});
        }

        let controls = null;
        if(this.state.resizeable && this.state.select) {
            controls = Object.keys(STYLE.controls).map(key => {
                let controlStyle = Object.assign({}, STYLE.controlBase, STYLE.controls[key]);
                return <div key={key} style={controlStyle}></div>
            });
        }

        toolbarStyle = Object.assign({position: 'absolute', right: 0}, toolbarStyle);
        if(this.contianer && (this.state.select.top + this.state.select.height + toolbarHeight) < this.contianer.clientHeight) {
            toolbarStyle.top = '100%';
        } else {
            toolbarStyle.bottom = 0;
        }

        return <div ref={e => this.contianer = e} {...other} style={style} onMouseUp={this._handleMouseUp} onMouseDown={this._handleMouseDown} onMouseMove={this._handleMouseMove}>
          <div style={controllerStyle} className='ants-border'>{controls}<div style={toolbarStyle}>{toolbar}</div></div>
        </div>
    }
});

export default AreaSelector;
