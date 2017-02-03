import React               from 'react';
import Theme               from '../../theme';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import {App, Lang, Config} from '../../app';
import RadioButtonGroup    from 'material-ui/RadioButton/RadioButtonGroup';
import RadioButton         from 'material-ui/RadioButton/RadioButton';
import Checkbox            from 'material-ui/checkbox';
import FlatButton          from 'material-ui/FlatButton';

const ConfirmCloseWindow = React.createClass({
    mixins: [PureRenderMixin],

    _onOptionsChange(e, checked) {
        this.option = checked;
        this.props.onOptionChange && this.props.onOptionChange({option: this.option, remember: this.remember});
    },

    _onRememberOptionChange(e, checked) {
        this.remember = checked;
        this.props.onOptionChange && this.props.onOptionChange({option: this.option, remember: this.remember});
    },

    render() {
        let {
            style,
            onOptionChange,
            ...other
        } = this.props;

        if(this.option === undefined) {
            this.option = 'minimize';
            this.remember = false;
            onOptionChange && onOptionChange({option: this.option, remember: this.remember});
        }
        
        return <div {...other} style={style}>
          <RadioButtonGroup name="confirmCloseWindow" defaultSelected={this.option} onChange={this._onOptionsChange} style={{marginBottom:32}}>
          {
              Object.keys(Lang.main.askOnCloseWindow.options).map(key => {
                  return <RadioButton
                    value={key}
                    key={key}
                    label={Lang.main.askOnCloseWindow.options[key]}
                    style={{marginBottom:16}}/>
              })
          }
          </RadioButtonGroup>
          <Checkbox
            onCheck={this._onRememberOptionChange}
            name="remember"
            value="remember"
            defaultChecked={this.remember}
            label={Lang.main.askOnCloseWindow.remember}
            style={{marginBottom:5}}/>
        </div>
    }
});

export default ConfirmCloseWindow;
