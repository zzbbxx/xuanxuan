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
            selected,
            ...other
        } = this.props;

        selected = selected || tabs[0].key;

        return <div className='tabs' {...other} style={style}>
        {
            tabs.map(tab => {
                let className = 'tab';
                if(selected === tab.key) className += ' active';
                return <div onClick={() => {return this.props.onTabClick && this.props.onTabClick(tab.key)}} className={className} key={tab.key} style={STYLE.tab}>{tab.label}</div>;
            })
        }
        </div>
    }
});

export default Tabs;
