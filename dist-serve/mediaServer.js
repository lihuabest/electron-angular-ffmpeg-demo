"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var channel_1 = require("./channel");
var express = require("express");
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
        this.app = express();
        this.httpServer = http.createServer(this.app);
        this.io = SocketIO(this.httpServer);
        this.io.of('socket').on('connect', function (socket) {
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
        this.httpServer.listen(3000, 'localhost');
        this.app.all('*', function (req, res, next) {
            res.header('Access-Control-Allow-Origin', '*');
            //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            res.header('Access-Control-Allow-Methods', '*');
            // res.header('Content-Type', 'application/json;charset=utf-8');
            next();
        });
        this.app.get('/mp4frag.mp4', function (req, res) {
            if (_this.mp4frag.initialization) {
                res.writeHead(200, { 'Content-Type': 'video/mp4' });
                res.write(_this.mp4frag.initialization);
                _this.mp4frag.pipe(res);
                res.on('close', function () {
                    _this.mp4frag.unpipe(res);
                });
            }
            else {
                res.sendStatus(503);
            }
        });
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
    MediaServer.prototype.playMp4frag = function (config) {
        var channel = this.channels.find(function (ch) { return ch.config.channelUrl === config.channelUrl; });
        if (!channel) {
            // 先生成通道
            channel = new channel_1.Channel(config);
            channel.startStreamWrap3();
            this.channels.push(channel);
        }
        else {
            // 推流
        }
        this.mp4frag = channel.getMp4frag();
    };
    return MediaServer;
}());
exports.MediaServer = MediaServer;
