import React from 'react';
import PureRenderMixin  from 'react-addons-pure-render-mixin';
import SvgIcon from 'material-ui/SvgIcon';

/**
 * Svg icon: file-outline
 * @return {React Component class}
 */
const FileOutlineIcon = React.createClass({
  mixins: [PureRenderMixin],

  render() {
    return (
      <SvgIcon {...this.props}>
        <path d="M13,9H18.5L13,3.5V9M6,2H14L20,8V20A2,2 0 0,1 18,22H6C4.89,22 4,21.1 4,20V4C4,2.89 4.89,2 6,2M11,4H6V20H11L18,20V11H11V4Z"/>
      </SvgIcon>
    );
  }

});

export default FileOutlineIcon;
