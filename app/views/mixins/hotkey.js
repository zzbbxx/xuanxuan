import Events from 'material-ui/utils/events';

/**
 * React mixin: Hotkey
 */
const Hotkey = {

    /**
     * handle key press event
     * @param  {Object} e
     * @return {Void}
     */
    // onHotkeyPress(e) {}

    componentDidMount() {
        this._onHotkeyPress();
        if (!this.manuallyBindResize) this._bindEvent();
    },

    componentWillUnmount() {
        this._unbindEvent();
    },

    _onHotkeyPress(e) {
        return this.onHotkeyPress && this.onHotkeyPress(e);
    },

    _getHotkeyWindow() {
        return this.getHotkeyWindow ? this.getHotkeyWindow() : window;
    },

    _bindEvent() {
        Events.on(this._getHotkeyWindow(), 'keypress', this._onHotkeyPress);
    },

    _unbindEvent() {
        Events.off(this._getHotkeyWindow(), 'keypress', this._onHotkeyPress);
    },
};

export default Hotkey;
