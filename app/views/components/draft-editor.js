import React, {Component}            from 'react';
import ReactDOM                      from 'react-dom';
import {
    Editor,
    EditorState,
    RichUtils,
    Entity,
    AtomicBlockUtils,
    convertToRaw,
    Modifier
}      from 'draft-js';
import Theme                         from 'Theme';

const ImageDraft = props => {
    const key = props.block.getEntityAt(0)
    if (!key) {
        return null
    }
    const entity = Entity.get(key);
    const type = entity.getType();
    if (type === 'image') {
        const data = entity.getData();
        return <img
            className="draft-editor-image"
            src={data.src}
            alt={data.alt || ''}
        />;
    }
    return null;
};

class DraftEditor extends Component {

    constructor(props) {
        super(props);
        this.state = {editorState: EditorState.createEmpty()};
    }

    getContent() {
        return this.state.editorState.getCurrentContent().getPlainText();
    }

    clearContent() {
        this.onChange(EditorState.createEmpty());
    }

    appendContent(content, asNewLine, callback) {
        const editorState = this.state.editorState;
        const selection = editorState.getSelection();
        const contentState = editorState.getCurrentContent();
        const ncs = Modifier.insertText(contentState, selection, content);
        const newEditorState = EditorState.push(editorState, ncs, 'insert-fragment');
        this.onChange(newEditorState);
    }

    getContentList() {
        let contents = [];
        const editorState = this.state.editorState;
        const contentState = editorState.getCurrentContent();
        const raw = convertToRaw(contentState);
        let thisTextContent = '';
        raw.blocks.forEach(block => {
            if(block.type === 'atomic') {
                if(block.entityRanges && block.entityRanges.length) {
                    contents.push({type: 'image', image: raw.entityMap[block.entityRanges[0].key].data.image});
                }
                if(thisTextContent.length) {
                    contents.push({type: 'text', content: thisTextContent});
                    thisTextContent = '';
                }
            } else {
                if(thisTextContent.length) {
                    thisTextContent += '\n';
                }
                thisTextContent += block.text;
            }
        });
        if(thisTextContent.length) {
            contents.push({type: 'text', content: thisTextContent});
        }
        return contents;
    }

    focus(delay = 100) {
        setTimeout(() => {
            this.editor.focus();
        }, delay);
    }

    appendImage(image, callback) {
        let {editorState} = this.state;
        const contentState = editorState.getCurrentContent();
        const contentStateWithEntity = contentState.createEntity(
            'image',
            'IMMUTABLE',
            {src: image.path, alt: image.name || '', image: image}
        );
        const entityKey = contentStateWithEntity.getLastCreatedEntityKey();
        const newEditorState = EditorState.set(
            editorState,
            {currentContent: contentStateWithEntity}
        );
        this.onChange(AtomicBlockUtils.insertAtomicBlock(newEditorState, entityKey, ' '), callback);
    }

    onChange(editorState, callback) {
        const contentState = editorState.getCurrentContent();
        this.setState({editorState}, () => {
            callback && callback(contentState);
            this.props.onChange && this.props.onChange(contentState);
        });
    }

    handleKeyCommand(command) {
        if(!this.props.handleKey) {
            return;
        }
        const newState = RichUtils.handleKeyCommand(this.state.editorState, command);
        if (newState) {
            this.onChange(newState);
            return 'handled';
        }
        return 'not-handled';
    }

    handleReturn(e) {
        this.props.onReturnKeyDown && this.props.onReturnKeyDown(e);
    }

    blockRendererFn(contentBlock) {
        const type = contentBlock.getType();
        let result = null;

        if (type === 'atomic') {
            result = {
                component: ImageDraft,
                editable: true,
            }
        }

        return result
    }

    render() {
        let {
            placeholder,
            ...other
        } = this.props;

        return <div {...other} onClick={e => {this.focus(0);}}>
            <Editor
                ref={e => {this.editor = e;}}
                placeholder={placeholder}
                editorState={this.state.editorState} 
                onChange={this.onChange.bind(this)}
                handleKeyCommand={this.handleKeyCommand.bind(this)}
                handleReturn={this.handleReturn.bind(this)}
                blockRendererFn={this.blockRendererFn.bind(this)}
            />
        </div>;
    }
}

export default DraftEditor;
