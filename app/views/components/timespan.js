import React               from 'react';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import Moment              from 'moment';
import Theme               from '../../theme';
import {Lang}              from '../../app';

const TimeSpan = React.createClass({
    mixins: [PureRenderMixin],
    
    render() {
        let {
            begin,
            end,
            ...other
        } = this.props;

        begin = Moment(begin);
        end = Moment(end);

        let timespanDesc = begin.format(Lang.time.format.fullDate);
        if(!begin.isSame(end, 'day')) {
            timespanDesc += ' ~ ' + end.format(Lang.time.format[end.isSame(begin, 'year') ? 'monthDay' : 'fullDate']);
        }

        return <span {...other}>{timespanDesc}</span>
    }
});

export default TimeSpan;
