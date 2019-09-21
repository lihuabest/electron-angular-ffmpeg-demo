import * as SocketIO from 'socket.io';
export declare class ChannelConfig {
    channelId: string;
    channelName: string;
    channelUrl: string;
}
export declare class Channel {
    freeTime: number;
    config: ChannelConfig;
    isStreamWrap: boolean;
    io: SocketIO.Server;
    constructor(config: ChannelConfig, io: SocketIO.Server);
    startStreamWrap(): void;
}
