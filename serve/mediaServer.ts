import { Channel, ChannelConfig } from './channel';

import * as SocketIO from 'socket.io';

export class MediaServer {
    public readonly channels: Channel[] = [];
    public io: SocketIO.Server;

    public constructor() {
        this.io = SocketIO().listen(3000);
    }

    public play(config: ChannelConfig) {
        let channel = this.channels.find(ch => ch.config.channelUrl === config.channelUrl);
        if (!channel) {
            // 先生成通道
            channel = new Channel(config, this.io);
            this.channels.push(channel);
        } else {
            // 推流
        }
    }
}
