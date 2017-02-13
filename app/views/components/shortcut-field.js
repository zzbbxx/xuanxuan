import React, {Component} from 'react';
import TextField          from 'material-ui/TextField';
import Events             from 'material-ui/utils/events';
import Helper             from 'Helper';

class ShortcutField extends Component {

    state = {
        value: ''
    };

    _onKeyUp(e) {
        if(e.keyCode === 8 || e.cod === 'Backspace') {
            this.setState({value: ''});
            this.props.onChange && this.props.onChange('');
            return;
        }
        let shortcut = [];
        if(e.metaKey) {
            shortcut.push(Helper.isWindowsOS ? 'Windows' : 'Command');
        }
        if(e.ctrlKey) {
            shortcut.push('Ctrl');
        }
        if(e.altKey) {
            shortcut.push('Alt');
        }
        if(e.shiftKey) {
            shortcut.push('Shift');
        }
        if(e.key && e.key !== 'Meta' && e.key !== 'Control' && e.key !== 'Alt' && e.key !== 'Shift') {
            shortcut.push(e.key);
        }
        shortcut = shortcut.join('+');
        this.setState({value: shortcut});
        this.props.onChange && this.props.onChange(shortcut);
        e.preventDefault();
    }

    getValue() {
        return this.state.value || this.props.defaultValue;
    }

    componentDidMount() {
        if(this.props.focus) {
            this.focusTask = setTimeout(() => {
                this.textbox.focus();
            }, 1000);
        }
        Events.on(this.textbox.input, 'keydown', this._onKeyUp.bind(this));
    }

    componentWillUnmount() {
        clearTimeout(this.focusTask);
        Events.off(this.textbox.input, 'keydown', this._onKeyUp.bind(this));
    }

    render() {
        let {
            onChange,
            focus,
            checkGlobal,
            ...other
        } = this.props;

        return <TextField ref={e => {
            this.textbox = e;
        }} {...other}
            value={this.state.value}
            onKeyPress={this._onKeyUp}
        />
    }
}

export default ShortcutField;