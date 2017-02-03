import React               from 'react';
import Theme               from '../../theme';
import {App, Lang, Config} from '../../app';

const STYLE = {
};

// display app component
const Page = React.createClass({
    render() {
        return <div {...this.props}><strong>Note</strong></div>
    }
});

export default Page;
