import StringFormat from 'string-format';
import fs           from 'fs';
import os           from 'os';
import Marked       from 'marked';
import HighlightJS  from 'highlight.js';
import mkdirp       from 'mkdirp';

/**
 * Init markdown helpers
 */
Marked.setOptions({
    highlight: code => {
        return HighlightJS.highlightAuto(code).value;
    },
    gfm: true,
    sanitize: false
});

const OS_PLATFORM = os.platform();
let _guid = 0;

StringFormat.extend(String.prototype, {
    escape: function(s) {
        return s.replace(/[&<>"'`]/g, function(c) {
            return '&#' + c.charCodeAt(0) + ';';
        })
    },
    // upper: function(s) { return s.toUpperCase(); }
});

// set global variables
// global.document = window.document;
// global.navigator = window.navigator;

/**
 * Global helper methods
 */
global.Helper = {

    /**
     * Plain a object
     * @param  {object} obj
     */
    plain(obj) {
        if(obj === undefined) obj = this;
        if(Array.isArray(obj))
        {
            return obj.map(plain);
        }
        var objType = typeof obj;
        if(obj !== null && objType === 'object')
        {
            var plainObj = {};
            Object.keys(obj).forEach(key => {
                let val = obj[key];
                var typeVal = typeof val;
                if(key && key[0] !== '$' && typeVal !== 'function')
                {
                    plainObj[key] = typeVal === 'object' ? Helper.plain(val) : val;
                }
            });
            return plainObj;
        }
        if(objType === 'function') return;
        return obj;
    },

    /**
     * Apply markdown systax to text
     * @param  {string} content
     * @return {string}
     */
    markdown(content) {
        return Marked(content);
    },
    
    /**
     * Encode html
     * @param  {string} s
     * @return {string}
     */
    htmlEncode(s) {
        var div = document.createElement('div');
        div.appendChild(document.createTextNode(s));
        return div.innerHTML;
    },

    /**
     * Check whether the string is undefined or null or empty
     * @param  {string}  s
     * @return {boolean}
     */
    isEmptyString(s) {
        return s === undefined || s === null || s === '';
    },

    /**
     * Check whether the string is not undefined and null and empty
     * @param  {string}  s
     * @return {boolean}
     */
    isNotEmptyString(s) {
        return s !== undefined && s !== null && s !== '';
    },

    /**
     * Convert a arr to group as object
     * @param  {Array} arr
     * @param  {function} func
     * @return {object}
     */
    arrayGroup(arr, func) {
        let group = {};
        arr.forEach(x => {
            let name = func(x);
            if(group[name]) {
                group[name].push(x);
            } else {
                group[name] = [x];
            }
        });
        return group;
    },

    /**
     * Load json from file
     * @param  {string} filename
     * @param  {boolean} ignoreError
     * @return {Promise}
     */
    loadJSON(filename, ignoreError) {
        return new Promise((resolve, reject) => {
            fs.stat(filename, function(err, stats) {
                if(err) {
                    if(DEBUG) console.warn('Can\'t check file stats of ' + filename);
                    return ignoreError ? resolve() : reject(err);
                }

                if(stats.isFile()) {
                    fs.readFile(filename, 'utf8', function(err, data) {
                        if(err) {
                            if(DEBUG) console.warn('Can\'t read file from ' + filename);
                            return ignoreError ? resolve() : reject(err);
                        }

                        try {
                            let json = JSON.parse(data);
                            return resolve(json);
                        } catch(e) {
                            if(DEBUG) console.warn('Load json from a wrong format content.', {data, filename});
                            return ignoreError ? resolve() : reject(e);
                        }

                    });
                } else {
                    let error = new Error('File in ' + filename + ' not exists. stat: ' + configFileStat);
                    if(DEBUG) console.warn(error);
                    return ignoreError ? resolve() : reject(error);
                }
            });
        });
    },

    /**
     * Load json from file sync
     * @param  {string} filename
     * @param  {object} defaultJson
     * @return {object}
     */
    loadJSONSync(filename, defaultJson = null) {
        if(this.isFileExist(filename)) {
            try {
                let data = fs.readFileSync(filename, {encoding: 'utf8'});
                return JSON.parse(data);
            } catch(err) {
                console.error('Load json sync: ', err);
            }
        }
        return defaultJson;
    },

    /**
     * Write data as json text to a file
     * @param  {string} filename
     * @param  {object | string} data
     * @return {void}
     */
    writeDataSync(filename, data) {
        if(typeof data === 'object') {
            data = JSON.stringify(data);
        }
        fs.writeFileSync(filename, data, {encoding: 'utf8'});
    },

    writeData(filename, data, callback) {
        return new Promise((resolve, reject) => {
            if(typeof data === 'object') {
                data = JSON.stringify(data);
            }
            fs.writeFile(filename, data, 'utf8', (err) => {
                if(err) {
                    reject(err);
                } else {
                    resolve();
                }
                callback && callback(err);
            });
        });
    },

    /**
     * Try get a path stats
     * @param  {string} path
     * @return {FileStat}
     */
    tryStatSync(path) {
        try {
            return fs.statSync(path);
        } catch(e) {
            return false;
        }
    },

    /**
     * Check whether the path is exist
     * @param  {string}  path
     * @return {boolean}
     */
    isFileExist(path) {
        let stats = this.tryStatSync(path);
        return stats && stats.isFile();
    },

    /**
     * Delete file
     * 
     * @param {string} path
     * @return {Promise}
     */
    deleteFile(path) {
        return new Promise((resolve, reject) => {
            fs.unlink(path, err => {
                if(err) reject(err);
                else resolve(path);
            });
        });
    },

    /**
     * Try make directory
     * @param  {string} path
     * @return {boolean} result
     */
    tryMkdirSync(path) {
        let stats = this.tryStatSync(path);
        if(!stats || !stats.isDirectory()) {
            try {
                fs.mkdirSync(path);
            } catch(e) {
                if(DEBUG) console.warn('Helper.tryMkdirSync', path, e);
            }
            stats = this.tryStatSync(path);
            return stats && stats.isDirectory();
        }
        return true;
    },

    tryMkdirp(path) {
        return new Promise((resolve, reject) => {
            mkdirp(path, err => {
                if(err) reject(err);
                else resolve(path);
            });
        });
    },

    /**
     * Copy file
     * @param  {string} source
     * @param  {string} target
     * @return {Promise}
     */
    copyFile(source, target) {
        return new Promise(function(resolve, reject) {
            let readStream = fs.createReadStream(source);
            let writeStream = fs.createWriteStream(target);
            readStream.on('error', reject);
            writeStream.on('error', reject);
            writeStream.on('finish', resolve);
            readStream.pipe(writeStream);
        });
    },

    /**
     * Save image from buffer or base64 data url
     */
    saveImage(bufferOrBase64, filePath) {
        if(typeof bufferOrBase64 === 'string') {
            let matches = bufferOrBase64.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
            if (matches.length !== 3) {
                return Promise.reject(new Error('Invalid input string'));
            }
            bufferOrBase64 = new Buffer(matches[2], 'base64');
        } else if(bufferOrBase64.toPNG) {
            bufferOrBase64 = bufferOrBase64.toPNG();
        }
        return new Promise((resolve, reject) => {
            fs.writeFile(filePath, bufferOrBase64, err => {
                if(err) return reject(err);
                let data = {path: filePath, type: 'image/png'};
                resolve(data);
            });
        });
    },

        /**
     * Cut image
     * @param  {object} image
     * @param  {object} select
     * @return {Promise}
     */
    cutImage(image, select) {
        return new Promise((resolve, reject) => {
            let img = document.createElement('img');
            let canvas = document.createElement('canvas');
            canvas.width = select.width;
            canvas.height = select.height;

            img.onload = () => {
                let display = canvas.getContext('2d');
                display.drawImage(img, select.x, select.y, select.width, select.height, 0, 0, select.width, select.height);
                resolve({width: select.width, height: select.height, type: 'png', data: canvas.toDataURL('image/png')});
                img = canvas = display = null;
            };

            img.onerror = () => {
                reject(new Error('Cant not get user media.'));
                img = canvas = null;
            };

            img.src = 'file://' + image;
        });
    },

    /**
     * OS Platform
     * @type {string}
     */
    os: OS_PLATFORM,

    /**
     * Whether the OS is windows
     * @type {boolean}
     */
    isWindowsOS: OS_PLATFORM === 'win32' || OS_PLATFORM === 'win64',

    /**
     * Whether the OS is OSX
     * @type {boolean}
     */
    isOSX: OS_PLATFORM === 'osx',

    /**
     * Whether the OS is windows xp
     * @type {boolean}
     */
    isWinXP: (OS_PLATFORM === 'win32' || OS_PLATFORM === 'win64') && os.release().startsWith('5.'),

    /**
     * Get a new guid
     * @return {number}
     */
    get guid() {
        return _guid++;
    }
};

export default Helper;
