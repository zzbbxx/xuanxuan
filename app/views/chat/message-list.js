import React               from 'react';
import Theme               from '../../theme';
import {App, Lang, Config} from '../../app';
import MessageListItem     from './message-list-item';
import MessageListDivider  from './message-list-divider';
import Moment              from 'moment';
import ReactDOM            from 'react-dom';
import StayBottom          from '../mixins/stay-bottom';
import ReactCSSTransitionGroup from 'react-addons-css-transition-group';
import ChatMessage         from '../../models/chat/chat-message';
import R                   from 'Resource';
import {defaultFontSize}   from './change-font-size';

const STYLE = {
    main: {backgroundColor: Theme.color.canvas, padding: '10px 10px 0'}
};

/**
 * Check time is a moment ago
 * @param  {Moment}  time1
 * @param  {Moment}  time2
 * @param  {Number}  minutes
 * @return {Boolean}
 */
function isAMomentAgoTime(time1, time2, minutes) {
    minutes = minutes || 2;
    time2 = time2 ? Moment(time2) : Moment();
    return Moment(time1).add(minutes, 'minutes').isAfter(time2);
}

// display app component
const MessageList = React.createClass({
    mixins: [StayBottom],

    getInitialState() {
        return {
            fontSize: Object.assign({}, defaultFontSize, App.user.config.ui.chat.fontSize)
        };
    },

    componentDidMount() {
        this._handleUserConfigChangeEvent = App.on(R.event.user_config_change, () => {
            this.setState({fontSize: App.user.config.ui.chat.fontSize});
        });
    },

    componentWillUnmount() {
        App.off(this._handleUserConfigChangeEvent);
    },
    
    render() {
        let {
            messages,
            offlineTip,
            chatId,
            animate,
            style,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);
        
        let list = [];
        if(messages) {
            let lastMessage, lastMomentMessageDate;
            messages.forEach(message => {
                    let isSameUser = lastMessage && lastMessage.user == message.user;
                let date = Moment(message.date);
                let isDiffDate = !lastMessage || !date.isSame(lastMomentMessageDate, 'day');
                let isAMomentTime = isSameUser && !isDiffDate && lastMomentMessageDate && isAMomentAgoTime(lastMomentMessageDate, date);
                if(!isAMomentTime) lastMomentMessageDate = date;
                if(isDiffDate) {
                    let today = Moment();
                    let timeText = date.format('YYYY-M-D');
                    if(date.isSame(today, 'day')) {
                        timeText = Lang.time.today + ' ' + timeText;
                    } else if(today.add(-1, 'days').isSame(date, 'day')) {
                        timeText = Lang.time.yestoday + ' ' + timeText;
                    }
                    list.push(<MessageListDivider key={message.id + '-date'} text={timeText} />);
                }

                list.push(<MessageListItem className={'message message-t-' + message.type} key={message.gid} lastMessage={lastMessage} message={message} hideAvatar={isSameUser && !isDiffDate} hideTime={isSameUser && isAMomentTime} fontSize={this.state.fontSize} />);

                lastMessage = message;
            });
        }

        if(offlineTip) {
            let message = new ChatMessage({
                type: 'broadcast',
                content: offlineTip,
                cgid: chatId,
                gid: 'offlineTipChat',
                date: new Date()
            });
            list.push(<MessageListItem className='message' key={message.gid} message={message}/>);
        }

        return <div {...other} style={style} ref={(e) => this.stayBottomElement = e}>
            {animate ? <ReactCSSTransitionGroup transitionName='animate-nice-show' transitionEnterTimeout={300} transitionLeaveTimeout={1}>{list}</ReactCSSTransitionGroup> : list}
        </div>
    }
});

export default MessageList;
