import UUID   from 'uuid';
import FS     from 'fs';

const PACK_SIZE = 1024 * 40;

class FileReadTask {

    constructor(file, options) {
        Object.assign(this, {
                file,
                packSize: PACK_SIZE,
                start: 0,
                end: file.size,
                stepByStep: true
            }, options);

        this.start = Math.min(this.file.size, Math.max(0, this.start));
        this.end = Math.min(this.file.size, Math.max(this.start, this.end));
        this.fileExt = this.file.name.substring(this.file.name.lastIndexOf('.'));

        this.reset();

        if(!this.gid) this.gid = UUID.v4();
    }

    reset() {
        this.cursor = -1;
        this.readableStream = null;
    }

    get isFinish() {
        return this.cursor >= this.end;
    }

    get isWaiting() {
        return this.cursor < 0;
    }

    get isReading() {
        return this.cursor >= this.start && this.cursor < this.end;
    }

    get status() {
        if(this.isWaiting) {
            return 'waiting';
        } else if(this.isReading) {
            return 'reading';
        }
        return 'finish';
    }

    get progress() {
        return (this.cursor - this.start) / (this.file.size  - this.start);
    }

    get speed() {
        if(!this.startTime) return 0;
        return  1000 * (this.cursor - this.start) / ((new Date().getTime()) - this.startTime);
    }

    read() {
        if(this.isFinish) return false;

        // console.info("FILE_READ_TASK read", this);

        if(!this.readableStream) {
            this.cursor = this.start;
            this.startTime = new Date().getTime();
            this.steps = 0;

            this.readableStream = FS.createReadStream(this.file.path, {
                highWaterMark: this.packSize,
                start: this.start,
                end: this.end
            });
            this.readableStream.on('data', chunk => {
                this.cursor += chunk.length;
                this.steps++;

                this.chunkData = {
                    fileExt: this.fileExt,
                    gid: this.gid,
                    filesize: this.file.size,
                    filename: this.file.name,
                    filetype: this.file.type,
                    cursor:  this.cursor,
                    size: chunk.length,
                    data: chunk.toString('base64'),
                };

                    
                this.chunk = chunk;

                // console.info('FILE_READ_TASK data', this.chunkData, this);

                this.onData && this.onData(this.chunkData, this);
                if(this.stepByStep) this.readableStream.pause();
            });
            this.readableStream.on('end', () => {
                // console.info('FILE_READ_TASK end', this);
                return this.onEnd && this.onEnd(this);
            });

            // console.info("FILE_READ_TASK creatStream", this.readableStream);
        } else {
            this.readableStream.resume();
        }

        return true;
    }
}


export default FileReadTask;
