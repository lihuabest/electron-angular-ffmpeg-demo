"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var channel_1 = require("./channel");
var SocketIO = require("socket.io");
var MediaServer = /** @class */ (function () {
    function MediaServer() {
        this.channels = [];
        this.io = SocketIO().listen(3000);
    }
    MediaServer.prototype.play = function (config) {
        var channel = this.channels.find(function (ch) { return ch.config.channelUrl === config.channelUrl; });
        if (!channel) {
            // 先生成通道
            channel = new channel_1.Channel(config, this.io);
            this.channels.push(channel);
        }
        else {
            // 推流
        }
    };
    return MediaServer;
}());
exports.MediaServer = MediaServer;
