import React               from 'react';
import Theme               from '../../theme';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import {App, Lang, Config} from '../../app';

// display app component
const MessageTip = React.createClass({
    mixins: [PureRenderMixin],

    render() {
        const STYLE = {
            main: {
                backgroundColor: Theme.color.canvas,
                padding: 10
            }
        };

        let {
            style,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);

        return <div {...other} style={style}>
          <h4 style={{margin: "5px 0 5px"}}>消息框小技巧</h4>
          <ul style={{paddingLeft: 20, marginBottom: 0}}>
            <li>拖拽图片和文件到消息框来发送；</li>
            <li>使用 Markdown 语法来发送富文本；</li>
            <li>你可以直接粘贴剪切板中的图片进行发送；</li>
            <li>发送 “<strong>$$name=会话名称</strong>” 来为多人会话重命名；</li>
            <li>发送 “<strong>$$version</strong>” 查询当前客户端版本。</li>
          </ul>
        </div>
    }
});

export default MessageTip;
