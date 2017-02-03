import React               from 'react';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import Theme               from '../../theme';
import IconButton          from 'material-ui/IconButton';
import LeftIcon            from 'material-ui/svg-icons/navigation/chevron-left';
import RightIcon           from 'material-ui/svg-icons/navigation/chevron-right';
import {Lang}              from '../../app';

const Pager = React.createClass({
    mixins: [PureRenderMixin],

    getDefaultProps() {
        return {
            page: 1,
            recTotal: 0,
            recPerPage: 20
        };
    },

    _handlePrevBtnClick() {
        if(this.props.page > 1) {
            this.props.onPageChange(this.props.page - 1);
        }
    },

    _handleNextBtnClick() {
        if(this.props.page < this.totalPage) {
            this.props.onPageChange(this.props.page + 1);
        }
    },
    
    render() {
        let STYLE = {
            btn: {
                display: 'block',
                float: 'left'
            },
            pageInfo: {
                height: 24,
                lineHeight: '24px',
                padding: '12px 0',
                color: Theme.color.disable,
                float: 'left'
            }
        };

        let {
            style,
            page,
            recTotal,
            pageRecCount,
            recPerPage,
            ...other
        } = this.props;

        this.totalPage = Math.ceil(recTotal / recPerPage);

        return <div {...other} style={Object.assign({display: recTotal <= 0 ? 'none' : 'block'}, style)}>
          <IconButton style={STYLE.btn} disabled={page <= 1} className="hint--bottom" data-hint={Lang.pager.prev} onClick={this._handlePrevBtnClick}><LeftIcon color={Theme.color.icon} hoverColor={Theme.color.primary1}/></IconButton>
          {recTotal ? <div style={STYLE.pageInfo} className="hint--bottom" data-hint={((page-1) * recPerPage + 1) + ' ~ ' + ((page-1) * recPerPage + pageRecCount) + ' / ' + recTotal}><strong>{page}</strong> / <strong>{this.totalPage}</strong></div> : null}
          <IconButton style={STYLE.btn} disabled={page >= this.totalPage} className="hint--bottom" data-hint={Lang.pager.next} onClick={this._handleNextBtnClick}><RightIcon color={Theme.color.icon} hoverColor={Theme.color.primary1}/></IconButton>
        </div>
    }
});

export default Pager;
