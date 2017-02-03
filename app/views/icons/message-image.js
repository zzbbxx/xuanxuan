import React from 'react';
import PureRenderMixin  from 'react-addons-pure-render-mixin';
import SvgIcon from 'material-ui/SvgIcon';

/**
 * Svg icon: message-image
 * @return {React Component class}
 */
const MessageImageIcon = React.createClass({
  mixins: [PureRenderMixin],

  render() {
    return (
      <SvgIcon {...this.props}>
        <path d="M5,14L8.5,9.5L11,12.5L14.5,8L19,14M20,2H4A2,2 0 0,0 2,4V22L6,18H20A2,2 0 0,0 22,16V4C22,2.89 21.1,2 20,2Z"/>
      </SvgIcon>
    );
  }

});

export default MessageImageIcon;
