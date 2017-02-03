import Events from 'material-ui/utils/events';

/**
 * React mixin: Resizable
 */
const Resizable = {

    /**
     * On window resize callback
     * @param  {Number} windowWidth
     * @return {Void}
     */
    // onWindowResize(windowWidth) {}

    componentDidMount() {
        this._onWindowResize();
        if (!this.manuallyBindResize) this._bindResize();
    },

    componentWillUnmount() {
        this._unbindResize();
    },

    _onWindowResize() {
        return this.onWindowResize && this.onWindowResize(window.innerWidth);
    },

    _bindResize() {
        Events.on(window, 'resize', this._onWindowResize);
    },

    _unbindResize() {
        Events.off(window, 'resize', this._onWindowResize);
    },
};

export default Resizable;
