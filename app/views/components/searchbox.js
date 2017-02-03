import React, {PropTypes}  from 'react';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import Theme               from '../../theme';
import TextField           from 'material-ui/TextField';
import ColorManipulator    from 'Utils/color-helper';
import CloseIcon           from 'material-ui/svg-icons/navigation/close';
import SearchIcon          from 'material-ui/svg-icons/action/search';

const Helper = global.Helper;

const EmoticonList = React.createClass({
    mixins: [PureRenderMixin],

    propTypes: {
        onValueChange: PropTypes.func,
        hintText: PropTypes.any,
        defaultValue: PropTypes.any,
        style: PropTypes.object
    },

    getInitialState() {
        return {
            emptyValue: Helper.isEmptyString(this.props.defaultValue)
        };
    },

    _handleValueChange(e) {
        this.setState({emptyValue: Helper.isEmptyString(e.target.value)});
        return this.props.onValueChange && this.props.onValueChange(e.target.value);
    },
    
    _handleCloseButtonClick() {
        this.textbox.clearValue();
        this.setState({emptyValue: true});
        this.textbox.focus();
        this.props.onValueChange && this.props.onValueChange('')
    },

    componentDidMount() {
        setTimeout(() => {this.textbox.focus();}, 300);
    },

    render() {
        const STYLE = {
            main: {
                paddingLeft: 10,
                paddingRight: 10,
            },
            inputStyle: {
                fontSize: '13px',
            },
            closeButton: {
                cursor: 'pointer',
                position: 'absolute',
                right: 0,
                top: 2,
                padding: 10,
                width: 20,
                height: 20,
                textAlign: 'center',
            },
        };

        let {
            style,
            hintText,
            defaultValue,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);
        let IconComponent = this.state.emptyValue ? SearchIcon : CloseIcon;

        return <div {...other} style={style}>
          <TextField ref={(e) => this.textbox = e} hintStyle={STYLE.inputStyle} inputStyle={STYLE.inputStyle} hintText={hintText} fullWidth={true} defaultValue={defaultValue} onChange={this._handleValueChange}/>
          <IconComponent onClick={this._handleCloseButtonClick} color={ColorManipulator.fade(Theme.color.icon, 0.5)} hoverColor={Theme.color.icon} style={STYLE.closeButton} />
        </div>
    }
});

export default EmoticonList;
