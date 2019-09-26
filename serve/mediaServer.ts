import { Channel, ChannelConfig } from './channel';

import * as http from 'http';
import * as SocketIO from 'socket.io';

export class MediaServer {
    public readonly channels: Channel[] = [];
    public io: SocketIO.Server;


    public constructor() {
        this.initIo();
    }

    /**
     * 初始化socket.io
     */
    initIo() {
        const httpServer = http.createServer();
        this.io = SocketIO(httpServer);

        this.io.on('connect', socket => {
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

        httpServer.listen(3000, 'localhost');
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
}
