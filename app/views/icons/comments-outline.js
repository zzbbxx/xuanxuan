import React from 'react';
import PureRenderMixin  from 'react-addons-pure-render-mixin';
import SvgIcon from 'material-ui/SvgIcon';

/**
 * Svg icon: comment-outline
 * @return {React Component class}
 */
const CommentOutlineIcon = React.createClass({
  mixins: [PureRenderMixin],

  render() {
    return (
      <SvgIcon {...this.props}>
        <path d="M12,23A1,1 0 0,1 11,22V19H7A2,2 0 0,1 5,17V7C5,5.89 5.9,5 7,5H21A2,2 0 0,1 23,7V17A2,2 0 0,1 21,19H16.9L13.2,22.71C13,22.9 12.75,23 12.5,23V23H12M13,17V20.08L16.08,17H21V7H7V17H13M3,15H1V3A2,2 0 0,1 3,1H19V3H3V15Z"/>
      </SvgIcon>
    );
  }

});

export default CommentOutlineIcon;
