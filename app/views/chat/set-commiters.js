import React, {Component} from 'react';
import {App, Lang}        from 'App';
import Message            from 'Models/chat/chat-message';
import R                  from 'Resource';
import {
    RadioButton, 
    RadioButtonGroup
}                         from 'material-ui/RadioButton';
import Checkbox           from 'material-ui/Checkbox';
import Theme              from 'Theme';

class SetCommiters extends Component {

    componentWillMount() {
        let chat = this.props.chat;
        let type = chat.commitersType;
        let members = chat.membersSet;
        let whitelist = chat.whitelist || new Set();
        let isEmptyWhiteList = !whitelist.size;
        let adminsCount = 0;
        members.forEach(x => {
            if(chat.isAdmin(x)) {
                adminsCount++;
                if(isEmptyWhiteList) whitelist.add(x.remoteId);
            }
        });
        this.setState({type, members, adminsCount, whitelist});
    }

    getCommiters() {
        let type = this.state.type;
        if(type === 'whitelist') {
            return this.state.whitelist;
        } else if(type === 'admins') {
            return '$ADMINS';
        }
        return '';
    }

    _onSelectChange(e, value) {
        this.setState({type: value});
    }

    _onCheckboxChange(remoteId, isChecked) {
        let whitelist = this.state.whitelist;
        if(isChecked) {
            whitelist.add(remoteId);
        } else {
            whitelist.delete(remoteId);
        }
        this.setState({whitelist});
    }

    render() {
        let {
            chat,
            ...other
        } = this.props;

        const STYLE = {
            radioButton: {
                marginBottom: 16,
            },
            checkbox: {
                display: 'block',
                float: 'left',
                width: 'auto',
                marginRight: 12,
                marginTop: -8,
                whiteSpace: 'nowrap'
            },
            checkboxIconStyle: {
                marginRight: 4
            },
            checkboxesList: {
                marginLeft: 40
            }
        };

        let members = this.state.members;
        let adminsCount = this.state.adminsCount;
        let checkboxes = null;
        let whitelist = this.state.whitelist;
        if(this.state.type === 'whitelist') {
            checkboxes = members.map(member => {
                return <Checkbox
                    key={'member-' + member.gid}
                    label={member.displayName}
                    checked={whitelist.has(member.remoteId)}
                    onCheck={(e, isChecked) => {
                        this._onCheckboxChange(member.remoteId, isChecked);
                    }}
                    iconStyle={STYLE.checkboxIconStyle}
                    style={STYLE.checkbox}
                />;
            });
        }

        return <div {...other}>
            <p style={{color: Theme.color.icon}}>{Lang.chat.commitersSettingTip}</p>
            <RadioButtonGroup name={'setChatCommiters-' + this.props.chat.gid} valueSelected={this.state.type} onChange={this._onSelectChange.bind(this)}>
                <RadioButton
                    value="all"
                    label={Lang.chat.commitersTypes.all + ' (' + chat.membersCount + ')'}
                    style={STYLE.radioButton}
                />
                <RadioButton
                    value="admins"
                    label={Lang.chat.commitersTypes.admins + ' (' + adminsCount + ')'}
                    style={STYLE.radioButton}
                />
                <RadioButton
                    value="whitelist"
                    label={Lang.chat.commitersTypes.whitelist + (this.state.type === 'whitelist' ? (' (' + whitelist.size + '/' + chat.membersCount + ')') : '')}
                    style={STYLE.radioButton}
                />
            </RadioButtonGroup>
            {checkboxes ? <div className="clearfix" style={STYLE.checkboxesList}>{checkboxes}</div> : null}
        </div>;
    }
}

export default SetCommiters;