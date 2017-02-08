import React               from 'react';
import Theme               from 'Theme';
import AreaSelector        from 'Components/area-selector';
import Hotkey              from '../mixins/hotkey';
import CheckIcon           from 'material-ui/svg-icons/navigation/check';
import CloseIcon           from 'material-ui/svg-icons/navigation/close';
import ColorManipulator    from 'Utils/color-helper';
import Paper               from 'material-ui/Paper';
import Path                from 'path';
import R                   from 'Resource';
import Helper              from 'Helper';

const ImageCutter = React.createClass({
    mixins: [Hotkey],
    getInitialState() {
        return {
            hover: true
        };
    },
    onHotkeyPress(e) {
        if(e) {
            // Listen ESC
            if(e.keyCode === 27) {
                this._handleCloseButtonClick();
                return false;
            }

            // Listen Enter
            if(e.keyCode === 13) {
                this._handleOkButtonClick();
                return false;
            }
        }
    },

    componentDidMount() {

    },

    _handleOkButtonClick() {
        if(this.select) {
            Helper.cutImage(this.props.sourceImage, this.select).then(image => {
                this.props.onFinish && this.props.onFinish(image);
            });
        } else {
            this.props.onFinish && this.props.onFinish(null);
        }
    },

    _handleCloseButtonClick() {
        this.props.onFinish && this.props.onFinish(null);
    },

    _handleSelectArea(select) {
        this.select = select;
    },

    render() {
        let {
            sourceImage,
            style,
            onFinish,
            onCancel,
            hideAreaSelectorOnBlur,
            ...other
        } = this.props;

        let imageUrl = 'file://' + Path.normalize(sourceImage).replace(/\\/g, '/');

        style = Object({
            backgroundRepeat: 'no-repeat', 
            backgroundImage: 'url("' + imageUrl + '")',
            backgroundPosition: 'center',
            backgroundSize: 'contain'
        }, style);

        let toolbarIconStyle = {
            cursor: 'pointer',
            padding: 10,
            width: 20,
            height: 20,
            textAlign: 'center',
        };

        let closeIconStyle = Object.assign({}, toolbarIconStyle, {
            position: 'absolute',
            top: 0,
            right: 0,
            zIndex: 3,
            backgroundColor: 'rgba(0,0,0,.3)',
        });

        let toolbar = <Paper zDepth={4} style={{minWidth: 90, backgroundColor: Theme.color.pale1, padding: '0 5px', marginTop: 5, marginBottom: 5}}><CloseIcon style={toolbarIconStyle} color={Theme.color.negative} hoverColor={ColorManipulator.darken(Theme.color.negative, 0.1)} onClick={this._handleCloseButtonClick} /><CheckIcon style={toolbarIconStyle} color={Theme.color.positive} hoverColor={ColorManipulator.darken(Theme.color.positive, 0.1)}  onClick={this._handleOkButtonClick} /></Paper>;

        return <div {...other} className='fix-full user-app-no-dragable' style={style} onMouseEnter={e => {this.setState({hover: true})}} onMouseLeave={e => {this.setState({hover: false})}}>
            <AreaSelector onSelectArea={this._handleSelectArea} style={{zIndex: 2, display: this.state.hover ? 'block' : 'none'}} className='dock-full' img={imageUrl} toolbarHeight={50} toolbar={toolbar} />
            <CloseIcon style={closeIconStyle} color={Theme.color.canvas} hoverColor={ColorManipulator.darken(Theme.color.canvas, 0.1)} onClick={this._handleCloseButtonClick} />
        </div>
    }
});

export default ImageCutter;
