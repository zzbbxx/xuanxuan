import React               from 'react';
import Theme               from '../../theme';
import {App, Lang, Config} from '../../app';

const STYLE = {
    iframe: {width: '100%', height: '100%'}
};

// display app component
const Page = React.createClass({
    getInitialState() {
        return {
            url: App.user.zentao
        };
    },
    render() {
        return <div {...this.props}>
          
        </div>
    }
});

export default Page;
