import RecordRTC                     from "recordrtc";
import electron, { desktopCapturer } from "electron";

/* This is NEEDED because RecordRTC is badly written */
global.html2canvas = (canvas, obj) => {
    obj.onrendered(canvas);
};

const getStream = sourceId => {
    return new Promise((resolve, reject) => {
        desktopCapturer.getSources({ types: ['screen'] }, (error, sources) => {
            if (error) {
                reject(error);
                return;
            }

            const display = getDisplay(sourceId);
            const displayIndex = electron.screen.getAllDisplays().findIndex(item => item.id === sourceId);

            navigator.webkitGetUserMedia({
                audio: false,
                video: {
                    mandatory: {
                        chromeMediaSource: 'desktop',
                        chromeMediaSourceId: sources[displayIndex].id,
                        maxWidth: display.size.width,
                        maxHeight: display.size.height,
                        minWidth: display.size.width,
                        minHeight: display.size.height
                    }
                }
            }, resolve, reject);
        });
    });
};

const getVideo = stream => {
    const video = document.createElement('video');
    video.autoplay = true;
    video.src = URL.createObjectURL(stream);
    return new Promise(resolve => {
        video.addEventListener('playing', () => {
            resolve(video);
        });
    });
};

const getCanvas = (width, height) => {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    return canvas;
};

const drawFrame = ({ ctx, video, x, y, width, height, availTop = screen.availTop }) => {
    ctx.drawImage(video, x, y, width, height, 0, -availTop, width, height);
};

const getFrameImage = canvas => {
    return canvas.toDataURL();
};

const getDisplay = id => {
    if(id) return electron.screen.getAllDisplays().find(item => item.id === id);
    else return electron.screen.getPrimaryDisplay();
};

const getLoop = fn => {
    let requestId;
    const callFn = () => {
        requestId = requestAnimationFrame(callFn);
        fn();
    };
    callFn();
    return () => {
        cancelAnimationFrame(requestId);
    };
};

const startRecording = ({ canvas, video, x, y, width, height, availTop }) => {
    const recorder = RecordRTC(canvas, { type: 'canvas' });
    const ctx = canvas.getContext('2d');
    const stopLoop = getLoop(() => drawFrame({ ctx, video, x, y, width, height, availTop }));

    recorder.startRecording();

    return {
        stop() {
            return new Promise(resolve => {
                stopLoop();
                recorder.stopRecording(() => {
                    recorder.getDataURL(url => resolve({ url, width, height }));
                });
            });
        },
        pause() {
            recorder.pauseRecording();
        },
        resume() {
            recorder.resumeRecording();
        }
    };
};

const takeScreenshot = ({ x = 0, y = 0, width = 0, height = 0, sourceId = 0 }) => {
    let display = getDisplay(sourceId);
    const availTop = screen.availTop - display.bounds.y;
    sourceId = display.id;

    if(!width) width   = display.bounds.width;
    if(!height) height = display.bounds.height;

    return getStream(sourceId)
        .then(getVideo)
        .then(video => {
            const canvas = getCanvas(width, height);
            const ctx = canvas.getContext('2d');
            drawFrame({ ctx, video, x, y, width, height, availTop });
            return getFrameImage(canvas);
        });
};

const takeAllScreenshots = (options) => {
    if(!options) {
        options = electron.screen.getAllDisplays().map(item => {
            return {
                x: 0,
                y: 0,
                width: item.bounds.width,
                height: item.bounds.height,
                sourceId: item.id
            };
        });
    }
    if(Array.isArray(options)) {
        return Promise.all(options.map(option => {
            return takeScreenshot(option);
        }));
    } else {
        return takeScreenshot(options);
    }
};

const captureVideo = ({ x, y, width, height, sourceId }) => {
    let display = getDisplay(sourceId);
    const availTop = screen.availTop - display.bounds.y;
    sourceId = display.id;
    return getStream(sourceId)
        .then(getVideo)
        .then(video => {
            const canvas = getCanvas(width, height);
            return startRecording({ canvas, video, x, y, width, height, availTop });
        });
};

export { takeScreenshot, captureVideo, takeAllScreenshots };
export default takeScreenshot;
