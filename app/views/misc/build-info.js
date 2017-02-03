import React   from 'react';
import PKG     from '../../package.json';
import Moment  from 'moment';

const BuildInfo = React.createClass({
    render() {
        return <div {...this.props}>v{PKG.version}{PKG.distributeTime ? (' (' + Moment(PKG.distributeTime).format('YYYYMMDDHHmm') + ')') : null} {DEBUG ? '[debug]' : ''}</div>
    }
});

export default BuildInfo;
