"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var channel_1 = require("./channel");
var http = require("http");
var SocketIO = require("socket.io");
var MediaServer = /** @class */ (function () {
    function MediaServer() {
        this.channels = [];
        this.initIo();
    }
    /**
     * 初始化socket.io
     */
    MediaServer.prototype.initIo = function () {
        var _this = this;
        var httpServer = http.createServer();
        this.io = SocketIO(httpServer);
        this.io.on('connect', function (socket) {
            socket.on('msg', function (data) {
                _this.play({
                    channelId: data.id,
                    channelName: data.name,
                    channelUrl: data.url
                }, socket);
            });
            socket.on('disconnect', function () {
                _this.channels.forEach(function (channel) {
                    channel.removeSocket(socket);
                });
            });
        });
        httpServer.listen(3000, 'localhost');
    };
    MediaServer.prototype.play = function (config, socket) {
        var channel = this.channels.find(function (ch) { return ch.config.channelUrl === config.channelUrl; });
        if (!channel) {
            // 先生成通道
            channel = new channel_1.Channel(config);
            channel.addSocket(socket);
            this.channels.push(channel);
        }
        else {
            // 推流
            channel.addSocket(socket);
        }
    };
    return MediaServer;
}());
exports.MediaServer = MediaServer;
