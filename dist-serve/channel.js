"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// const ffmpeg = require('fluent-ffmpeg');
var Ffmpeg = require("fluent-ffmpeg");
var fs = require("fs");
var spawn = require('child_process').spawn;
var Mp4Frag = require('mp4frag');
var ChannelConfig = /** @class */ (function () {
    function ChannelConfig() {
    }
    return ChannelConfig;
}());
exports.ChannelConfig = ChannelConfig;
var Channel = /** @class */ (function () {
    function Channel(config) {
        this.freeTime = 0;
        this.sockets = [];
        this.mp4frag = new Mp4Frag({ bufferListSize: 3 });
        this.config = config;
    }
    Channel.prototype.startStreamWrap = function () {
        // 可以把内容存储为文件
        var writeStream = fs.createWriteStream('rtsp.mp4');
        writeStream.on('open', function (data) {
            console.log('open: ' + data);
        });
        Ffmpeg(this.config.channelUrl)
            // .addInput('rtmp://localhost:1935/rtmplive/home')
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
            // 'rtmp://localhost:1935/rtmplive/home',
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
    Channel.prototype.startStreamWrap2 = function () {
        var _this = this;
        var inter;
        inter && clearInterval(inter);
        this.ffmpeg = Ffmpeg(this.config.channelUrl)
            .on('start', function (commandLine) {
            console.log('ffmpeg start: ', commandLine);
        })
            .on('error', function (err, stdout, stderr) {
            console.log('ffmpeg error: ' + err.message);
            // console.log('stdout: ' + stdout);
            // console.log('stderr: ' + stderr);
            inter && clearInterval(inter);
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
        // '-f flv',
        // '-an',
        // '-vcodec copy',
        // '-r 25',
        // '-s 1920*1080',
        // '-b:v 1024000'
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
            .format('mjpeg');
        // .format('h264')
        // .pipe(stream, {end: true})
        // .output('aa.mp4')  // 使用 pipe 管道 ，output 和 run 不可用
        var ffstream = this.ffmpeg.pipe();
        ffstream.on('data', function (data) {
            var frame = Buffer.from(data);
            var now = new Date().getTime();
            _this.sockets.forEach(function (socket) {
                var timestamp = socket['timestamp'] ? socket['timestamp'] : 0;
                if (now - timestamp > 250) {
                    socket['timestamp'] = now;
                    socket.emit('msg', { body: frame, timestamp: now });
                }
            });
        });
        // const send = (frame) => {
        //     this.sockets.forEach(socket => {
        //         socket.emit('msg', { body: frame });
        //     });
        // };
        // 发送数据
        // inter = setInterval(() => {
        //     const now = new Date().getTime();
        //     this.sockets.forEach(socket => {
        //         const timestamp = socket['timestamp'] ? socket['timestamp'] : 0;
        //         if (now - timestamp > 200) {
        //             socket.emit('msg', { body: null, timestamp: now });
        //         } else {
        //             socket.emit('msg', { body: frame, timestamp: now });
        //         }
        //     });
        // }, 1000 / 15);
    };
    /**
     * 添加socket
     * @param socket
     */
    Channel.prototype.addSocket = function (socket) {
        this.sockets.push(socket);
        // 开始解码
        if (!this.ffmpeg) {
            this.startStreamWrap2();
        }
    };
    /**
     * 移除socket
     * @param socket
     */
    Channel.prototype.removeSocket = function (socket) {
        this.sockets = this.sockets.filter(function (s) { return s !== socket; });
        if (this.sockets.length <= 0) {
            // 关闭ffmpeg
            this.ffmpeg && this.ffmpeg.kill('SIGKILL');
            this.ffmpeg = null;
        }
    };
    Channel.prototype.startStreamWrap3 = function () {
        // -loglevel info quiet debug 日志等级
        var ffmpeg = spawn('ffmpeg', ['-loglevel', 'debug', '-stimeout', '30000000', '-probesize', '64', '-analyzeduration', '100000', '-reorder_queue_size', '5', '-rtsp_transport', 'tcp', '-i', this.config.channelUrl, '-an', '-c:v', 'copy', '-f', 'mp4', '-movflags', '+frag_keyframe+empty_moov+default_base_moof', '-metadata', 'title="ip 216.4.116.29"', '-reset_timestamps', '1', 'pipe:1'], 
        // {stdio: ['ignore', 'pipe', 'pipe'], cwd: process.cwd()}
        { stdio: ['ignore', 'pipe', 'pipe'], cwd: process.cwd() });
        // 注册错误
        ffmpeg.stderr.on('data', function (data) {
            var error = data.toString();
            console.log('ffmpeg stderr: ', error);
        });
        ffmpeg.stdio[1].pipe(this.mp4frag);
    };
    /**
     * 获取mp4frag
     */
    Channel.prototype.getMp4frag = function () {
        return this.mp4frag;
    };
    return Channel;
}());
exports.Channel = Channel;
