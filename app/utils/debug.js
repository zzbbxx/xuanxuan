const DEBUG = process.env.NODE_ENV === 'development';
global.DEBUG = DEBUG;

if(DEBUG) {
    // Mute react warning.
    console._error = console.error;
    console.error = (errMessage, ...args) => {
        if(typeof errMessage === 'string' && errMessage.indexOf('Warning: Unknown prop') === 0) {
            return;
        }
        return console._error(errMessage, ...args);
    };
}

export default DEBUG;