import { Channel, ChannelConfig } from './channel';

import * as express from 'express';
import * as http from 'http';
import * as SocketIO from 'socket.io';

export class MediaServer {
    public readonly channels: Channel[] = [];
    public io: SocketIO.Server;
    public httpServer: any;
    public app: any;
    public mp4frag: any;

    public constructor() {
        this.initIo();
    }

    /**
     * 初始化socket.io
     */
    initIo() {
        this.app = express();
        this.httpServer = http.createServer(this.app);
        this.io = SocketIO(this.httpServer);

        this.io.of('socket').on('connect', socket => {
            socket.on('msg', data => {
                this.play({
                    channelId: data.id,
                    channelName: data.name,
                    channelUrl: data.url
                }, socket);
            });

            socket.on('disconnect', () => {
                this.channels.forEach(channel => {
                    channel.removeSocket(socket);
                });
            });
        });

        this.httpServer.listen(3000, 'localhost');

        this.app.all('*', (req, res, next) => {
            res.header('Access-Control-Allow-Origin', '*');
            //Access-Control-Allow-Headers ,可根据浏览器的F12查看,把对应的粘贴在这里就行
            res.header('Access-Control-Allow-Headers', 'Content-Type');
            res.header('Access-Control-Allow-Methods', '*');
            // res.header('Content-Type', 'application/json;charset=utf-8');
            next();
        });

        this.app.get('/mp4frag.mp4', (req, res) => {
            if (this.mp4frag.initialization) {
                res.writeHead(200, {'Content-Type': 'video/mp4'});
                res.write(this.mp4frag.initialization);
                this.mp4frag.pipe(res);
                res.on('close', () => {
                    this.mp4frag.unpipe(res);
                });
            } else {
                res.sendStatus(503);
            }
        });
    }

    public play(config: ChannelConfig, socket: SocketIO.Socket) {
        let channel = this.channels.find(ch => ch.config.channelUrl === config.channelUrl);
        if (!channel) {
            // 先生成通道
            channel = new Channel(config);
            channel.addSocket(socket);

            this.channels.push(channel);
        } else {
            // 推流
            channel.addSocket(socket);
        }
    }

    playMp4frag(config: ChannelConfig) {
        let channel = this.channels.find(ch => ch.config.channelUrl === config.channelUrl);
        if (!channel) {
            // 先生成通道
            channel = new Channel(config);
            channel.startStreamWrap3();

            this.channels.push(channel);
        } else {
            // 推流
        }

        this.mp4frag = channel.getMp4frag();
    }
}
