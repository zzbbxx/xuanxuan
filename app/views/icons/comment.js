import React from 'react';
import PureRenderMixin  from 'react-addons-pure-render-mixin';
import SvgIcon from 'material-ui/SvgIcon';

/**
 * Svg icon: comment
 * @return {React Component class}
 */
const CommentIcon = React.createClass({
  mixins: [PureRenderMixin],

  render() {
    return (
      <SvgIcon {...this.props}>
        <path d="M9,22A1,1 0 0,1 8,21V18H4A2,2 0 0,1 2,16V4C2,2.89 2.9,2 4,2H20A2,2 0 0,1 22,4V16A2,2 0 0,1 20,18H13.9L10.2,21.71C10,21.9 9.75,22 9.5,22V22H9Z"/>
      </SvgIcon>
    );
  }

});

export default CommentIcon;
