"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var ffmpeg = require('fluent-ffmpeg');
var fs = require("fs");
var webSocketStream = require('websocket-stream/stream');
var ChannelConfig = /** @class */ (function () {
    function ChannelConfig() {
    }
    return ChannelConfig;
}());
exports.ChannelConfig = ChannelConfig;
var Channel = /** @class */ (function () {
    function Channel(config, io) {
        this.freeTime = 0;
        this.isStreamWrap = false;
        this.config = config;
        this.io = io;
        try {
            this.startStreamWrap();
        }
        catch (e) {
            console.log(e);
        }
    }
    Channel.prototype.startStreamWrap = function () {
        if (this.isStreamWrap) {
            return;
        }
        this.isStreamWrap = true;
        var stream = webSocketStream(this.io, {
            binary: true,
            browserBufferTimeout: 1000000
        }, {
            browserBufferTimeout: 1000000
        });
        var writeStream = fs.createWriteStream('rtsp.out');
        writeStream.on('open', function (data) {
            console.log('open: ' + data);
        });
        stream.pipe(writeStream);
        ffmpeg(this.config.channelUrl)
            .addInput('rtmp://localhost:1935/rtmplive/home')
            .on('start', function (commandLine) {
            console.log('ffmpeg command: ', commandLine);
        })
            .on('error', function (err, stdout, stderr) {
            console.log('error: ' + err.message);
            console.log('stdout: ' + stdout);
            console.log('stderr: ' + stderr);
        })
            // .on('progress', function (progress) {
            //     console.log('progressing: ', progress.percent , ' % done')
            // })
            .on('stderr', function (stderrLine) {
            // console.log('output: ' + stderrLine);
        })
            .on('end', function () {
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
            .output(writeStream) // 使用 pipe 管道 ，output 和 run 不可用
            .run();
    };
    return Channel;
}());
exports.Channel = Channel;
