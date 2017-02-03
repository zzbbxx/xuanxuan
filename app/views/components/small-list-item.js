// Fork from https://github.com/callemall/material-ui/blob/master/src/lists/list-item.jsx

import React            from 'react';
import ReactDOM         from 'react-dom';
import PureRenderMixin  from 'react-addons-pure-render-mixin';
import ColorManipulator from 'Utils/color-helper';
import Colors           from 'Utils/material-colors';
import Transitions      from 'material-ui/styles/transitions';
import Typography       from 'material-ui/styles/typography';
import EnhancedButton   from 'material-ui/internal/EnhancedButton';
import IconButton       from 'material-ui/IconButton';
import OpenIcon         from 'material-ui/svg-icons/navigation/arrow-drop-up';
import CloseIcon        from 'material-ui/svg-icons/navigation/arrow-drop-down';
import NestedList       from 'material-ui/List/NestedList';
import DefaultRawTheme  from 'material-ui/styles/baseThemes/lightBaseTheme';
import getMuiTheme      from 'material-ui/styles/getMuiTheme';

/**
 * React component: SmallListItem
 */
const ListItem = React.createClass({

  mixins: [PureRenderMixin],

  contextTypes: {
    muiTheme: React.PropTypes.object,
  },

  propTypes: {
    autoGenerateNestedIndicator: React.PropTypes.bool,
    disabled: React.PropTypes.bool,
    disableKeyboardFocus: React.PropTypes.bool,
    initiallyOpen: React.PropTypes.bool,
    innerDivStyle: React.PropTypes.object,
    insetChildren: React.PropTypes.bool,
    innerStyle: React.PropTypes.object,
    leftAvatar: React.PropTypes.element,
    leftCheckbox: React.PropTypes.element,
    leftIcon: React.PropTypes.element,
    nestedLevel: React.PropTypes.number,
    nestedItems: React.PropTypes.arrayOf(React.PropTypes.element),
    onKeyboardFocus: React.PropTypes.func,
    onMouseEnter: React.PropTypes.func,
    onMouseLeave: React.PropTypes.func,
    onNestedListToggle: React.PropTypes.func,
    onTouchStart: React.PropTypes.func,
    onTouchTap: React.PropTypes.func,
    rightAvatar: React.PropTypes.element,
    rightIcon: React.PropTypes.element,
    rightIconButton: React.PropTypes.element,
    rightToggle: React.PropTypes.element,
    primaryText: React.PropTypes.node,
    secondaryText: React.PropTypes.node,
    secondaryTextLines: React.PropTypes.oneOf([1, 2]),
  },

  //for passing default theme context to children
  childContextTypes: {
    muiTheme: React.PropTypes.object,
  },

  getChildContext () {
    return {
      muiTheme: this.state.muiTheme,
    };
  },

  getDefaultProps() {
    return {
      autoGenerateNestedIndicator: true,
      initiallyOpen: false,
      nestedItems: [],
      nestedLevel: 0,
      onKeyboardFocus: () => {},
      onMouseEnter: () => {},
      onMouseLeave: () => {},
      onNestedListToggle: () => {},
      onTouchStart: () => {},
      secondaryTextLines: 1,
    };
  },

  getInitialState() {
    return {
      hovered: false,
      isKeyboardFocused: false,
      open: this.props.initiallyOpen,
      rightIconButtonHovered: false,
      rightIconButtonKeyboardFocused: false,
      touch: false,
      muiTheme: this.context.muiTheme ? this.context.muiTheme : getMuiTheme(DefaultRawTheme),
    };
  },

  //to update theme inside state whenever a new theme is passed down
  //from the parent / owner using context
  componentWillReceiveProps (nextProps, nextContext) {
    let newMuiTheme = nextContext.muiTheme ? nextContext.muiTheme : this.state.muiTheme;
    this.setState({muiTheme: newMuiTheme});
  },

  render() {
    const {
      autoGenerateNestedIndicator,
      children,
      disabled,
      disableKeyboardFocus,
      innerDivStyle,
      insetChildren,
      leftAvatar,
      leftCheckbox,
      leftIcon,
      nestedItems,
      nestedLevel,
      onKeyboardFocus,
      onMouseLeave,
      onMouseEnter,
      onTouchStart,
      onTouchTap,
      rightAvatar,
      rightIcon,
      rightIconButton,
      rightToggle,
      primaryText,
      secondaryText,
      secondaryTextLines,
      style,
      size,
      activeColor,
      actived,
      ...other,
    } = this.props;

    const leftAvatarSize = leftAvatar ? (leftAvatar.props.size || 40) : 40;
    const textColor = this.state.muiTheme.rawTheme.palette.textColor;
    const hoverColor = ColorManipulator.fade(textColor, 0.1);
    const activedColor = activeColor || ColorManipulator.fade(this.state.muiTheme.rawTheme.palette.alternateTextColor, 0.6);
    const singleAvatar = !secondaryText && (leftAvatar || rightAvatar);
    const singleSmallAvatar = singleAvatar && leftAvatarSize <= 30;
    const singleNoAvatar = !secondaryText && !(leftAvatar || rightAvatar);
    const twoLine = secondaryText && secondaryTextLines === 1;
    const threeLine = secondaryText && secondaryTextLines > 1;
    const hasCheckbox = leftCheckbox || rightToggle;

    const itemSize = size || 40;

    const styles = {
      root: {
        backgroundColor: actived ? activedColor : ((this.state.isKeyboardFocused || this.state.hovered) &&
          !this.state.rightIconButtonHovered &&
          !this.state.rightIconButtonKeyboardFocused ? hoverColor : null),
        color: textColor,
        display: 'block',
        fontSize: 13,
        lineHeight: '20px',
        position: 'relative',
        transition: Transitions.easeOut(),
        width: '100%',
        textAlign: 'left'
      },

      //This inner div is needed so that ripples will span the entire container
      innerDiv: {
        marginLeft: nestedLevel * this.state.muiTheme.listItem.nestedLevelDepth,
        paddingLeft: leftIcon || singleSmallAvatar ? 48 : (leftAvatar || leftCheckbox || insetChildren ? 60 : 10),
        paddingRight: rightIcon ? 48 : (rightAvatar || rightIconButton ? 60 : rightToggle ? 56 : 10),
        paddingBottom: singleAvatar && !singleSmallAvatar ? 20 : singleNoAvatar ? (itemSize - 20)/2 : 10,
        paddingTop: singleNoAvatar || threeLine ? (itemSize - 20)/2 : singleAvatar && !singleSmallAvatar ? 20 : 10,
        position: 'relative',
      },

      icons: {
        height: 24,
        width: 24,
        display: 'block',
        position: 'absolute',
        top: twoLine ? 10 : (singleAvatar && !singleSmallAvatar) ? 10 : (itemSize - 40)/2,
        padding: 8,
      },

      leftIcon: {
        left: 4
      },

      rightIcon: {
        right: 4
      },

      avatars: {
        position: 'absolute',
        top: singleSmallAvatar ? (itemSize - leftAvatarSize)/2 : 10,
      },

      label: {
        cursor: 'pointer',
      },

      leftAvatar: {
        left: ((singleSmallAvatar ? 48 : 60) - leftAvatarSize)/2,
      },

      rightAvatar: {
        right: 10,
      },

      leftCheckbox: {
        position: 'absolute',
        display: 'block',
        width: 24,
        top: twoLine ? 24 : singleAvatar ? 16 : 12,
        left: 8,
      },

      primaryText: {
      },

      rightIconButton: {
        position: 'absolute',
        display: 'block',
        top: twoLine ? 12 : singleAvatar ? 4 : 0,
        right: 4,
      },

      rightToggle: {
        position: 'absolute',
        display: 'block',
        width: 54,
        top: twoLine ? 25 : singleAvatar ? 17 : 13,
        right: 8,
      },

      secondaryText: {
        fontSize: 12,
        lineHeight: threeLine ? '18px' : '16px',
        height: threeLine ? 36 : 16,
        margin: 0,
        marginTop: 4,
        color: Typography.textLightBlack,

        //needed for 2 and 3 line ellipsis
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: threeLine ? null : 'nowrap',
        display: threeLine ? '-webkit-box' : null,
        WebkitLineClamp: threeLine ? 2 : null,
        WebkitBoxOrient: threeLine ? 'vertical' : null,
      },
    };

    let contentChildren = [children];

    if (leftIcon) {
      this._pushElement(
        contentChildren,
        leftIcon,
        Object.assign({}, styles.icons, styles.leftIcon)
      );
    }

    if (rightIcon) {
      this._pushElement(
        contentChildren,
        rightIcon,
        Object.assign({}, styles.icons, styles.rightIcon)
      );
    }

    if (leftAvatar) {
      this._pushElement(
        contentChildren,
        leftAvatar,
        Object.assign({}, styles.avatars, styles.leftAvatar)
      );
    }

    if (rightAvatar) {
      this._pushElement(
        contentChildren,
        rightAvatar,
        Object.assign({}, styles.avatars, styles.rightAvatar)
      );
    }

    if (leftCheckbox) {
      this._pushElement(
        contentChildren,
        leftCheckbox,
        Object.assign({}, styles.leftCheckbox)
      );
    }

    //RightIconButtonElement
    const hasNestListItems = nestedItems.length;
    const hasRightElement = rightAvatar || rightIcon || rightIconButton || rightToggle;
    const needsNestedIndicator = hasNestListItems && autoGenerateNestedIndicator && !hasRightElement;

    if (rightIconButton || needsNestedIndicator) {
      let rightIconButtonElement = rightIconButton;
      let rightIconButtonHandlers = {
        onKeyboardFocus: this._handleRightIconButtonKeyboardFocus,
        onMouseEnter: this._handleRightIconButtonMouseEnter,
        onMouseLeave: this._handleRightIconButtonMouseLeave,
        onTouchTap: this._handleRightIconButtonTouchTap,
        onMouseDown: this._handleRightIconButtonMouseUp,
        onMouseUp: this._handleRightIconButtonMouseUp,
      };

      // Create a nested list indicator icon if we don't have an icon on the right
      if (needsNestedIndicator) {
        rightIconButtonElement = this.state.open ?
          <IconButton><OpenIcon /></IconButton> :
          <IconButton><CloseIcon /></IconButton>;
        rightIconButtonHandlers.onTouchTap = this._handleNestedListToggle;
      }

      this._pushElement(
        contentChildren,
        rightIconButtonElement,
        Object.assign({}, styles.rightIconButton),
        rightIconButtonHandlers
      );
    }

    if (rightToggle) {
      this._pushElement(
        contentChildren,
        rightToggle,
        Object.assign({}, styles.rightToggle)
      );
    }

    if (primaryText) {
      const secondaryTextElement = this._createTextElement(
        styles.primaryText,
        primaryText,
        'primaryText'
      );
      contentChildren.push(secondaryTextElement);
    }

    if (secondaryText) {
      const secondaryTextElement = this._createTextElement(
        styles.secondaryText,
        secondaryText,
        'secondaryText'
      );
      contentChildren.push(secondaryTextElement);
    }

    const nestedList = nestedItems.length ? (
      <NestedList nestedLevel={nestedLevel + 1} open={this.state.open}>
        {nestedItems}
      </NestedList>
    ) : undefined;

    return hasCheckbox ? this._createLabelElement(styles, contentChildren) :
      disabled ? this._createDisabledElement(styles, contentChildren) : (
      <div>
        <EnhancedButton
          {...other}
          disabled={disabled}
          disableKeyboardFocus={disableKeyboardFocus || this.state.rightIconButtonKeyboardFocused}
          linkButton={true}
          onKeyboardFocus={this._handleKeyboardFocus}
          onMouseLeave={this._handleMouseLeave}
          onMouseEnter={this._handleMouseEnter}
          onTouchStart={this._handleTouchStart}
          onTouchTap={onTouchTap}
          ref="enhancedButton"
          style={Object.assign({}, styles.root, style)}>
          <div style={Object.assign({}, styles.innerDiv, innerDivStyle)}>
            {contentChildren}
          </div>
        </EnhancedButton>
        {nestedList}
      </div>
    );

  },

  applyFocusState(focusState) {
    const button = this.refs.enhancedButton;
    const buttonEl = ReactDOM.findDOMNode(button);

    if (button) {
      switch(focusState) {
        case 'none':
          buttonEl.blur();
          break;
        case 'focused':
          buttonEl.focus();
          break;
        case 'keyboard-focused':
          button.setKeyboardFocus();
          buttonEl.focus();
          break;
      }
    }
  },

  _createDisabledElement(styles, contentChildren) {
    const {
      innerDivStyle,
      style,
    } = this.props;

    const mergedDivStyles = this.mergeAndPrefix(
      styles.root,
      styles.innerDiv,
      innerDivStyle,
      style
    );

    return React.createElement('div', { style: mergedDivStyles }, contentChildren);
  },

  _createLabelElement(styles, contentChildren) {
    const {
      innerDivStyle,
      style,
    } = this.props;

    const mergedLabelStyles = this.mergeAndPrefix(
      styles.root,
      styles.innerDiv,
      innerDivStyle,
      styles.label,
      style
    );

    return React.createElement('label', { style: mergedLabelStyles }, contentChildren);
  },

  _createTextElement(styles, data, key) {
    const isAnElement = React.isValidElement(data);
    const mergedStyles = isAnElement ?
      Object.assign({}, styles, data.props.style) : null;

    return isAnElement ? (
      React.cloneElement(data, {
        key: key,
        style: mergedStyles,
      })
    ) : (
      <div key={key} style={styles}>
        {data}
      </div>
    );
  },

  _handleKeyboardFocus(e, isKeyboardFocused) {
    this.setState({isKeyboardFocused: isKeyboardFocused});
    this.props.onKeyboardFocus(e, isKeyboardFocused);
  },

  _handleMouseEnter(e) {
    if (!this.state.touch) this.setState({hovered: true});
    this.props.onMouseEnter(e);
  },

  _handleMouseLeave(e) {
    this.setState({hovered: false});
    this.props.onMouseLeave(e);
  },

  _handleNestedListToggle(e) {
    e.stopPropagation();
    this.setState({open : !this.state.open});
    this.props.onNestedListToggle(this);
  },

  _handleRightIconButtonKeyboardFocus(e, isKeyboardFocused) {
    const iconButton = this.props.rightIconButton;
    let newState = {};

    newState.rightIconButtonKeyboardFocused = isKeyboardFocused;
    if (isKeyboardFocused) newState.isKeyboardFocused = false;
    this.setState(newState);

    if (iconButton && iconButton.props.onKeyboardFocus) iconButton.props.onKeyboardFocus(e, isKeyboardFocused);
  },

  _handleRightIconButtonMouseDown(e) {
    const iconButton = this.props.rightIconButton;
    e.stopPropagation();
    if (iconButton && iconButton.props.onMouseDown) iconButton.props.onMouseDown(e);
  },

  _handleRightIconButtonMouseLeave(e) {
    const iconButton = this.props.rightIconButton;
    this.setState({rightIconButtonHovered: false});
    if (iconButton && iconButton.props.onMouseLeave) iconButton.props.onMouseLeave(e);
  },

  _handleRightIconButtonMouseEnter(e) {
    const iconButton = this.props.rightIconButton;
    this.setState({rightIconButtonHovered: true});
    if (iconButton && iconButton.props.onMouseEnter) iconButton.props.onMouseEnter(e);
  },

  _handleRightIconButtonMouseUp(e) {
    const iconButton = this.props.rightIconButton;
    e.stopPropagation();
    if (iconButton && iconButton.props.onMouseUp) iconButton.props.onMouseUp(e);
  },

  _handleRightIconButtonTouchTap(e) {
    const iconButton = this.props.rightIconButton;

    //Stop the event from bubbling up to the list-item
    e.stopPropagation();
    if (iconButton && iconButton.props.onTouchTap) iconButton.props.onTouchTap(e);
  },

  _handleTouchStart(e) {
    this.setState({touch: true});
    this.props.onTouchStart(e);
  },

  _pushElement(children, element, baseStyles, additionalProps) {
    if (element) {
      const styles = Object.assign({}, baseStyles, element.props.style);
      let props = Object.assign({key: children.length, style: styles}, additionalProps);
      children.push(
        React.cloneElement(element, props)
      );
    }
  },

});

module.exports = ListItem;
