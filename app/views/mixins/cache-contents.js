import React from 'react';
import Theme from '../../theme';

const STYLE = {
    // content: {transition: Theme.transition.normal('opacity', 'visibility'), opacity: 0, visibility: 'hidden'},
    // displayContent: {opacity: 1, visibility: 'visible'},
    content: {display: 'none'},
    displayContent: {display: 'block'}
};

const CacheContents = {
    /**
     * Get display cache content id by given cache name
     * @param  {String} cacheName
     * @return {String}
     */
    // getDisplayCacheContentId(cacheName) {},

    /**
     * Render cache content by given contend id and cache name
     * @param  {String} contentId
     * @param  {String} cacheName
     * @return {React components}
     */
    // renderCacheContent(contentId, cacheName) {},
    
    removeCacheContent(contentId, cacheName = 'default') {
        if(this._contentsCache && this._contentsCache[cacheName] && this._contentsCache[cacheName][contentId]) {
            this._contentsCache[cacheName][contentId] = {remove: true};
        }
    },

    clearCache() {
        this._contentsCache = {};
    },

    /**
     * Render cache contents by given cache name
     * @param  {String} cacheName
     * @return {React components}
     */
    renderCacheContents(cacheName = 'default') {
        if(!this._contentsCache) this._contentsCache = {};
        let cache = this._contentsCache[cacheName];
        let displayContentId = this.getDisplayCacheContentId(cacheName);

        if(!cache) cache = {};
        if(displayContentId !== null && !cache[displayContentId]) cache[displayContentId] = {};

        let contents = [];
        Object.keys(cache).forEach(contentId => {
            let contentSetting = cache[contentId];
            if(contentSetting.remove) return;

            const isDisplayContent = contentId === displayContentId;
            if(isDisplayContent || contentSetting.content) {
                let contentStyle = Object.assign({}, STYLE.content);
                if(isDisplayContent) Object.assign(contentStyle, STYLE.displayContent);

                let content = !isDisplayContent && contentSetting.content ? contentSetting.content : this.renderCacheContent(contentId, cacheName);
                contents.push(<div data-cachecontent={`${cacheName}/${contentId}`} key={contentId} style={contentStyle}>{content}</div>);
                contentSetting.displayTime = new Date();
                contentSetting.content = content;
            }
        });

        this._contentsCache[cacheName] = cache;

        return contents;
    }
};

export default CacheContents;
