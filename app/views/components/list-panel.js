import React, {
    Component,
    PropTypes
}                             from 'react';
import ReactDOM               from 'react-dom';
import Colors                 from 'Utils/material-colors';
import Theme                  from 'Theme';
import Helper                 from 'Helper';
import List                   from 'material-ui/List/List';
import ArrowDownIcon          from 'material-ui/svg-icons/navigation/arrow-drop-down';
import ListItem               from './small-list-item';

class ListGroup extends Component {

    static propTypes = {
        expand: PropTypes.bool,
        onExpand: PropTypes.func,
        heading: PropTypes.any,
        items: PropTypes.any
    };

    static defaultProps = {
        expand: true
    };

    expand() {
        this.setState({expand: true});
    }

    collapse() {
        this.setState({expand: false});
    }

    toggle() {
        this.setState({expand: !this.isExpand()});
    }

    isExpand() {
        return (!this.state || this.state.expand === undefined) ? this.props.expand : this.state.expand;
    }

    componentDidUpdate(prevProps, prevState) {
        if(prevState && prevState.expand !== this.state.expand) {
            this.props.onExpand && this.props.onExpand(this.state.expand);
        }
    }

    render() {
        let {
            children,
            expand,
            heading,
            items,
            ...other
        } = this.props;

        if(this.state && this.state.expand !== undefined) {
            expand = this.state.expand;
        }

        let STYLE = {
            heading: {
                color: Theme.color.primary1,
            },
            headingIcon: {
                transition: Theme.transition.normal('transform'),
                opacity: 0.5,
                verticalAlign: 'middle'
            }
        };

        return <List {...other}>
            <ListItem key={'group-header-' + Helper.guid} onClick={this.toggle.bind(this)} primaryText={heading} leftIcon={<ArrowDownIcon className={expand ? 'rotate-360' : 'rotate-270'} color={Theme.color.primary1} style={STYLE.headingIcon} />} style={STYLE.heading}/>
            {expand ? (items || children) : null}
        </List>
    }
}

export default ListGroup;