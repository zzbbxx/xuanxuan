import React               from 'react';
import Path                from 'path';

const ImageCutter = React.createClass({
    render() {
        let {
            sourceImage,
            style,
            imageStyle,
            ...other
        } = this.props;

        let imageUrl = 'file://' + Path.normalize(sourceImage).replace(/\\/g, '/');

        style = Object({
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center'
        }, style);

        return <div {...other} className='fix-full user-app-no-dragable' style={style}>
            <img src={imageUrl} alt={imageUrl} style={Object.assign({
                maxWidth: '100%',
                maxHeight: '100%',
                boxShadow: 'rgba(0, 0, 0, 0.247059) 0px 14px 45px, rgba(0, 0, 0, 0.219608) 0px 10px 18px'
            }, imageStyle)}/>
        </div>;
    }
});

export default ImageCutter;
