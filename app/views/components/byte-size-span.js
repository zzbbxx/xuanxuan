import React               from 'react';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import Theme               from '../../theme';
import FileIcon            from '../icons/file-outline';
import ImageIcon           from 'material-ui/svg-icons/image/photo';
import CircularProgress    from 'material-ui/CircularProgress';

const ByteSizeSpan = React.createClass({
    mixins: [PureRenderMixin],

    getDefaultProps() {
        return {
            fixed: 2,
            unit: null,
        };
    },

    render() {

        let {
            size,
            fixed,
            unit,
            ...other
        } = this.props;

        const UNITS = {
            B: 1,
            KB: 1024, 
            MB: 1024*1024,
            GB: 1024*1024*1024,
            TB: 1024*1024*1024*1024,
        }

        if(!unit) {
            if(size < UNITS.KB) {
                unit = 'B';
            } else if(size < UNITS.MB) {
                unit = 'KB';
            } else if(size < UNITS.GB) {
                unit = 'MB';
            } else if(size < UNITS.TB) {
                unit = 'GB';
            } else {
                unit = 'TB';
            }
        }

        return <span {...other}>{new Number(size / UNITS[unit]).toFixed(fixed) + unit}</span>;
    }
});

export default ByteSizeSpan;
