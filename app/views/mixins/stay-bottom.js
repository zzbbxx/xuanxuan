const StayBottom = {
    /**
     * Get Stay bottom element
     * @return {Object}
     */
    // getStayBottomElement() {},

    componentWillUpdate() {
        let element = this._getStayBottomElement();
        if(element) this.shouldScrollBottom = element.scrollTop + element.offsetHeight === element.scrollHeight;
    },
     
    componentDidUpdate() {
        this.checkStayBottomAndSroll();
    },

    checkStayBottomAndSroll() {
        if (this.shouldScrollBottom) {
            this._checkScrollToBottomTime = 300;
            this.scrollToBottom();
        }
    },

    scrollToBottom(time) {
        let element = this._getStayBottomElement();
        if(!element) return;
        let maxScrollTop = element.scrollHeight - element.offsetHeight;
        if(element.scrollTop !== maxScrollTop) {
            element.scrollTop = maxScrollTop;
        }
        if(time !== undefined) {
            this._checkScrollToBottomTime = time;
        }
        if(this._checkScrollToBottomTime || this._checkScrollToBottomTime > 0) {
            this._checkScrollToBottomTime -= 10;
            setTimeout(this.scrollToBottom, 10);
        }
    },

    _getStayBottomElement() {
        if(this.stayBottomElement) return this.stayBottomElement;
        if(this.getStayBottomElement) return this.getStayBottomElement();
        return null;
    },

    componentWillMount() {
        this.shouldScrollBottom = true;
    },

    componentDidMount() {
        this.checkStayBottomAndSroll();
    },
};

export default StayBottom;
