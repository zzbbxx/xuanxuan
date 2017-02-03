import React               from 'react';
import PureRenderMixin     from 'react-addons-pure-render-mixin';
import Theme               from '../../theme';
import ReactDOM            from 'react-dom';
import Cheerio             from 'cheerio';

const Helper = global.Helper;

const AreaSelector = React.createClass({
    mixins: [PureRenderMixin],

    getInitialState() {
        return {
            isEmptyContent: true
        };
    },

    getContent() {
        return this.content;
    },

    clearContent() {
        this.setContent('');
        this.imageCache = {};
    },

    setContent(content, ignoreUpdate) {
        this.content = content;
        let editArea = ReactDOM.findDOMNode(this.editArea);

        if(!ignoreUpdate) editArea.innerHTML = content;

        let isEmptyContent = Helper.isEmptyString(this.content);
        if(this.state.isEmptyContent !== isEmptyContent) {
            this.setState({isEmptyContent});
        }

        this.props.onChange && this.props.onChange(content, editArea);
    },

    getContentList() {
        let contents = [];
        if(Helper.isNotEmptyString(this.content)) {
            let content = this.content;
            let thisTextContent = '';
            let tagPosition = content.indexOf('<');

            if(tagPosition < 0) {
                thisTextContent = content;
            } else {
                if(tagPosition > 0) {
                    content = '<div>' + content.substring(0, tagPosition) + '</div>' + content.substring(tagPosition);
                }
                let $ = Cheerio.load(content);
                let $root = $.root();
                let $nodes = $root.children();
                
                if($nodes.length > 0) {
                    $nodes.each((nodeIndex, node) => {
                        let $node = $(node);
                        let $img = $node.find('img');
                        if($img.length) {
                            if(Helper.isNotEmptyString(thisTextContent)) {
                                contents.push({type: 'text', content: thisTextContent});
                                thisTextContent = '';
                            }
                            let imageUrl = $img.attr('src');
                            contents.push({type: 'image', image: this.imageCache[imageUrl]});
                            let imgText = $node.text().trim();
                            if(Helper.isNotEmptyString(imgText)) {
                                if(thisTextContent !== '') thisTextContent += '\n';
                                thisTextContent += imgText;
                            }
                        } else {
                            if(thisTextContent !== ''
                               && node.name !== 'span'
                               && node.name !== 'i'
                               && node.name !== 'em'
                               && node.name !== 'b'
                               && node.name !== 'strong') thisTextContent += '\n';
                            thisTextContent += $node.html();
                        }
                    });
                } else {
                    thisTextContent = $root.html();
                }
            }

            if(Helper.isNotEmptyString(thisTextContent)) {
                contents.push({type: 'text', content: thisTextContent});
                thisTextContent = '';
            }
        }
        // console.info('EDITBOX CONTENTS', contents);
        return contents;
    },

    appendContent(content, asNewLine) {
        if(asNewLine) content = '<div>' + content + '</div>';
        else content = '<span>' + content + '</span>';
        this.setContent((this.content || '') + content);
    },

    appendImage(image) {
        this.imageCache[image.path] = image;
        this.appendContent('<div><img style="margin: 0 0 4px 0" src="' + image.path + '" ></div>');
    },

    focus(keepCaretPosition) {
        let editArea = ReactDOM.findDOMNode(this.editArea);
        if(!keepCaretPosition) {
            let range = document.createRange();
            range.selectNodeContents(editArea);
            range.collapse(false);
            let selection = window.getSelection();
            selection.removeAllRanges();
            selection.addRange(range);
        }

        editArea.focus();
    },

    _handleContentChange(e) {
        this.setContent(e.target.innerHTML, true);
    },

    componentDidMount() {
        this.imageCache = {};
        if(this.props.defaultValue !== undefined) {
            this.setContent(this.props.defaultValue);
        }
    },

    render() {
        const STYLE = {
            main: {
                position: 'relative',
            },
            placeholder: {
                color: Theme.color.disabled,
            },
            editStyle: {
                outline: 'none'
            }
        };

        let {
            style,
            editStyle,
            placeholder,
            defaultValue,
            placeholderStyle,
            ...other
        } = this.props;

        style = Object.assign({}, STYLE.main, style);
        editStyle = Object.assign({}, STYLE.editStyle, editStyle);
        placeholderStyle = Object.assign({}, STYLE.placeholder, placeholderStyle);

        return <div {...other} style={style}>
          {placeholder && this.state.isEmptyContent ? <div className="dock-full" style={placeholderStyle}>{placeholder}</div> : null}
          <div
            ref={(e) => this.editArea = e}
            onInput={this._handleContentChange}
            contentEditable="true"
            className="dock-full scroll-y"
            style={editStyle}
            dangerouslySetInnerHTML={{__html: this.content}}/>
        </div>
    }
});

export default AreaSelector;
