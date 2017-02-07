import React               from 'react';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import Theme               from '../../theme';

const STYLE = {
    tab: {
        transition: Theme.transition.normal('box-shadow', 'background-color', 'color')
    }
};

// display app component
const Tabs = React.createClass({
    mixins: [PureRenderMixin],
    
    render() {
        let {
            style,
            tabs,
            tabStyle,
            activeTabStyle,
            selected,
            ...other
        } = this.props;

        selected = selected || tabs[0].key;

        return <div className='tabs' {...other} style={style}>
        {
            tabs.map(tab => {
                let className = 'tab';
                let isActive = selected === tab.key;
                if(isActive) className += ' active';
                if(tab.hint) {
                    className += ' hint--' + (tab.hintPlacement || 'bottom');
                }
                return <div data-hint={tab.hint} onClick={() => {return this.props.onTabClick && this.props.onTabClick(tab.key)}} className={className} key={tab.key} style={Object.assign({}, STYLE.tab, tabStyle, isActive ? activeTabStyle : null)}>{tab.label}</div>;
            })
        }
        </div>
    }
});

export default Tabs;
