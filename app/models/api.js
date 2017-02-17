import Request          from 'request';
import RequestProgress  from 'request-progress';
import ZentaoConfig     from './zentao-config';
import Member           from './member';
import FS               from 'fs';

const ZENTAO_CONFIG_URL_SURFFIX = 'index.php?mode=getconfig';

// Use cookie in request
// Request.debug = true;

/**
 * Get text content from remote url
 * @param  {String}   url
 * @return {Promise}
 */
function getText(url) {
    return new Promise((resolve, reject) => {
        Request(url, {
            rejectUnauthorized: false
        }, function(error, response, body){
            if(error) {
                error.code = 'WRONG_CONNECT';
            } else if(response.statusCode === 200) {
            } else {
                error = new Error('Status code is not 200.');
                error.response = response;
                error.code = 'WRONG_CONNECT';
            }
            if(DEBUG) {
                console.groupCollapsed('%cHTTP GET ' + url, 'font-weight: bold; color: ' + (error ? 'red' : 'blue'));
                console.log('response', response);
                console.log('body', body);
                if(error) console.error('error', error);
                console.groupEnd();
            }

            if(error) reject(error);
            else resolve(body);
        });
    });
}

/**
 * Get JSON object form remote url
 * @param  {String}   url
 * @return {Promise}
 */
function getJSON(url) {
    return new Promise((resolve, reject) => {
        getText(url).then(text => {
            let json, error;
            try {
                json = JSON.parse(text);
            } catch(err) {
                err.code = 'WRONG_DATA';
                error = err;
            }
            if(DEBUG) {
                console.groupCollapsed('%cHTTP GET JSON ' + url, 'font-weight: bold; color: ' + (error ? 'red' : 'blue'));
                console.log('json', json);
                if(error) console.log('error', error);
                console.groupEnd();
            }

            if(json) resolve(json);
            else reject(error);
        }).catch(reject);
    });
}

/**
 * Concat zentao url with params
 * @param  {Object} params
 * @param  {User} user
 * @return {String}
 */
function concalUrl(params, user) {
    let moduleName = params.module || 'api';
    let methodName = params.method;
    let moduleNameIdentifier = moduleName.toLowerCase();
    let methodNameIdentifier = methodName.toLowerCase();
    let viewType = params.viewType || 'json';
    let url = user.zentao;
    if(user.zentaoConfig.name && user.zentaoConfig.name === 'ranzhi') {
        url += 'sys/';
    }
    let sessionName = user.zentaoConfig.sessionName || user.zentaoConfig.sessionVar || 'sid';
    let sessionID = user.sid || user.zentaoConfig.sessionID;
    // let sessionID = user.zentaoConfig.sessionID || user.sid;

    if(user.zentaoConfig.isPathInfoRequestType) {
        if(moduleNameIdentifier === 'user' && methodNameIdentifier === 'login') {
            url += `user-login.${viewType}`
                + `?account=${user.account}&password=${user.passwordMD5WithRand}`
                + `&${sessionName}=${sessionID}`;
            return url;
        }

        url += `${moduleName}-${methodName}-`;

        if(moduleNameIdentifier === 'api') {
            if(methodNameIdentifier === 'mobilegetlist') {
                url += (params['type'] || 'full') + '-';
                url += (params['object'] || 'all') + '-';
                url += (params['range'] || '0') + '-';
                url += (params['last'] || '') + '-';
                url += (params['records'] || '1000') + '-';
                url += (params['format'] || 'index');
            } else if(methodNameIdentifier === 'mobilegetinfo') {
                url += params['id'] + '-' + params['type'];
                if(params['history']) {
                    url += '-' + params['history'];
                }
            } else if(methodNameIdentifier === 'mobilecomment') {
                url += params['id'] + '-' + params['type'];
            }
        } else {
            if(params['_params']) {
                for(let paramKey in params['_params']) {
                    url += params['_params'][paramKey] + '-';
                }
            }
        }

        if(url.endsWith('-')) {
            url = url.substr(0, url.length - 1)
        }

        url += `.${viewType}?${sessionName}=${sessionID}`;
    } else {
        url += 'index.php?';
        if(moduleNameIdentifier === 'user' && methodNameIdentifier === 'login') {
            url += `m=user&f=login&account=${user.account}`;
            url += `&password=${user.passwordMD5WithRand}`;
            url += `&${sessionName}`;
            url += `=\${sessionID}`;
            url += `&t=${viewType}`;
            return url;
        }

        url += `m=${moduleName}&f=${methodName}`;

        if(moduleNameIdentifier === 'api') {
            if(methodNameIdentifier === 'mobilegetlist') {
                url += '&type=' + (params['type'] || 'full');
                url += '&object=' + (params['object'] || 'all');
                url += '&range=' + (params['range'] || '0');
                url += '&last=' + (params['last'] || '');
                url += '&records=' + (params['records'] || 'all');
                url += '&format=' + (params['format'] || 'index');
            } else if (methodNameIdentifier === 'mobilegetinfo') {
                url += '&id=' + params['id'] + '&type=' + params['type'];
                if(params['history'])  {
                    url += '&history=' + params['history'];
                }
            } else if(methodNameIdentifier === 'mobilecomment') {
                url += '&id=' + params['id'] + '&type=' + params['type'];
            }
        } else {
            if(params['_params']) {
                for(let paramKey in params['_params']) {
                    url += '&' + paramKey + '=' + params['_params'][paramKey];
                }
            }
        }

        if(!params['type']) {
            url += '&type=' + viewType;
        }

        url += `&${sessionName}=${sessionID}`;
    }

    return url;
}

/**
 * Get zentao config with remote adress
 * @param  {String}   zentaoAddress
 * @return {Promise}
 */
function getZentaoConfig(zentaoAddress) {
    return new Promise((resolve, reject) => {
        getJSON(zentaoAddress + ZENTAO_CONFIG_URL_SURFFIX).then(json => {
            resolve(new ZentaoConfig(json));
        }).catch(reject);
    });
}

/**
 * Try get zentao config if need
 * @param  {User} user
 * @return {Promise}
 */
function tryGetZentaoConfig(user) {
    if(user.zentaoConfig && !user.zentaoConfig.isExpired) {
        return Promise.resolve(user.zentaoConfig);
    }
    return getZentaoConfig(user.zentao);
}

/**
 * Login in zentao with http method
 * @param  {User}   user
 * @return {Promise}
 */
function login(user) {
    return new Promise((resolve, reject) => {
        tryGetZentaoConfig(user).then(config => {
            if(config.isZentaoAPIAvailable) {
                user.zentaoConfig = config;
                return getJSON(concalUrl({
                    'module': 'user',
                    'method': 'login'
                }, user));
            } else {
                let error = new Error('The zentao version is not support now.');
                error.code = 'UNSUPPORT_VERSION';
                reject(error);
            }
        }).then(json => {
            if(json.status === 'success') {
                user.httpLoginTime = new Date().getTime();
                resolve(json.user);
            } else {
                let error = new Error('WRONG_ACCOUNT');
                error.reason = json.reason || json.message;
                error.code = 'WRONG_ACCOUNT';
                reject(error);
            }
        }).catch(reject);
    });
}

/**
 * Try login if need
 * @param  {User} user
 * @return {Promise}
 */
function tryLogin(user) {
    if(user.zentaoConfig && user.httpLoginTime && !user.zentaoConfig.isExpired) {
        return Promise.resolve(user);
    }
    return login(user);
}

/**
 * Get json data from zentao server
 * @return {Promise}
 */
function getJSONData(url) {
    return new Promise((resolve, reject) => {
        getJSON(url).then(json => {
            if(json.status === 'success') {
                resolve(json.data);
            } else {
                let error = new Error(json.message || json.reason || ('The server data status is ' + json.status));
                error.code = 'WRONG_STATUS';
                reject(error);
            }
        }).catch(reject);
    });
}

/**
 * Create file download link
 * @param  {Number} fileId
 * @param  {User}   user
 * @return {String}
 */
function createFileDownloadLink(fileId, user) {
    return concalUrl({
        'module': 'attach',
        'method': 'download',
        _params: {fileID: fileId}
    }, user);
}

/**
 * Upload file with http method
 * @param  {Object} file
 * @param  {User}   user
 * @param  {Object} params
 * @return {Promise}
 */
function uploadFile(files, user, data = {}) {
    return new Promise((resolve, reject) => {
        let url = concalUrl({
            'module': 'attach',
            'method': 'upload',
        }, user);
        const fileReader = new window.FileReader();
        fileReader.onload = function(e) {
            const filename = files.filename || files.name;
            let jar = Request.jar();
            let cookie = Request.cookie('sid=' + user.sid);
            jar.setCookie(cookie, url);
            Request.defaults({jar});
            Request({
                method: 'POST',
                uri: url,
                headers: { 'Content-Type': 'multipart/form-data'},
                rejectUnauthorized: false,
                multipart: {
                    chunked: false,
                    data: [
                        {
                            'Content-Disposition': 'form-data; name="files[]"; filename="' + filename + '"',
                            body: e.target.result
                        }, {
                            'Content-Disposition': 'form-data; name="gid"',
                            body: data.gid
                        }
                    ]
                }
            }, (error, response, body) => {
                let json = null;
                if(error) {
                    error.code = 'WRONG_CONNECT';
                } else if(response.statusCode === 200) {
                    try {
                        let bodyJson = JSON.parse(body);
                        if(bodyJson.result === 'success' && bodyJson.data) {
                            bodyJson = bodyJson.data;
                            json = Array.isArray(bodyJson) && bodyJson.length === 1 ? bodyJson[0] : bodyJson;
                        } else {
                            error = new Error('Server return wrong data.');
                            error.code = 'WRONG_DATA';
                        }
                    } catch(err) {
                        if(body.indexOf("user-deny-attach-upload") > 0) {
                            err.code = 'USER_DENY_ATTACT_UPLOAD';
                        } else {err.code = 'WRONG_DATA';}
                        error = err;
                    }
                } else {
                    error = new Error('Status code is not 200.');
                    error.response = response;
                    error.code = 'WRONG_CONNECT';
                }
                if(DEBUG) {
                    console.groupCollapsed('%cHTTP UPLOAD ' + url, 'font-weight: bold; color: ' + (error ? 'red' : 'blue'));
                    console.log('files', files);
                    console.log('response', response);
                    console.log('body', body);
                    if(error) console.error('error', error);
                    console.groupEnd();
                }

                if(error) reject(error);
                else resolve(json || body);
            });
        };

        let fileBuffer = FS.readFileSync(files.path);
        let arrayBuffer = Uint8Array.from(fileBuffer).buffer;
        fileReader.readAsArrayBuffer(new Blob([arrayBuffer]));
    });
}

/**
 * Download file with http method
 * @param  {Object} file
 * @param  {Function} onProgress
 * @return {Promise}
 */
function downloadFile(file, user, onProgress) {
    onProgress = onProgress || (state => {
        if(DEBUG) console.log('DOWNLOAD FILE PROGRESS', {file,state});
    });
    return new Promise((resolve, reject) => {
        let jar = Request.jar();
        let cookie = Request.cookie('sid=' + user.sid);
        // jar.setCookie(cookie, url);
        Request.defaults({jar});

        RequestProgress(Request(file.url, {jar, rejectUnauthorized: false}), {
            // throttle: 2000,
            // delay: 0,
            // lengthHeader: 'x-transfer-length'
        }).on('end', e => {
            if(DEBUG) {
                console.groupCollapsed('%cHTTP DOWNLOAD ' + file.url, 'font-weight: bold; color: blue');
                console.log('file', file);
                console.log('body', e);
                console.groupEnd();
            }
            resolve(e);
        })
          .on('progress', onProgress)
          .on('error', reject)
          .pipe(FS.createWriteStream(file.path));
    });
}

/**
 * Try upload file with http method, login request first if need
 * @param  {Object} file
 * @param  {User}   user
 * @param  {Object} params
 * @return {Promise}
 */
function tryUploadFile(file, user, params) {
    return tryLogin(user).then(() => {
        return uploadFile(file, user, params);
    });
}

/**
 * Logout zentao with http method
 * @param  {User} user
 * @return {Promise}
 */
function logout(user) {
    let url = user.zentao.endsWith('/') ? user.zentao : (user.zentao + '/');
    if(user.zentaoConfig.isPathInfoRequestType) {
        url += 'user-logout.html';
    } else {
        url += '/index.php?m=user&f=logout';
    }
    return getText(url);
}

/**
 * Get zentao users with http method
 * @return {Promise}
 */
function getMembers(user) {
    return new Promise((resolve, reject) => {
        getJSONData(concalUrl({
            'module': 'api',
            'method': 'mobileGetUsers'
        }, user)).then(data => {
            resolve(data.map(user => new Member(user)));
        }).catch(reject);
    });
}

let Api = {
    getText,
    getJSON,
    getZentaoConfig,
    login,
    logout,
    getMembers,
    uploadFile,
    tryUploadFile,
    tryLogin,
    createFileDownloadLink,
    downloadFile
};

export {
    getText,
    getJSON,
    getZentaoConfig,
    login,
    logout,
    getMembers,
    uploadFile,
    tryUploadFile,
    tryLogin,
    createFileDownloadLink,
    downloadFile
};
export default Api;
