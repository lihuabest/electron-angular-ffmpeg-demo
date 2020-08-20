"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var events_1 = require("events");
var child_process_1 = require("child_process");
var path = require("path");
var electron_1 = require("electron");
var ChannelConfig = /** @class */ (function () {
    function ChannelConfig() {
    }
    return ChannelConfig;
}());
exports.ChannelConfig = ChannelConfig;
var Channel = /** @class */ (function () {
    function Channel(config) {
        this.isLive = false;
        this.config = config;
        this.emitter = new events_1.EventEmitter();
        this.emitter.setMaxListeners(0);
    }
    Channel.prototype.startStream = function () {
        var _this = this;
        // -stimeout 10000000 超时10秒
        var ffmpegString = '-loglevel error -stimeout 10000000 -max_delay 500000 -buffer_size 102400 -i ' + this.config.channelUrl + ' -c:v copy -an -f flv pipe:1';
        if (this.config.channelUrl.indexOf('rtsp://') > -1) {
            ffmpegString = '-rtsp_transport tcp ' + ffmpegString;
        }
        var rootDir = electron_1.app.getAppPath();
        var last = path.basename(rootDir);
        if (last === 'app.asar') {
            rootDir = path.join(electron_1.app.getAppPath(), 'libs/ffmpeg.exe').replace('app.asar', 'app.asar.unpacked'); // 打包环境
        }
        else {
            rootDir = path.resolve('.', 'libs/ffmpeg.exe'); // 开发环境
        }
        // 解码
        this.ffmpeg = child_process_1.spawn(rootDir, ffmpegString.split(' '), { stdio: ['pipe', 'pipe', 'pipe', 'pipe', 'pipe'] });
        // 关闭
        this.ffmpeg.on('close', function () {
            console.log('ffmpeg close url: ' + _this.config.channelUrl);
            _this.emitter.emit('close', true); // 一些原因（拉流失败） ffmpeg关闭了
        });
        // 报错
        this.ffmpeg.stderr.on('data', function (buffer) {
            console.log('ffmpeg stderr url: ' + _this.config.channelUrl);
            console.log(buffer.toString());
        });
        // 输出
        this.ffmpeg.stdio[1].on('data', function (buffer) {
            if (Buffer.isBuffer(buffer)) {
                // 第一帧很特殊 全局保存
                if (!_this.firstBuffer) {
                    _this.firstBuffer = buffer;
                    _this.isLive = true;
                    console.log('ffmpeg start url: ' + _this.config.channelUrl);
                }
                _this.emitter.emit('data', buffer);
            }
        });
    };
    return Channel;
}());
exports.Channel = Channel;
