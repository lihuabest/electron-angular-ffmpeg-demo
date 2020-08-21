import { EventEmitter } from 'events';
import { spawn } from 'child_process';
import { getFile } from './tool';

export class ChannelConfig {
    public channelId?: string;
    public channelName?: string;
    public channelUrl: string;
}

export class Channel {

    public config: ChannelConfig;
    public ffmpeg;
    public emitter: EventEmitter;
    public isLive = false;
    public firstBuffer;

    public constructor(config: ChannelConfig) {
        this.config = config;
        this.emitter = new EventEmitter();
        this.emitter.setMaxListeners(0);
    }

    public startStream(): void {
        // -stimeout 10000000 超时10秒
        let ffmpegString = '';
        if (this.config.channelUrl.indexOf('rtsp://') > -1) {
            ffmpegString = '-rtsp_transport tcp -loglevel error -stimeout 10000000 -max_delay 500000 -buffer_size 102400 -i ' + this.config.channelUrl + ' -c:v copy -an -f flv pipe:1';
        }
        if (this.config.channelUrl.indexOf('rtmp://') > -1) {
            ffmpegString = '-loglevel error -i ' + this.config.channelUrl + ' -c:v copy -an -f flv pipe:1';
        }

        // 解码
        this.ffmpeg = spawn(getFile('libs/ffmpeg.exe'), ffmpegString.split(' '), { stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'] });

        // 关闭
        this.ffmpeg.on('close', () => {
            console.log('ffmpeg close url: ' + this.config.channelUrl);
            this.emitter.emit('close', true); // 一些原因（拉流失败） ffmpeg关闭了
        });

        // 报错
        this.ffmpeg.stderr.on('data', buffer => {
            console.log('ffmpeg output: ' + buffer.toString());
        });

        // 输出
        this.ffmpeg.stdio[1].on('data', buffer => {
            if (Buffer.isBuffer(buffer)) {
                // 第一帧很特殊 全局保存
                if (!this.firstBuffer) {
                    this.firstBuffer = buffer;
                    this.isLive = true;

                    console.log('ffmpeg start url: ' + this.config.channelUrl);
                }

                this.emitter.emit('data', buffer);
            }
        });
    }
}
