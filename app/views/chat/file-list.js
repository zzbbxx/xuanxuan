import React               from 'react';
import Theme               from '../../theme';
import {App, Lang, Config} from '../../app';
import Spinner             from '../components/spinner';
import FileListItem        from './file-list-item';
import ContentNotReady     from '../misc/content-not-ready';

const FileList = React.createClass({

    getInitialState() {
        return {files: null}
    },

    _loadFiles(chatId) {
        if(!chatId) chatId = this.props.chatId;
        if(chatId) {
            App.chat.dao.getChatFiles(chatId).then(files => {
                if(files && Array.isArray(files)) {
                    files.sort((x, y) => y.date - x.date);
                }
                this.setState({files});
                this.props.onFilesLoad && this.props.onFilesLoad(files);
            });
        }
    },

    componentDidMount() {
        if(this.props.chatId) {
            this._loadFiles(this.props.chatId);
        }
    },

    render() {
        const STYLE = {
            item: {
                padding: 8,
                paddingRight: 0,
                borderBottom: '1px solid ' + Theme.color.border,
                width: '100%',
                backgroundColor: Theme.color.canvas,
                boxSizing: 'border-box'
            }
        };

        let {
            style,
            itemStyle,
            chatId,
            files,
            ...other
        } = this.props;

        if(this.state.files) {
            files = this.state.files;
        }

        let filesContent = null;
        if(files) {
            if(files.length) {
                filesContent = files.map(file => {
                    return <FileListItem showTime={true} showUser={true} style={Object.assign({}, STYLE.item, itemStyle)} key={file.gid} file={file} />;
                });
            } else {
                filesContent = <ContentNotReady iconName=':blowfish:' title={Lang.chat.emptyFileList}/>
            }
        }

        return <div {...other} style={style}>
            {filesContent ? filesContent : <Spinner/>}
        </div>
    }
});

export default FileList;
