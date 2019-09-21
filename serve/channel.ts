
const ffmpeg = require('fluent-ffmpeg');
import * as SocketIO from 'socket.io';
import * as fs from 'fs';
const webSocketStream = require('websocket-stream/stream');

export class ChannelConfig {
    public channelId: string;
    public channelName: string;
    public channelUrl: string;
}

export class Channel {
    public freeTime = 0;
    public config: ChannelConfig;
    public isStreamWrap = false;
    public io: SocketIO.Server;

    public constructor(config: ChannelConfig, io: SocketIO.Server) {
        this.config = config;
        this.io = io;

        try {
            this.startStreamWrap();
        } catch (e) {
            console.log(e);
        }
    }

    public startStreamWrap(): void {
        if (this.isStreamWrap) {
            return;
        }

        this.isStreamWrap = true;

        const stream = webSocketStream(this.io, {
            binary: true,
            browserBufferTimeout: 1000000
        }, {
            browserBufferTimeout: 1000000
        });

        const writeStream = fs.createWriteStream('rtsp.out');
        writeStream.on('open', (data) => {
            console.log('open: ' + data);
        });
        stream.pipe(writeStream);

        ffmpeg(this.config.channelUrl)
            .addInput('rtmp://localhost:1935/rtmplive/home')
            .on('start', (commandLine) => {
                console.log('ffmpeg command: ', commandLine);
            })
            .on('error', (err, stdout, stderr) => {
                console.log('error: ' + err.message);
                console.log('stdout: ' + stdout);
                console.log('stderr: ' + stderr);
            })
            // .on('progress', function (progress) {
            //     console.log('progressing: ', progress.percent , ' % done')
            // })
            .on('stderr', stderrLine => {
                // console.log('output: ' + stderrLine);
            })
            .on('end', () => {
                console.log('完成');
            })
            .addOptions([
                // '-vcodec h264',
                '-f flv',
                'rtmp://localhost:1935/rtmplive/home',
                '-an',
                '-vcodec copy',
                '-r 25',
                '-s 1920*1080',
                '-b:v 1024000'
                // '-vcodec libx264',
                // '-c:a aac',
                // '-bufsize 3000k',
                // '-max_muxing_queue_size 1024',
                // '-preset veryfast', // 牺牲视频质量，换取流畅性
                // '-ac 2', // 双声道输出
                // '-ar 44100' // 音频采样率
            ])
            // .noAudio()
            // .videoCodec('copy')
            .format('flv')
            // .format('h264')
            // .pipe(stream, {end: true})
            // .output('aa.mp4')  // 使用 pipe 管道 ，output 和 run 不可用
            .output(writeStream)  // 使用 pipe 管道 ，output 和 run 不可用
            .run();
    }
}
